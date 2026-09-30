import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { ScanResultView } from "@/components/ScanResultView";
import { analyzeLink, analyzeSms, type ScanResult } from "@/lib/scan-engine";
import { recordScan } from "@/lib/store";

export const Route = createFileRoute("/share")({
  validateSearch: z.object({ title: z.string().optional(), text: z.string().optional(), url: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Share to SafeScan — SafeScan AI" },
      { name: "description", content: "Share any message or link from your phone to SafeScan and get an instant scam check." },
      { property: "og:title", content: "Share to SafeScan — SafeScan AI" },
      { property: "og:description", content: "Instant scam check for anything shared from your phone." },
    ],
  }),
  component: Share,
});

function Share() {
  const { title, text, url } = Route.useSearch();
  const shared = [title, text, url].filter(Boolean).join(" ").trim();
  const [input, setInput] = useState(shared);
  const [result, setResult] = useState<ScanResult | null>(null);

  function scan(value: string) {
    const v = value.trim();
    if (!v) return;
    const isLink = /^\S+\.\S+$/.test(v) && !v.includes(" ");
    const r = isLink ? analyzeLink(v) : analyzeSms(v.slice(0, 2000));
    setResult(r);
    recordScan({ kind: isLink ? "link" : "sms", subject: r.subject, score: r.score, level: r.level });
  }

  useEffect(() => {
    if (shared) scan(shared);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader
        icon="📲"
        title="Share to SafeScan"
        subtitle="Install SafeScan on your phone, then use your phone's Share button on any message or link and pick SafeScan."
      />
      {result ? (
        <ScanResultView result={result} onReset={() => { setResult(null); setInput(""); }} />
      ) : (
        <div className="glass mx-auto max-w-2xl rounded-2xl p-7">
          <textarea
            value={input}
            rows={5}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a message or link"
            className="w-full resize-none rounded-xl border border-input bg-background/60 px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button onClick={() => scan(input)} className="glow-primary mt-4 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">
            CHECK NOW
          </button>
          <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p><b className="text-foreground">Android (Chrome):</b> menu ⋮ → "Install app". SafeScan then appears in your Share menu.</p>
            <p><b className="text-foreground">iPhone (Safari):</b> Share → "Add to Home Screen". iPhone doesn't let web apps join the Share menu, so copy and paste here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
