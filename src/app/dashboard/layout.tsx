"use client";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 pb-20 text-white">
        {children}
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
