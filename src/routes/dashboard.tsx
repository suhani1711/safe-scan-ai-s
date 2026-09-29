import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { RISK_META } from "@/lib/scan-engine";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Protection Dashboard — SafeScan AI" },
      {
        name: "description",
        content: "Your scan history, threats blocked and detected Scam DNA patterns in one cybersecurity dashboard.",
      },
      { property: "og:title", content: "Protection Dashboard — SafeScan AI" },
      {
        property: "og:description",
        content: "Track today's SMS, QR and link scans plus the threats SafeScan AI blocked for you.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { scans, reports } = useStore();

  const count = (k: string) => scans.filter((s) => s.kind === k).length;
  const byLevel = (l: string) => scans.filter((s) => s.level === l).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        icon="📊"
        title="Hello, Suhani 👋"
        subtitle="Your protection status and everything SafeScan AI checked for you."
      />

      <div className="glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Protection status</p>
          <p className="mt-2 flex items-center gap-2 font-display text-2xl font-bold text-safe">
            <span className="h-3 w-3 rounded-full bg-safe animate-pulse-ring" /> ACTIVE
          </p>
        </div>
        <Link
          to="/scan/link"
          className="glow-primary rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
        >
          Scan Something
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass rounded-2xl p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Your scans</h2>
          <div className="mt-5 space-y-3">
            {[
              ["📱 SMS", count("sms")],
              ["🔗 Links", count("link")],
              ["🔳 QR", count("qr")],
              ["📧 Mail", count("mail")],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                <span className="text-sm">{label}</span>
                <span className="font-display text-xl font-bold tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Threats blocked</h2>
          <div className="mt-5 space-y-3">
            {(["high", "medium", "low"] as const).map((l) => (
              <div key={l} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                <span className={`text-sm ${RISK_META[l].text}`}>
                  {RISK_META[l].tone} {RISK_META[l].label}
                </span>
                <span className="font-display text-xl font-bold tabular-nums">{byLevel(l)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="glass mt-6 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">🧬 Scam DNA Detected</h2>
        <p className="mt-2 font-mono text-sm text-primary">Fake KYC + Urgency + Banking + Link</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Hundreds of different messages share the same underlying template. SafeScan AI groups them into one
          family, so a brand-new variation is still recognised on first sight.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["reports", 247],
            ["variations", 18],
            ["domains", 6],
            ["banks impersonated", 3],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl bg-secondary/60 p-4">
              <p className="font-display text-2xl font-bold">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass mt-6 rounded-2xl p-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Recent activity</h2>
        {scans.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No scans yet. Try the{" "}
            <Link to="/scan/link" className="text-primary underline">
              Link Scanner
            </Link>{" "}
            with a suspicious URL.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {scans.slice(0, 8).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3">
                <span className="truncate text-sm">
                  {s.kind === "sms" ? "📱" : s.kind === "qr" ? "🔳" : s.kind === "mail" ? "📧" : "🔗"} {s.subject}
                </span>
                <span className={`font-mono text-xs font-semibold ${RISK_META[s.level].text}`}>{s.score}/100</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {reports.length} scam patterns in your community database.
      </p>
    </div>
  );
}
