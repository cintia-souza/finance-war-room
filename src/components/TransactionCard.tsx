"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Pencil } from "lucide-react";
import { Transaction, CATEGORY_LABELS } from "@/types/finance";
import { formatBRL } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
  onToggle: () => void;
  onEdit: () => void;
}

export function TransactionCard({ transaction: t, index, onToggle, onEdit }: TransactionCardProps) {
  const haptic = useHaptic();
  const [flashing, setFlashing] = useState(false);

  const handleToggle = () => {
    haptic.success();
    setFlashing(true);
    setTimeout(() => setFlashing(false), 400);
    onToggle();
  };

  const handleEdit = () => {
    haptic.tap();
    onEdit();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.97 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
      className={`relative flex items-center justify-between overflow-hidden rounded-2xl border p-4 ${
        t.status === "pago"
          ? "border-t-border/50 bg-t-surface/30 opacity-50"
          : "border-t-border bg-t-surface"
      }`}
    >
      {/* Flash overlay on toggle */}
      <motion.div
        className="bg-t-success pointer-events-none absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: flashing ? 0.15 : 0 }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative flex min-w-0 items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.65, rotate: -10 }}
          onClick={handleToggle}
          className="shrink-0"
          aria-label={
            t.status === "pago"
              ? `Marcar ${t.description} como pendente`
              : `Marcar ${t.description} como pago`
          }
        >
          <motion.div
            animate={flashing ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {t.status === "pago" ? (
              <CheckCircle2 className="text-t-success" size={20} />
            ) : (
              <Circle className="text-t-muted hover:text-t-text" size={20} />
            )}
          </motion.div>
        </motion.button>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{t.description}</p>
          <p className="text-t-muted text-[10px]">
            {CATEGORY_LABELS[t.category] ?? t.category}
            {t.is_recurring && " • Fixo"}
            {t.total_installments && ` • ${t.current_installment}/${t.total_installments}`}
          </p>
        </div>
      </div>

      <div className="relative flex shrink-0 items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.75 }}
          whileHover={{ scale: 1.15 }}
          onClick={handleEdit}
          className="bg-t-border text-t-muted hover:bg-t-accent rounded-full p-1.5 transition-colors hover:text-white"
          aria-label={`Editar ${t.description}`}
        >
          <Pencil size={12} />
        </motion.button>
        <p
          className={`font-mono text-sm font-bold ${
            t.type === "receita"
              ? "text-t-income"
              : t.status === "pago"
                ? "text-t-muted"
                : "text-t-text"
          }`}
        >
          {t.type === "receita" ? "+" : "-"}
          {formatBRL(t.amount)}
        </p>
      </div>
    </motion.div>
  );
}
