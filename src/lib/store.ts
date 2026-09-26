import { useEffect, useState } from "react";
import type { RiskLevel } from "./scan-engine";

export type ScanKind = "sms" | "qr" | "link";

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

export function recordScan(entry: Omit<ScanEntry, "id" | "at">) {
  state = { ...state, scans: [{ ...entry, id: crypto.randomUUID(), at: Date.now() }, ...state.scans].slice(0, 50) };
  persist();
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
    hydrate();
    const update = () => setSnapshot(state);
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  return snapshot;
}
