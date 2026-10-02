import { useEffect, useState } from "react";
import type { RiskLevel } from "./scan-engine";

export type ScanKind = "sms" | "qr" | "link" | "mail";

export type ScanEntry = {
  id: string;
  kind: ScanKind;
  subject: string;
  score: number;
  level: RiskLevel;
  at: number;
};

export type Report = {
  id: string;
  kind: ScanKind;
  title: string;
  description: string;
  count: number;
  level: RiskLevel;
  at: number;
};

export const SEED_REPORTS: Report[] = [
  { id: "r1", kind: "sms", title: "Fake SBI KYC SMS", description: "Message claims the account will be blocked today unless KYC is updated through a link.", count: 247, level: "high", at: 0 },
  { id: "r2", kind: "link", title: "Fake Electricity Bill Link", description: "Threatens night-time disconnection and links to a fake bill-payment page.", count: 183, level: "high", at: 0 },
  { id: "r3", kind: "qr", title: "Fake UPI Cashback QR", description: "QR promises cashback but opens a collect request that debits money instead.", count: 91, level: "medium", at: 0 },
  { id: "r4", kind: "sms", title: "Courier Address Update Scam", description: "Parcel-on-hold SMS asking for a small redelivery fee via a payment link.", count: 64, level: "medium", at: 0 },
  { id: "r5", kind: "link", title: "Job Offer Telegram Task Scam", description: "Shortened link inviting users into paid task groups with fake earnings.", count: 52, level: "high", at: 0 },
];

type State = { scans: ScanEntry[]; reports: Report[] };

const KEY = "scamshield-state-v1";
let state: State = { scans: [], reports: SEED_REPORTS };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function hydrate() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      state = { scans: parsed.scans ?? [], reports: parsed.reports?.length ? parsed.reports : SEED_REPORTS };
      emit();
    }
  } catch {
    /* ignore */
  }
}

let signedInUserId: string | null = null;
let localScans: ScanEntry[] | null = null;

async function syncUser(userId: string | null) {
  if (userId === signedInUserId) return;
  const { supabase } = await import("@/integrations/supabase/client");
  if (userId) {
    if (!signedInUserId) localScans = state.scans;
    signedInUserId = userId;
    const { data } = await supabase
      .from("scans")
      .select("id,kind,subject,score,level,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    state = {
      ...state,
      scans: (data ?? []).map((r) => ({
        id: r.id, kind: r.kind as ScanKind, subject: r.subject, score: r.score,
        level: r.level as RiskLevel, at: new Date(r.created_at).getTime(),
      })),
    };
  } else {
    signedInUserId = null;
    state = { ...state, scans: localScans ?? [] };
    localScans = null;
  }
  emit();
}

let authWired = false;
async function wireAuth() {
  if (authWired || typeof window === "undefined") return;
  authWired = true;
  const { supabase } = await import("@/integrations/supabase/client");
  const { data } = await supabase.auth.getSession();
  await syncUser(data.session?.user.id ?? null);
  supabase.auth.onAuthStateChange((_e, s) => {
    void syncUser(s?.user.id ?? null);
  });
}

export function recordScan(entry: Omit<ScanEntry, "id" | "at">) {
  state = { ...state, scans: [{ ...entry, id: crypto.randomUUID(), at: Date.now() }, ...state.scans].slice(0, 50) };
  if (signedInUserId) {
    const uid = signedInUserId;
    void import("@/integrations/supabase/client").then(({ supabase }) =>
      supabase.from("scans").insert({ user_id: uid, kind: entry.kind, subject: entry.subject.slice(0, 500), score: entry.score, level: entry.level }),
    );
  } else persist();
  emit();
}

export function addReport(input: { kind: ScanKind; title: string; description: string; level: RiskLevel }) {
  state = {
    ...state,
    reports: [{ ...input, id: crypto.randomUUID(), count: 1, at: Date.now() }, ...state.reports],
  };
  persist();
  emit();
}

export function useStore() {
  const [snapshot, setSnapshot] = useState<State>({ scans: [], reports: SEED_REPORTS });

  useEffect(() => {
    if (!signedInUserId) hydrate();
    void wireAuth();
    const update = () => setSnapshot(state);
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  return snapshot;
}
