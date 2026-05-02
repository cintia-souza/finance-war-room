"use client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";

export function DashboardHeader() {
  const { user } = useAuth();
  const initial = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="flex items-center justify-between pt-4 pb-6">
      <div>
        <Image src="/logo.svg" alt="Destrava" width={160} height={40} priority />
        <p className="text-t-muted mt-1 text-xs">{user?.email}</p>
      </div>
      <Link
        href="/dashboard/profile"
        className="bg-t-accent flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
        aria-label="Perfil"
      >
        {initial}
      </Link>
    </header>
  );
}
