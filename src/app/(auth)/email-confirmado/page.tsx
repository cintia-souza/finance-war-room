"use client";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EmailConfirmadoPage() {
  return (
    <div className="bg-t-bg text-t-text flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="bg-t-success mx-auto flex h-20 w-20 items-center justify-center rounded-full"
        >
          <CheckCircle2 size={40} className="text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Image src="/icon.svg" alt="Destrava" width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold">E-mail Confirmado! 🎉</h1>
          <p className="text-t-muted mt-2 text-sm">
            Sua conta foi verificada com sucesso. Agora você pode acessar todas as funcionalidades
            do Destrava.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Link
            href="/login"
            className="bg-t-accent hover:bg-t-accent-hover flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl p-4 font-bold text-white transition-colors"
          >
            Entrar na conta
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="border-t-accent/20 bg-t-accent/5 rounded-xl border p-4"
        >
          <p className="text-t-accent text-xs">
            💡 Dica: Adicione o Destrava à tela inicial do seu celular para acesso rápido como um
            app nativo.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
