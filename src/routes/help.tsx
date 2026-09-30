import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Emergency Scam Help — SafeScan AI" },
      { name: "description", content: "Clicked a scam link or paid a fraudster? Follow these steps right now and report it." },
      { property: "og:title", content: "Emergency Scam Help — SafeScan AI" },
      { property: "og:description", content: "Step-by-step help if you fell for a phishing link, fake SMS or UPI scam." },
    ],
  }),
  component: Help,
});

const STEPS = [
  ["📞", "Call 1930", "India's National Cyber Crime Helpline. Call within the first hour to freeze the money trail."],
  ["🏦", "Call your bank", "Ask them to block your card, UPI and net banking immediately."],
  ["🔑", "Change passwords", "Change passwords and PINs for any account you entered on the fake page. Turn on 2-step verification."],
  ["🌐", "File a complaint", "Report at cybercrime.gov.in with screenshots, transaction IDs and the scam number or link."],
  ["📵", "Report the number", "Report fraud calls and SMS on the Sanchar Saathi 'Chakshu' portal."],
] as const;

const TIPS = [
  "Banks never ask for OTP, PIN or KYC updates by SMS link.",
  "You never need to scan a QR or enter a UPI PIN to receive money.",
  "Check the exact spelling of website addresses before logging in.",
  "Urgency ('blocked today', 'last chance') is the #1 scam signal.",
];

function Help() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader icon="🚨" title="Emergency Scam Help" subtitle="Clicked a link, shared an OTP or paid a scammer? Act quickly — do these steps now." />
      <ol className="space-y-4">
        {STEPS.map(([icon, title, body], i) => (
          <li key={title} className="glass flex gap-4 rounded-2xl p-5">
            <span className="text-2xl">{icon}</span>
            <div>
              <h2 className="font-display text-lg font-semibold">
                {i + 1}. {title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="glass mt-10 rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold">Security awareness</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {TIPS.map((t) => (
            <li key={t}>✓ {t}</li>
          ))}
        </ul>
      </section>
      <section className="glass mt-6 rounded-2xl p-6 text-sm text-muted-foreground">
        <h2 className="font-display text-xl font-semibold text-foreground">Privacy</h2>
        <p className="mt-3">
          The quick rule-based check runs on your device. The Gemini second opinion sends only the scanned text to the AI and nothing is
          stored. Camera frames for QR scanning never leave your phone.
        </p>
      </section>
    </div>
  );
}
