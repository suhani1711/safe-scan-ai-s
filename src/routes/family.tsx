import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family Protection Mode — ScamShield AI" },
      {
        name: "description",
        content: "Shield parents and grandparents, and send an emergency alert to a guardian when a high-risk scam appears.",
      },
      { property: "og:title", content: "Family Protection Mode — ScamShield AI" },
      {
        property: "og:description",
        content: "Turn on protection for the people most targeted by scams and alert a guardian instantly.",
      },
    ],
  }),
  component: Family,
});

type Member = { id: string; name: string; emoji: string; relation: string; on: boolean; guardian: boolean };

const INITIAL: Member[] = [
  { id: "m1", name: "Grandma", emoji: "👵", relation: "Uses WhatsApp & UPI daily", on: true, guardian: false },
  { id: "m2", name: "Grandpa", emoji: "👴", relation: "Receives bank SMS alerts", on: true, guardian: false },
  { id: "m3", name: "Mom", emoji: "👩", relation: "Pays shop QRs regularly", on: false, guardian: true },
];

function Family() {
  const [members, setMembers] = useState(INITIAL);
  const [alerts, setAlerts] = useState(true);
  const [sent, setSent] = useState(false);

  const guardian = members.find((m) => m.guardian);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader
        icon="👨‍👩‍👧"
        title="Family Protection"
        subtitle="Scams hit elders hardest. Keep protection on for them and let a trusted guardian know the moment something high risk appears."
      />

      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <section className="space-y-4">
          {members.map((m) => (
            <div key={m.id} className="glass flex items-center justify-between gap-4 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{m.emoji}</span>
                <div>
                  <p className="font-display text-lg font-semibold">
                    {m.name} {m.guardian && <span className="font-mono text-xs text-primary">GUARDIAN</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.relation}</p>
                </div>
              </div>
              <button
                onClick={() =>
                  setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, on: !x.on } : x)))
                }
                className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs transition-colors ${
                  m.on ? "border-safe/50 text-safe" : "border-border text-muted-foreground"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${m.on ? "bg-safe" : "bg-muted-foreground"}`} />
                {m.on ? "PROTECTION ON" : "OFF"}
              </button>
            </div>
          ))}

          <div className="glass flex items-center justify-between gap-4 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📱</span>
              <div>
                <p className="font-display text-lg font-semibold">Emergency Alerts</p>
                <p className="text-xs text-muted-foreground">Notify the guardian on every high-risk detection</p>
              </div>
            </div>
            <button
              onClick={() => setAlerts((a) => !a)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs transition-colors ${
                alerts ? "border-safe/50 text-safe" : "border-border text-muted-foreground"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${alerts ? "bg-safe" : "bg-muted-foreground"}`} />
              {alerts ? "ON" : "OFF"}
            </button>
          </div>
        </section>

        <aside className="glass h-fit rounded-2xl border-danger/40 p-6">
          <p className="font-mono text-sm font-semibold text-danger">🚨 HIGH-RISK SCAM DETECTED</p>
          <p className="mt-3 text-sm text-muted-foreground">
            A fake SBI KYC link was opened on a protected device. An emergency alert can be sent to your
            selected family guardian{guardian ? ` (${guardian.name})` : ""}.
          </p>
          <button
            disabled={!alerts}
            onClick={() => {
              setSent(true);
              setTimeout(() => setSent(false), 4000);
            }}
            className="mt-5 w-full rounded-xl bg-danger py-3 font-semibold text-destructive-foreground disabled:opacity-40"
          >
            SEND ALERT
          </button>
          {sent && (
            <p className="mt-3 text-center text-xs text-safe">
              ✓ Alert sent to {guardian?.name ?? "guardian"} with the scan details.
            </p>
          )}
          {!alerts && (
            <p className="mt-3 text-center text-xs text-warn">Emergency alerts are switched off.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
