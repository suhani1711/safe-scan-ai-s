import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/extension")({
  head: () => ({
    meta: [
      { title: "Browser Extension & Background Protection — SafeScan AI" },
      { name: "description", content: "Install the SafeScan Chrome/Edge extension to get warnings before you open dangerous links on any website." },
      { property: "og:title", content: "SafeScan Browser Extension" },
      { property: "og:description", content: "Background protection that warns you before opening risky links." },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ext,
});

function download() {
  fetch("/safescan-extension.zip")
    .then((r) => {
      if (!r.ok) throw new Error(`Download failed: ${r.status}`);
      return r.blob();
    })
    .then((b) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "safescan-extension.zip";
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch((e) => alert(e.message));
}

function Ext() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader
        icon="🧩"
        title="Background Protection"
       subtitle="Keep SafeScan close while you browse with a floating shield for checking pages, links, messages, emails and QR codes."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold">What it does</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>🛡️ Adds a floating SafeScan shield to websites</li>
            <li>🔗 Checks the current page, links and selected text</li>
            <li>📱 Scans SMS messages, emails and QR codes</li>
            <li>🔒 Runs on your computer — nothing is sent anywhere</li>
          </ul>
          <button onClick={download} className="glow-primary mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">
            ⬇ Download extension
          </button>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold">Install in 4 steps</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
            <li>Unzip the downloaded file.</li>
            <li>Open <code className="font-mono">chrome://extensions</code> (or edge://extensions).</li>
            <li>Turn on <b>Developer mode</b> (top-right).</li>
            <li>Click <b>Load unpacked</b> and pick the <b>safescan-ext</b> folder.</li>
            <li>Reload any open websites. The shield appears in the bottom-right corner.</li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Works on computers in Chrome, Edge, Brave and Opera. Phone browsers don't allow background protection, so on your phone use Share to SafeScan instead.
          </p>
        </div>
      </div>
    </div>
  );
}
