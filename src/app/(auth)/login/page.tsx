"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-950 p-6 text-white">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Acesso ao Front 🪖</h2>
          <p className="mt-2 text-slate-400">Gerencie suas dívidas e sua reforma.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            required
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            required
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-center text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 p-4 font-bold disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <Link href="/signup" className="hover:text-white">
              Criar conta
            </Link>
            <Link href="/forgot-password" className="hover:text-white">
              Esqueci a senha
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
