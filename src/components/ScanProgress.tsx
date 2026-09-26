import { useEffect, useState } from "react";

export function ScanProgress({
  title,
  checks,
  failing,
  onDone,
}: {
  title: string;
  checks: string[];
  failing: string | null;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= checks.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 520);
    return () => clearTimeout(t);
  }, [step, checks.length, onDone]);

  return (
    <div className="glass scanline rounded-2xl p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-sweep bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
      <p className="font-mono text-sm text-primary">🔍 {title}</p>
      <ul className="mt-6 space-y-3">
        {checks.map((c, i) => {
          const done = i < step;
          const isFail = done && i === checks.length - 1 && failing;
          return (
            <li
              key={c}
              className={`flex items-center gap-3 font-mono text-sm transition-opacity ${done ? "opacity-100" : "opacity-30"}`}
            >
              <span className={isFail ? "text-danger" : done ? "text-safe" : "text-muted-foreground"}>
                {done ? (isFail ? "✗" : "✓") : "○"}
              </span>
              <span className={isFail ? "text-danger" : ""}>{isFail ? failing : c}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${(step / checks.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
