"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useTheme, THEME_LABELS, Theme } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";
import { Mail, Shield, LogOut, ChevronRight, Palette, Check } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, changeTheme } = useTheme();
  const router = useRouter();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<"menu" | "email" | "password" | "theme">("menu");
  const [showLogout, setShowLogout] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("E-mail de confirmação enviado para o novo endereço.");
      setNewEmail("");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Senha atualizada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const initial = user?.email?.charAt(0).toUpperCase() ?? "?";

  const menuBtnClass =
    "flex w-full cursor-pointer items-center justify-between rounded-2xl border border-t-border bg-t-surface p-4 transition-colors hover:bg-t-border/50";
  const backBtnClass = "cursor-pointer text-sm text-t-muted transition-colors hover:text-t-text";
  const submitBtnClass =
    "w-full cursor-pointer rounded-2xl bg-t-accent p-4 font-bold text-white transition-colors hover:bg-t-accent-hover disabled:opacity-50";
  const inputClass =
    "w-full rounded-2xl border border-t-border bg-t-surface py-4 pr-4 pl-11 text-t-text outline-none focus:ring-2 focus:ring-t-accent";

  return (
    <main className="p-4">
      <div className="mb-8 flex flex-col items-center gap-3 pt-4">
        <div className="bg-t-accent flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white">
          {initial}
        </div>
        <div className="text-center">
          <p className="font-bold">{user?.email}</p>
          <p className="text-t-muted text-xs">
            Membro desde {new Date(user?.created_at ?? "").toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {section === "menu" && (
        <div className="space-y-3" role="list" aria-label="Configurações">
          <button
            onClick={() => {
              setSection("theme");
              setMessage("");
            }}
            className={menuBtnClass}
          >
            <div className="flex items-center gap-3">
              <Palette size={18} className="text-t-accent" />
              <div className="text-left">
                <span className="text-sm font-medium">Tema</span>
                <p className="text-t-muted text-[10px]">{THEME_LABELS[theme]}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-t-muted" />
          </button>

          <button
            onClick={() => {
              setSection("email");
              setMessage("");
            }}
            className={menuBtnClass}
          >
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-t-accent" />
              <span className="text-sm font-medium">Alterar e-mail</span>
            </div>
            <ChevronRight size={16} className="text-t-muted" />
          </button>

          <button
            onClick={() => {
              setSection("password");
              setMessage("");
            }}
            className={menuBtnClass}
          >
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-t-accent" />
              <span className="text-sm font-medium">Alterar senha</span>
            </div>
            <ChevronRight size={16} className="text-t-muted" />
          </button>

          <button
            onClick={() => setShowLogout(true)}
            className="border-t-danger/30 bg-t-danger/10 hover:bg-t-danger/20 flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors"
          >
            <LogOut size={18} className="text-t-danger" />
            <span className="text-t-danger text-sm font-medium">Sair da conta</span>
          </button>

          <AnimatePresence>
            {showLogout && (
              <ConfirmModal
                title="Sair da conta"
                message="Tem certeza que deseja sair?"
                confirmLabel="Sair"
                cancelLabel="Ficar"
                danger
                onConfirm={handleLogout}
                onCancel={() => setShowLogout(false)}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {section === "theme" && (
        <div className="space-y-4">
          <button onClick={() => setSection("menu")} className={backBtnClass}>
            ← Voltar
          </button>
          <h3 className="text-lg font-bold">Tema</h3>
          <div className="space-y-2">
            {(Object.keys(THEME_LABELS) as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => changeTheme(t)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all hover:opacity-80 ${
                  theme === t ? "border-t-accent bg-t-accent/10" : "border-t-border bg-t-surface"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      t === "dark"
                        ? "bg-slate-900 ring-1 ring-slate-600"
                        : t === "light"
                          ? "bg-white ring-1 ring-slate-300"
                          : "bg-gradient-to-r from-sky-400 to-orange-400"
                    }`}
                  />
                  <span className="text-sm font-medium">{THEME_LABELS[t]}</span>
                </div>
                {theme === t && <Check size={18} className="text-t-accent" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {section === "email" && (
        <div className="space-y-4">
          <button onClick={() => setSection("menu")} className={backBtnClass}>
            ← Voltar
          </button>
          <h3 className="text-lg font-bold">Alterar E-mail</h3>
          <p className="text-t-muted text-xs">
            Atual: <span className="text-t-text">{user?.email}</span>
          </p>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="relative">
              <Mail className="text-t-muted absolute top-1/2 left-4 -translate-y-1/2" size={18} />
              <input
                type="email"
                placeholder="Novo e-mail"
                value={newEmail}
                required
                className={inputClass}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            {message && (
              <p
                className={`text-center text-sm ${message.includes("confirmação") ? "text-t-success" : "text-t-danger"}`}
              >
                {message}
              </p>
            )}
            <button type="submit" disabled={loading} className={submitBtnClass}>
              {loading ? "Salvando..." : "Atualizar E-mail"}
            </button>
          </form>
        </div>
      )}

      {section === "password" && (
        <div className="space-y-4">
          <button onClick={() => setSection("menu")} className={backBtnClass}>
            ← Voltar
          </button>
          <h3 className="text-lg font-bold">Alterar Senha</h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <PasswordInput placeholder="Nova senha" value={newPassword} onChange={setNewPassword} />
            <PasswordInput
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            {message && (
              <p
                className={`text-center text-sm ${message.includes("sucesso") ? "text-t-success" : "text-t-danger"}`}
              >
                {message}
              </p>
            )}
            <button type="submit" disabled={loading} className={submitBtnClass}>
              {loading ? "Salvando..." : "Atualizar Senha"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
