"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
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
      <div className="bg-t-bg text-t-text flex min-h-screen items-center justify-center">
        <p className="text-t-muted">Verificando link de recuperação...</p>
      </div>
    );
  }

  return (
    <div className="bg-t-bg text-t-text flex min-h-screen flex-col justify-center p-6">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Nova Senha 🔒</h2>
          <p className="text-t-muted mt-2">Defina sua nova senha abaixo.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <PasswordInput placeholder="Nova senha" value={password} onChange={setPassword} />
          <PasswordInput
            placeholder="Confirme a nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {message && (
            <p
              className={`text-center text-sm ${message.includes("atualizada") ? "text-t-success" : "text-t-danger"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-t-accent w-full rounded-2xl p-4 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
