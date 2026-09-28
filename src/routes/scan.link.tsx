import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ScanProgress } from "@/components/ScanProgress";
import { ScanResultView } from "@/components/ScanResultView";
import { analyzeLink, DEMO, LINK_CHECKS, type ScanResult } from "@/lib/scan-engine";
import { recordScan } from "@/lib/store";

export const Route = createFileRoute("/scan/link")({
  head: () => ({
    meta: [
      { title: "Smart Link Scanner — SafeScan AI" },
      {
        name: "description",
        content: "Paste a suspicious URL and get a trust score, threat breakdown and a safe recommended action.",
      },
      { property: "og:title", content: "Smart Link Scanner — SafeScan AI" },
      {
        property: "og:description",
        content: "Detect look-alike bank domains, hidden redirects and phishing pages before you click.",
      },
    ],
  }),
  component: LinkScanner,
});

function LinkScanner() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  function start() {
    const value = url.trim();
    if (!value || value.length > 300 || !/\.[a-z]{2,}/i.test(value)) {
      setError("Enter a valid web address, e.g. https://sbi-update-kyc.com");
      return;
    }
    setError("");
    setResult(analyzeLink(value));
    setPhase("scanning");
  }

  function finish() {
    setPhase("done");
    if (result) recordScan({ kind: "link", subject: result.subject, score: result.score, level: result.level });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader
        icon="🔗"
        title="Smart Link Scanner"
        subtitle="Paste a link from an SMS, email or WhatsApp message. We check the domain, certificate, age, redirects and community reports."
      />

      {phase === "idle" && (
        <div className="glass mx-auto max-w-2xl rounded-2xl p-7">
          <label htmlFor="url" className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Enter URL
          </label>
          <input
            id="url"
            value={url}
            maxLength={300}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && start()}
            placeholder="https://sbi-update-kyc.com"
            className="mt-3 w-full rounded-xl border border-input bg-background/60 px-4 py-3 font-mono text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          <button
            onClick={start}
            className="glow-primary mt-5 w-full rounded-xl bg-primary py-3 font-semibold tracking-wide text-primary-foreground"
          >
            SCAN LINK
          </button>
          <button
            onClick={() => setUrl(DEMO.link)}
            className="mt-3 w-full rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Use demo link: {DEMO.link}
          </button>
        </div>
      )}

      {phase === "scanning" && (
        <div className="mx-auto max-w-2xl">
          <ScanProgress
            title="Analyzing URL..."
            checks={LINK_CHECKS}
            failing={result && result.level !== "low" ? "Suspicious domain detected" : null}
            onDone={finish}
          />
        </div>
      )}

      {phase === "done" && result && (
        <ScanResultView
          result={result}
          onReset={() => {
            setPhase("idle");
            setResult(null);
            setUrl("");
          }}
        />
      )}
    </div>
  );
}
