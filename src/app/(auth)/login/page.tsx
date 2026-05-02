"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

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
    <div className="bg-t-bg text-t-text flex min-h-screen flex-col justify-center p-6">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="text-center">
          <Image src="/icon.svg" alt="Destrava" width={64} height={64} className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Destrava 🔓</h2>
          <p className="text-t-muted mt-2">Destravar sua vida financeira.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <PasswordInput placeholder="Sua senha" value={password} onChange={setPassword} />

          {error && <p className="text-t-danger text-center text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-t-accent w-full rounded-2xl p-4 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="text-t-muted flex items-center justify-between text-sm">
            <Link href="/signup" className="hover:text-t-text">
              Criar conta
            </Link>
            <Link href="/forgot-password" className="hover:text-t-text">
              Esqueci a senha
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
