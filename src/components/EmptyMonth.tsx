"use client";
import { motion } from "framer-motion";
import { CalendarPlus, Target } from "lucide-react";

interface EmptyMonthProps {
  monthLabel: string;
  onAdd: () => void;
}

const tips = [
  "Registre suas contas fixas para ter visão real do mês.",
  "Comece pelas despesas essenciais: moradia, luz, água.",
  "Cada lançamento te aproxima do controle financeiro.",
  "Planeje antes de gastar — registre tudo aqui.",
];

export function EmptyMonth({ monthLabel, onAdd }: EmptyMonthProps) {
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-5 py-10"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="bg-t-surface flex h-16 w-16 items-center justify-center rounded-full">
          <CalendarPlus size={28} className="text-t-muted/50" />
        </div>
        <motion.div
          className="bg-t-accent absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Target size={10} className="text-white" />
        </motion.div>
      </motion.div>

      <div className="max-w-[240px] text-center">
        <p className="text-t-text font-bold">Mês limpo</p>
        <p className="text-t-muted mt-1 text-xs">
          <span className="capitalize">{monthLabel}</span> ainda não tem lançamentos.
        </p>
      </div>

      {/* Dica motivacional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border-t-accent/20 bg-t-accent/5 rounded-xl border px-4 py-2"
      >
        <p className="text-t-accent text-center text-[11px]">💡 {tip}</p>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        onClick={onAdd}
        className="bg-t-accent rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-shadow hover:shadow-xl"
      >
        + Adicionar lançamento
      </motion.button>
    </motion.div>
  );
}
