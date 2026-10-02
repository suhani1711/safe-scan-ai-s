import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or Sign up — SafeScan AI" },
      { name: "description", content: "Create your SafeScan AI account to save your scan history and see your personal dashboard." },
      { property: "og:title", content: "Log in to SafeScan AI" },
      { property: "og:description", content: "Save your scans and get a personal scam-protection dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN") navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/dashboard", data: { display_name: name.trim() || undefined } },
      });
      if (error) setMsg({ ok: false, text: error.message });
      else if (!data.session) setMsg({ ok: true, text: "Account created! Check your email and click the confirmation link to log in." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ ok: false, text: error.message });
    }
    setBusy(false);
  };

  const google = async () => {
    setMsg(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg({ ok: false, text: r.error.message ?? "Google sign-in failed" });
  };

  const input = "w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="glass rounded-2xl p-8">
        <div className="text-center">
          <div className="text-4xl">🛡️</div>
          <h1 className="mt-2 font-display text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Save your scans and get your own dashboard.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1 text-sm font-medium">
          {(["login", "signup"] as const).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setMsg(null); }}
              className={`rounded-lg py-2 ${mode === m ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}>
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <button type="button" onClick={google}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-semibold hover:bg-secondary">
          <span className="font-bold text-primary">G</span> Continue with Google
        </button>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          )}
          <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={busy} className="glow-primary w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        {msg && <p className={`mt-4 text-center text-sm ${msg.ok ? "text-safe" : "text-danger"}`}>{msg.text}</p>}
        <p className="mt-6 text-center text-xs text-muted-foreground">Scanners work without an account — logging in just saves your history.</p>
      </div>
    </div>
  );
}
