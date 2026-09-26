import { Link } from "@tanstack/react-router";
import { RISK_META, type ScanResult } from "@/lib/scan-engine";
import { TrustScore } from "./TrustScore";
import { ThreatBreakdown } from "./ThreatBreakdown";

export function ScanResultView({
  result,
  onReset,
  resetLabel = "← Scan Another",
}: {
  result: ScanResult;
  onReset: () => void;
  resetLabel?: string;
}) {
  const meta = RISK_META[result.level];

  return (
    <div className="animate-rise space-y-6">
      <div className="glass grid gap-8 rounded-2xl p-8 md:grid-cols-[auto_1fr] md:items-center">
        <TrustScore score={result.score} level={result.level} />
        <div className="space-y-5">
          <div>
            <p className={`font-mono text-sm ${meta.text}`}>
              {meta.tone} {meta.label}
            </p>
            <h2 className="mt-1 text-2xl font-bold">{result.headline}</h2>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{result.subject}</p>
          </div>
          <ThreatBreakdown factors={result.factors} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold">
            {result.level === "low" ? "Why this looks safe" : "Why is this risky?"}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {result.reasons.map((r) => (
              <li key={r} className="flex gap-2.5 text-foreground/90">
                <span className="text-danger">❌</span>
                <span>{r}</span>
              </li>
            ))}
            {result.positives.map((p) => (
              <li key={p} className="flex gap-2.5 text-muted-foreground">
                <span className="text-safe">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          {result.meta && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Scan Details</h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                {result.meta.map((m) => (
                  <div key={m.label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{m.label}</dt>
                    <dd className="break-all text-right font-mono text-xs">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold">🛡️ Recommended Action</h3>
            <p className={`mt-3 text-sm font-medium ${meta.text}`}>
              {meta.tone} {result.action}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={onReset}
                className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                {resetLabel}
              </button>
              <Link
                to="/community"
                className="glow-primary rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Report Scam
              </Link>
            </div>
          </div>
        </div>
      </div>

      {result.dna && (
        <div className="glass rounded-2xl border-danger/30 p-6">
          <h3 className="font-display text-lg font-semibold">🧬 Scam DNA Detected</h3>
          <p className="mt-2 font-mono text-sm text-primary">Pattern: {result.dna.pattern}</p>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["reports", result.dna.reports],
              ["variations", result.dna.variations],
              ["domains", result.dna.domains],
              ["banks impersonated", result.dna.banks],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-secondary/60 p-4">
                <p className="font-display text-2xl font-bold text-foreground">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
