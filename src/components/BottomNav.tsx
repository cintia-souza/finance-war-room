"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Bot, User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/consultor", label: "Consultor", icon: Bot },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex w-full border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold transition-colors ${
              active ? "text-blue-500" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold text-slate-500 transition-colors hover:text-rose-400"
      >
        <LogOut size={20} />
        Sair
      </button>
    </nav>
  );
}
