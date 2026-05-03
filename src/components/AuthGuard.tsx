"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

function LoadingScreen() {
  return (
    <div className="bg-t-bg flex min-h-screen items-center justify-center">
      <div className="border-t-accent h-8 w-8 animate-spin rounded-full border-t-2" />
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Escuta mudanças de auth (inclui processamento de tokens da URL)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setChecked(true);
    });

    // Verifica sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Só redireciona depois de verificar E se não tem tokens na URL sendo processados
    if (checked && !session) {
      const hasTokenInUrl =
        window.location.hash.includes("access_token") || window.location.search.includes("code=");

      if (!hasTokenInUrl) {
        router.replace("/login");
      }
    }
  }, [checked, session, router]);

  if (!checked || !session) return <LoadingScreen />;
  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setChecked(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (checked && session) {
      router.replace("/dashboard");
    }
  }, [checked, session, router]);

  if (!checked || session) return <LoadingScreen />;
  return <>{children}</>;
}
