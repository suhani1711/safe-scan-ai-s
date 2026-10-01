import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/extension")({
  head: () => ({
    meta: [
      { title: "Browser Extension & Background Protection — SafeScan AI" },
      { name: "description", content: "Install the SafeScan Chrome/Edge extension to get warnings before you open dangerous links on any website." },
      { property: "og:title", content: "SafeScan Browser Extension" },
      { property: "og:description", content: "Background protection that warns you before opening risky links." },
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
        subtitle="A website can't watch your other tabs. The SafeScan browser extension can — it checks every link before you open it."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold">What it does</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>🔗 Warns before you click a dangerous link on any site, including Gmail</li>
            <li>🚦 Shows a red "!" on the toolbar icon when the current page looks risky</li>
            <li>🔍 Quick link checker in the popup</li>
            <li>🔒 Runs on your computer — browsing is never uploaded</li>
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
            <li>Click <b>Load unpacked</b> and pick the unzipped folder.</li>
            <li>Click the 🧩 puzzle icon in Chrome's toolbar and press the 📌 pin next to <b>SafeScan AI</b> so the shield stays visible.</li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Works on computers in Chrome, Edge, Brave and Opera. Phone browsers don't allow background protection, so on your phone use Share to SafeScan instead.
          </p>
        </div>
      </div>
    </div>
  );
}
