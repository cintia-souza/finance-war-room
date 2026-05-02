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
    <div className="flex min-h-screen flex-col justify-center bg-slate-950 p-6 text-white">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Recuperar Senha 🔑</h2>
          <p className="mt-2 text-slate-400">Enviaremos um link para redefinir sua senha.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              required
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pr-4 pl-11 outline-none focus:ring-2 focus:ring-blue-600"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && (
            <p
              className={`text-center text-sm ${message.includes("enviado") ? "text-emerald-400" : "text-rose-400"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 p-4 font-bold disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar Link"}
          </button>

          <Link href="/login" className="block text-center text-sm text-slate-500 hover:text-white">
            Voltar ao login
          </Link>
        </form>
      </div>
    </div>
  );
}
