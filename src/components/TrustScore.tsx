import { RISK_META, type RiskLevel } from "@/lib/scan-engine";
import { useEffect, useState } from "react";

export function TrustScore({ score, level, size = 220 }: { score: number; level: RiskLevel; size?: number }) {
  const [shown, setShown] = useState(0);
  const meta = RISK_META[level];

  useEffect(() => {
    let frame = 0;
    const steps = 45;
    const id = setInterval(() => {
      frame += 1;
      setShown(Math.round((score * frame) / steps));
      if (frame >= steps) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [score]);

  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const stroke = level === "high" ? "var(--danger)" : level === "medium" ? "var(--warn)" : "var(--safe)";

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">Trust Score</p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={12} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * shown) / 100}
            style={{ transition: "stroke-dashoffset 80ms linear", filter: `drop-shadow(0 0 12px ${stroke})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-6xl font-bold tabular-nums">{shown}</span>
          <span className="font-mono text-sm text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-sm font-semibold ${meta.text}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot} animate-pulse-ring`} />
        {meta.label}
      </span>
    </div>
  );
}
