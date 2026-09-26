import type { Factor } from "@/lib/scan-engine";

export function ThreatBreakdown({ factors }: { factors: Factor[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Threat Breakdown</h3>
      <div className="space-y-3">
        {factors.map((f) => {
          const tone = f.score > 60 ? "bg-danger" : f.score > 35 ? "bg-warn" : "bg-safe";
          const text = f.score > 60 ? "text-danger" : f.score > 35 ? "text-warn" : "text-safe";
          return (
            <div key={f.label} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5">
              <span className="text-sm text-foreground/90">{f.label}</span>
              <span className={`font-mono text-xs font-semibold ${text}`}>{f.note}</span>
              <div className="col-span-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${tone} transition-[width] duration-700 ease-out`}
                  style={{ width: `${Math.max(6, f.score)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
