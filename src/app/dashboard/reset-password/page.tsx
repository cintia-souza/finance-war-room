"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/PasswordInput";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Step = "loading" | "form" | "success" | "expired";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<Step>("loading");
  const router = useRouter();

  useEffect(() => {
    // O Supabase client processa automaticamente os tokens da URL (#access_token=...)
    // e dispara o evento PASSWORD_RECOVERY
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("form");
      } else if (event === "SIGNED_IN") {
        // Se veio SIGNED_IN sem PASSWORD_RECOVERY, pode ser que já processou
        // Verifica se a URL tem tokens de recovery
        if (window.location.hash.includes("type=recovery")) {
          setStep("form");
        }
      }
    });

    // Também verifica se já tem sessão (caso o token já tenha sido processado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && window.location.hash.includes("type=recovery")) {
        setStep("form");
      }
    });

    // Timeout: se depois de 8s não detectou recovery, link expirado
    const timeout = setTimeout(() => {
      setStep((prev) => (prev === "loading" ? "expired" : prev));
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
      setStep("success");
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {/* LOADING */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-16"
            >
              <Loader2 size={32} className="text-t-accent animate-spin" />
              <p className="text-t-muted text-sm">Verificando link de recuperação...</p>
            </motion.div>
          )}

          {/* EXPIRED */}
          {step === "expired" && (
            <motion.div
              key="expired"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-center"
            >
              <div className="bg-t-danger/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Lock size={28} className="text-t-danger" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Link expirado</h2>
                <p className="text-t-muted mt-2 text-sm">
                  O link de recuperação expirou ou é inválido. Solicite um novo.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="bg-t-accent hover:bg-t-accent-hover block w-full cursor-pointer rounded-2xl p-4 text-center font-bold text-white transition-colors"
              >
                Solicitar novo link
              </Link>
            </motion.div>
          )}

          {/* FORM */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <Image
                  src="/icon.svg"
                  alt="Destrava"
                  width={56}
                  height={56}
                  className="mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold">Nova Senha 🔒</h2>
                <p className="text-t-muted mt-2 text-sm">Defina sua nova senha abaixo.</p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <PasswordInput placeholder="Nova senha" value={password} onChange={setPassword} />
                <PasswordInput
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />

                {message && <p className="text-t-danger text-center text-sm">{message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-t-accent hover:bg-t-accent-hover w-full cursor-pointer rounded-2xl p-4 font-bold text-white transition-colors disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar Nova Senha"}
                </button>
              </form>
            </motion.div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="bg-t-success mx-auto flex h-20 w-20 items-center justify-center rounded-full"
              >
                <ShieldCheck size={40} className="text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold">Senha Atualizada! ✅</h2>
                <p className="text-t-muted mt-2 text-sm">Sua senha foi alterada com sucesso.</p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => router.push("/dashboard")}
                className="bg-t-accent hover:bg-t-accent-hover w-full cursor-pointer rounded-2xl p-4 font-bold text-white transition-colors"
              >
                Ir para o Dashboard
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
