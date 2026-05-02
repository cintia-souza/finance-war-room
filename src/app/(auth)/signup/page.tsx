"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Conta criada! Verifique seu e-mail para confirmar.");
    }
  };

  return (
    <div className="bg-t-bg text-t-text flex min-h-screen flex-col justify-center p-6">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="text-center">
          <Image src="/icon.svg" alt="Destrava" width={64} height={64} className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Criar Conta 🔓</h2>
          <p className="text-t-muted mt-2">Comece a destravar sua vida financeira.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
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

          <PasswordInput placeholder="Crie uma senha" value={password} onChange={setPassword} />
          <PasswordInput
            placeholder="Confirme a senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {message && (
            <p
              className={`text-center text-sm ${message.includes("Conta criada") ? "text-t-success" : "text-t-danger"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-t-accent w-full rounded-2xl p-4 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Conta"}
          </button>

          <Link href="/login" className="text-t-muted hover:text-t-text block text-center text-sm">
            Já tem conta? Entrar
          </Link>
        </form>
      </div>
    </div>
  );
}
