import { Fragment } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const THEME_KEY = "safescan-theme";

const SCAN_LINKS = [
  { to: "/scan/sms", icon: "📱", label: "Scan SMS", desc: "Detect fraudulent text messages" },
  { to: "/scan/qr", icon: "🔳", label: "Scan QR", desc: "Check UPI & payment QR codes" },
  { to: "/scan/link", icon: "🔗", label: "Check Link", desc: "Analyse suspicious URLs" },
  { to: "/scan/mail", icon: "📧", label: "Check Mail", desc: "Spot phishing emails" },
] as const;

const LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/community", label: "Community" },
  { to: "/family", label: "Family" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/extension", label: "Extension" },
  { to: "/help", label: "Help" },
] as const;

function ScanMenu({
  open,
  onPick,
  className,
  panelClassName,
}: {
  open: boolean;
  onPick: () => void;
  className?: string;
  panelClassName?: string;
}) {
  if (!open) return null;
  return (
    <div
      role="menu"
      aria-label="Scanning options"
      className={cn(
        "glass z-50 rounded-xl border border-border p-1.5 shadow-2xl",
        panelClassName,
      )}
    >
      {SCAN_LINKS.map((s) => (
        <Link
          key={s.to}
          to={s.to}
          role="menuitem"
          onClick={onPick}
          className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-secondary"
        >
          <span className="text-lg leading-none">{s.icon}</span>
          <span>
            <span className="block text-sm font-semibold text-foreground">{s.label}</span>
            <span className="block text-[11px] text-muted-foreground">{s.desc}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [mobileScanOpen, setMobileScanOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const scanRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, name } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    setScanOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!scanOpen) return;
    const onDown = (e: MouseEvent) => {
      if (scanRef.current && !scanRef.current.contains(e.target as Node)) setScanOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setScanOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [scanOpen]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(THEME_KEY, next);
  };

  const onScanRoute = pathname.startsWith("/scan/");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="text-xl">🛡️</span>
          <span className="text-gradient">SafeScan AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Fragment key={l.to}>
              {l.to === "/" && (
                <div key="scan" ref={scanRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setScanOpen((o) => !o)}
                    aria-expanded={scanOpen}
                    aria-haspopup="true"
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      onScanRoute
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Scan
                    <span
                      className={cn(
                        "text-[10px] transition-transform duration-200",
                        scanOpen && "rotate-180",
                      )}
                    >
                      ▼
                    </span>
                  </button>
                  <ScanMenu
                    open={scanOpen}
                    onPick={() => setScanOpen(false)}
                    className="absolute left-0 top-full mt-2 w-64"
                  />
                </div>
              )}
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: "exact" in l }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {l.label}
              </Link>
            </Fragment>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] text-safe sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse-ring" /> PROTECTION ACTIVE
          </span>
          <button
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            title={theme === "light" ? "Dark theme" : "Light theme"}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {user ? (
            <button
              onClick={signOut}
              title={`Signed in as ${name ?? user.email}`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              👤 {(name ?? "Account").slice(0, 12)} · Log out
            </button>
          ) : (
            <Link to="/auth" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
              Log in
            </Link>
          )}
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
            <Fragment key={l.to}>
              {l.to === "/" && (
                <div key="scan" className="rounded-lg border border-border/60">
                  <button
                    type="button"
                    onClick={() => setMobileScanOpen((o) => !o)}
                    aria-expanded={mobileScanOpen}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-foreground"
                  >
                    Scan
                    <span
                      className={cn(
                        "text-[10px] transition-transform duration-200",
                        mobileScanOpen && "rotate-180",
                      )}
                    >
                      ▼
                    </span>
                  </button>
                  {mobileScanOpen && (
                    <div className="grid gap-1 px-2 pb-2">
                      {SCAN_LINKS.map((s) => (
                        <Link
                          key={s.to}
                          to={s.to}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary"
                        >
                          <span>{s.icon}</span>
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: "exact" in l }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground"
              >
                {l.label}
              </Link>
            </Fragment>
          ))}
        </nav>
      )}
    </header>
  );
}
