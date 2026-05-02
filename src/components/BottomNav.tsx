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
    <nav
      className="border-t-border bg-t-bg/95 fixed bottom-0 left-0 z-40 flex w-full border-t backdrop-blur-md"
      role="navigation"
      aria-label="Menu principal"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold transition-colors ${
              active ? "text-t-accent" : "text-t-muted hover:text-t-text"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="text-t-muted hover:text-t-danger flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold transition-colors"
      >
        <LogOut size={20} aria-hidden="true" />
        Sair
      </button>
    </nav>
  );
}
