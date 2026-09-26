import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScamShield AI — Scan Before You Trust" },
      {
        name: "description",
        content:
          "Check a suspicious SMS, QR code or link before you click or pay. AI trust scores, threat breakdowns and community scam intelligence.",
      },
      { property: "og:title", content: "ScamShield AI — Scan Before You Trust" },
      {
        property: "og:description",
        content: "AI-powered protection against fake SMS, malicious QR codes and phishing links.",
      },
    ],
  }),
  component: Index,
});

const SCANNERS = [
  {
    to: "/scan/sms" as const,
    icon: "📱",
    title: "SMS Scam Detector",
    body: "Detect fake KYC alerts, banking scams, lottery and refund scams hidden in text messages.",
    cta: "Scan SMS",
  },
  {
    to: "/scan/qr" as const,
    icon: "🔳",
    title: "QR Trust Check",
    body: "Decode a payment QR and check whether the UPI handle and merchant identity are genuine.",
    cta: "Scan QR",
  },
  {
    to: "/scan/link" as const,
    icon: "🔗",
    title: "Smart Link Scanner",
    body: "Spot look-alike domains, fake bank websites, hidden redirects and phishing pages.",
    cta: "Check Link",
  },
];

const FLOW = ["Scan", "AI Analysis", "Community Check", "Trust Score", "Threat Breakdown", "Safe Action"];

function Index() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <section className="py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 font-mono text-xs text-primary">
          🛡️ AI PROTECTION ACTIVE
        </span>
        <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
          <span className="text-gradient">ScamShield AI</span>
          <span className="mt-2 block text-3xl text-foreground md:text-5xl">Scan Before You Trust</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          AI-powered protection against fake SMS, malicious QR codes and phishing links. Check anything
          suspicious before you click or pay.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {SCANNERS.map((s, i) => (
            <Link
              key={s.to}
              to={s.to}
              className={
                i === 2
                  ? "glow-primary rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                  : "glass rounded-xl px-6 py-3 font-semibold transition-transform hover:-translate-y-0.5"
              }
            >
              {s.icon} {s.cta}
            </Link>
          ))}
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Your digital safety shield
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {SCANNERS.map((s) => (
          <Link
            key={s.title}
            to={s.to}
            className="glass group rounded-2xl p-6 transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl">{s.icon}</span>
            <h2 className="mt-4 font-display text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            <span className="mt-5 inline-block font-mono text-xs text-primary group-hover:underline">
              {s.cta} →
            </span>
          </Link>
        ))}
      </section>

      <section className="glass mt-16 rounded-2xl p-8">
        <h2 className="text-center font-display text-2xl font-semibold">How a scan works</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {FLOW.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <span className="rounded-xl border border-border bg-secondary/60 px-4 py-2 font-mono text-xs">
                {String(i + 1).padStart(2, "0")} {step}
              </span>
              {i < FLOW.length - 1 && <span className="text-primary">→</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-5 md:grid-cols-3">
        {[
          {
            to: "/community" as const,
            icon: "🚨",
            title: "Community Scam Intelligence",
            body: "One report protects everyone. Live feed of scams reported by other users.",
          },
          {
            to: "/family" as const,
            icon: "👨‍👩‍👧",
            title: "Family Protection Mode",
            body: "Guard parents and grandparents, and fire an emergency alert on high-risk scams.",
          },
          {
            to: "/dashboard" as const,
            icon: "📊",
            title: "Protection Dashboard",
            body: "Your scan history, threats blocked and Scam DNA patterns in one place.",
          },
        ].map((c) => (
          <Link key={c.title} to={c.to} className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1">
            <span className="text-2xl">{c.icon}</span>
            <h3 className="mt-3 font-display text-lg font-semibold">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
