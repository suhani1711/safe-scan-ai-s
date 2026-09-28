import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ScanProgress } from "@/components/ScanProgress";
import { ScanResultView } from "@/components/ScanResultView";
import { analyzeSms, DEMO, SMS_CHECKS, type ScanResult } from "@/lib/scan-engine";
import { recordScan } from "@/lib/store";

export const Route = createFileRoute("/scan/sms")({
  head: () => ({
    meta: [
      { title: "SMS Scam Detector — SafeScan AI" },
      {
        name: "description",
        content: "Paste a suspicious SMS and see the risk level, trust score and exactly why it is dangerous.",
      },
      { property: "og:title", content: "SMS Scam Detector — SafeScan AI" },
      {
        property: "og:description",
        content: "Detect fake KYC alerts, banking scams, lottery and refund scams hidden in text messages.",
      },
    ],
  }),
  component: SmsScanner,
});

function SmsScanner() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  function start() {
    const value = text.trim();
    if (value.length < 10) {
      setError("Paste at least a few words from the message.");
      return;
    }
    setError("");
    setResult(analyzeSms(value.slice(0, 2000)));
    setPhase("scanning");
  }

  function finish() {
    setPhase("done");
    if (result) recordScan({ kind: "sms", subject: result.subject, score: result.score, level: result.level });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader
        icon="📱"
        title="SMS Scam Detector"
        subtitle="Paste the suspicious message. Our AI reads the language, links and sender pattern the way a fraud analyst would."
      />

      {phase === "idle" && (
        <div className="glass mx-auto max-w-2xl rounded-2xl p-7">
          <label htmlFor="sms" className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Paste suspicious SMS
          </label>
          <textarea
            id="sms"
            value={text}
            rows={6}
            maxLength={2000}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your SBI account will be blocked... Update your KYC immediately... Click here: sbi-update-kyc.com"
            className="mt-3 w-full resize-none rounded-xl border border-input bg-background/60 px-4 py-3 font-mono text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          <button
            onClick={start}
            className="glow-primary mt-4 w-full rounded-xl bg-primary py-3 font-semibold tracking-wide text-primary-foreground"
          >
            ANALYZE SMS
          </button>
          <button
            onClick={() => setText(DEMO.sms)}
            className="mt-3 w-full rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Load demo scam message
          </button>
        </div>
      )}

      {phase === "scanning" && (
        <div className="mx-auto max-w-2xl">
          <ScanProgress
            title="AI analysis in progress..."
            checks={SMS_CHECKS}
            failing={result && result.level !== "low" ? "Known scam template matched" : null}
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
            setText("");
          }}
        />
      )}
    </div>
  );
}
