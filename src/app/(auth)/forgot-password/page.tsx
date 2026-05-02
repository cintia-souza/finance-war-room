"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Link de recuperação enviado! Verifique seu e-mail.");
    }
  };

  return (
    <div className="bg-t-bg text-t-text flex min-h-screen flex-col justify-center p-6">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Recuperar Senha 🔑</h2>
          <p className="text-t-muted mt-2">Enviaremos um link para redefinir sua senha.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Mail className="text-t-muted absolute top-1/2 left-4 -translate-y-1/2" size={18} />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              required
              className="border-t-border bg-t-surface text-t-text focus:ring-t-accent w-full rounded-2xl border py-4 pr-4 pl-11 outline-none focus:ring-2"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && (
            <p
              className={`text-center text-sm ${message.includes("enviado") ? "text-t-success" : "text-t-danger"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-t-accent w-full rounded-2xl p-4 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar Link"}
          </button>

          <Link href="/login" className="text-t-muted hover:text-t-text block text-center text-sm">
            Voltar ao login
          </Link>
        </form>
      </div>
    </div>
  );
}
