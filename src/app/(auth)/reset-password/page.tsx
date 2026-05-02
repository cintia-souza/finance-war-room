"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Senha atualizada!");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Verificando link de recuperação...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-950 p-6 text-white">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Nova Senha 🔒</h2>
          <p className="mt-2 text-slate-400">Defina sua nova senha abaixo.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            required
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirme a nova senha"
            value={confirmPassword}
            required
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {message && (
            <p
              className={`text-center text-sm ${message.includes("atualizada") ? "text-emerald-400" : "text-rose-400"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 p-4 font-bold disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
