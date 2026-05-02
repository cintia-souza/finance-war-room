"use client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export function DashboardHeader() {
  const { user } = useAuth();
  const initial = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="flex items-center justify-between pt-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight italic">WAR ROOM</h1>
        <p className="text-xs text-slate-500">{user?.email}</p>
      </div>
      <Link
        href="/dashboard/profile"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold"
      >
        {initial}
      </Link>
    </header>
  );
}
