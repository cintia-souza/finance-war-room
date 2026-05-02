"use client";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="bg-t-bg text-t-text min-h-screen pb-20">
        {children}
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
