import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async (u: User | null) => {
      setUser(u);
      if (u) {
        const { data } = await supabase.from("profiles").select("display_name").eq("id", u.id).maybeSingle();
        setName(data?.display_name ?? u.email?.split("@")[0] ?? null);
      } else setName(null);
      setReady(true);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      void load(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, name, ready };
}
