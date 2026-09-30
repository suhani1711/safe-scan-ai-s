import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const ITEMS = [
  { to: "/scan/sms", label: "📱 Quick Scan SMS" },
  { to: "/scan/link", label: "🔗 Link Protection" },
  { to: "/scan/mail", label: "📧 Email Protection" },
  { to: "/scan/qr", label: "🔳 Scan QR" },
  { to: "/extension", label: "🛡️ Background Protection" },
  { to: "/dashboard", label: "📊 Protection Status" },
  { to: "/help", label: "🚨 Emergency Scam Help" },
] as const;

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <nav className="glass animate-rise w-60 rounded-2xl p-2" aria-label="SafeScan Security Assistant">
          <p className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Security Assistant
          </p>
          {ITEMS.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
            >
              {i.label}
            </Link>
          ))}
        </nav>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        title="SafeScan Security Assistant"
        aria-label="SafeScan Security Assistant"
        aria-expanded={open}
        className="glow-primary relative grid h-14 w-14 place-items-center rounded-full bg-primary text-2xl transition-transform hover:scale-105"
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-pulse-ring" />
        <span className="relative">{open ? "✕" : "🛡️"}</span>
      </button>
    </div>
  );
}
