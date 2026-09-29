import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ScanProgress } from "@/components/ScanProgress";
import { ScanResultView } from "@/components/ScanResultView";
import { analyzeEmail, DEMO, MAIL_CHECKS, type ScanResult } from "@/lib/scan-engine";
import { recordScan } from "@/lib/store";

export const Route = createFileRoute("/scan/mail")({
  head: () => ({
    meta: [
      { title: "Email Phishing Checker — SafeScan AI" },
      {
        name: "description",
        content: "Paste a suspicious email and its sender address to detect spoofed domains, phishing links and scam language.",
      },
      { property: "og:title", content: "Email Phishing Checker — SafeScan AI" },
      {
        property: "og:description",
        content: "Verify the sender domain, embedded links and message pattern of any suspicious email before you click.",
      },
    ],
  }),
  component: MailScanner,
});

function MailScanner() {
  const [from, setFrom] = useState("");
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  function start() {
    if (!from.trim()) {
      setError("Enter the sender's email address (the From line).");
      return;
    }
    if (text.trim().length < 10) {
      setError("Paste at least a few lines from the email body.");
      return;
    }
    setError("");
    setResult(analyzeEmail(from, text.slice(0, 4000)));
    setPhase("scanning");
  }

  function finish() {
    setPhase("done");
    if (result) recordScan({ kind: "mail", subject: result.subject, score: result.score, level: result.level });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader
        icon="📧"
        title="Email Phishing Checker"
        subtitle="Paste the sender address and the email body. We verify the sender domain, links and language like a fraud analyst would."
      />

      {phase === "idle" && (
        <div className="glass mx-auto max-w-2xl rounded-2xl p-7">
          <label htmlFor="from" className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Sender (From line)
          </label>
          <input
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="SBI Alerts <alerts@sbi-update-kyc.com>"
            className="mt-2 w-full rounded-xl border border-input bg-background/60 px-4 py-3 font-mono text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
          <label htmlFor="mail" className="mt-5 block font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Email body
          </label>
          <textarea
            id="mail"
            value={text}
            rows={7}
            maxLength={4000}
            onChange={(e) => setText(e.target.value)}
            placeholder="Dear Customer, your account will be blocked today... Verify here: https://..."
            className="mt-2 w-full resize-none rounded-xl border border-input bg-background/60 px-4 py-3 font-mono text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          <button
            onClick={start}
            className="glow-primary mt-4 w-full rounded-xl bg-primary py-3 font-semibold tracking-wide text-primary-foreground"
          >
            ANALYZE EMAIL
          </button>
          <button
            onClick={() => {
              setFrom(DEMO.mailFrom);
              setText(DEMO.mail);
            }}
            className="mt-3 w-full rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Load demo phishing email
          </button>
        </div>
      )}

      {phase === "scanning" && (
        <div className="mx-auto max-w-2xl">
          <ScanProgress
            title="AI analysis in progress..."
            checks={MAIL_CHECKS}
            failing={result && result.level !== "low" ? "Spoofed sender detected" : null}
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
            setFrom("");
            setText("");
          }}
        />
      )}
    </div>
  );
}
