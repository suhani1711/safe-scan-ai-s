import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiCheck, type AiVerdict } from "@/lib/ai-check.functions";

const TONE = { safe: "text-safe", suspicious: "text-warn", scam: "text-danger" } as const;

export function AiOpinion({ content, ruleScore }: { content: string; ruleScore: number }) {
  const run = useServerFn(aiCheck);
  const [data, setData] = useState<AiVerdict | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    run({ data: { content: content.slice(0, 4000), ruleScore } })
      .then((d) => live && setData(d))
      .catch((e) => live && setError(e instanceof Error ? e.message : "AI check failed."));
    return () => {
      live = false;
    };
  }, [content, ruleScore, run]);

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold">🤖 Gemini AI second opinion</h3>
      {!data && !error && <p className="mt-3 animate-pulse text-sm text-muted-foreground">Asking the AI analyst…</p>}
      {error && <p className="mt-3 text-sm text-muted-foreground">{error} The rule-based result above still applies.</p>}
      {data && (
        <div className="mt-3 space-y-2 text-sm">
          <p className={`font-mono uppercase ${TONE[data.verdict]}`}>
            {data.verdict} · {data.confidence}% confidence
          </p>
          <p>{data.summary}</p>
          <p className="text-muted-foreground">👉 {data.advice}</p>
        </div>
      )}
    </div>
  );
}
