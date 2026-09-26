import { Link } from "@tanstack/react-router";
import { useState } from "react";

const LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/scan/sms", label: "SMS" },
  { to: "/scan/qr", label: "QR" },
  { to: "/scan/link", label: "Link" },
  { to: "/community", label: "Community" },
  { to: "/family", label: "Family" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="text-xl">🛡️</span>
          <span className="text-gradient">ScamShield AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={"exact" in l ? { exact: true } : undefined}
              activeProps={{ className: "bg-secondary text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] text-safe sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse-ring" /> PROTECTION ACTIVE
          </span>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded-lg border border-border px-3 py-1.5 text-sm md:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-border px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={"exact" in l ? { exact: true } : undefined}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
