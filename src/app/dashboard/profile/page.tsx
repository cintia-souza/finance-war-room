"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Mail, Shield, LogOut, ChevronRight } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<"menu" | "email" | "password">("menu");

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

  return (
    <main className="p-4">
      {/* Avatar e info */}
      <div className="mb-8 flex flex-col items-center gap-3 pt-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold">
          {initial}
        </div>
        <div className="text-center">
          <p className="font-bold">{user?.email}</p>
          <p className="text-xs text-slate-500">
            Membro desde {new Date(user?.created_at ?? "").toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {section === "menu" && (
        <div className="space-y-3">
          <button
            onClick={() => {
              setSection("email");
              setMessage("");
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-blue-400" />
              <span className="text-sm font-medium">Alterar e-mail</span>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>

          <button
            onClick={() => {
              setSection("password");
              setMessage("");
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-blue-400" />
              <span className="text-sm font-medium">Alterar senha</span>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-rose-900/50 bg-rose-950/30 p-4"
          >
            <LogOut size={18} className="text-rose-400" />
            <span className="text-sm font-medium text-rose-400">Sair da conta</span>
          </button>
        </div>
      )}

      {section === "email" && (
        <div className="space-y-4">
          <button
            onClick={() => setSection("menu")}
            className="text-sm text-slate-500 hover:text-white"
          >
            ← Voltar
          </button>

          <h3 className="text-lg font-bold">Alterar E-mail</h3>
          <p className="text-xs text-slate-500">
            Atual: <span className="text-slate-300">{user?.email}</span>
          </p>

          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="Novo e-mail"
                value={newEmail}
                required
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pr-4 pl-11 outline-none focus:ring-2 focus:ring-blue-600"
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            {message && (
              <p
                className={`text-center text-sm ${message.includes("confirmação") ? "text-emerald-400" : "text-rose-400"}`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 p-4 font-bold disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Atualizar E-mail"}
            </button>
          </form>
        </div>
      )}

      {section === "password" && (
        <div className="space-y-4">
          <button
            onClick={() => setSection("menu")}
            className="text-sm text-slate-500 hover:text-white"
          >
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
                className={`text-center text-sm ${message.includes("sucesso") ? "text-emerald-400" : "text-rose-400"}`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 p-4 font-bold disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Atualizar Senha"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
