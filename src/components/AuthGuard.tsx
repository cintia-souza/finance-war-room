"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function LoadingScreen() {
  return (
    <div className="bg-t-bg flex min-h-screen items-center justify-center">
      <div className="border-t-accent h-8 w-8 animate-spin rounded-full border-t-2" />
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  if (loading || !session) return <LoadingScreen />;
  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) router.replace("/dashboard");
  }, [loading, session, router]);

  if (loading || session) return <LoadingScreen />;
  return <>{children}</>;
}
