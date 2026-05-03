"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/finance";
import { formatBRL } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { financeService } from "@/app/services/finance";
import AddTransactionForm from "@/components/AddTransactionForm";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { TransactionCard } from "@/components/TransactionCard";
import { DashboardSkeleton } from "@/components/Skeleton";
import { EmptyMonth } from "@/components/EmptyMonth";
import { MonthSelector } from "@/components/MonthSelector";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    financeService.getTransactions().then((data) => {
      if (!ignore) {
        setTransactions(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  function reload() {
    financeService.getTransactions().then(setTransactions);
  }

  const navigateMonth = useCallback(
    (dir: number) => {
      setDirection(dir);
      const [y, m] = currentMonth.split("-").map(Number);
      const d = new Date(y, m - 1 + dir, 1);
      setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    },
    [currentMonth],
  );

  const monthTransactions = transactions.filter((t) => t.due_date?.startsWith(currentMonth));
  const receitas = monthTransactions
    .filter((t) => t.type === "receita")
    .reduce((a, t) => a + t.amount, 0);
  const despesas = monthTransactions
    .filter((t) => t.type === "despesa")
    .reduce((a, t) => a + t.amount, 0);
  const despesasPagas = monthTransactions
    .filter((t) => t.type === "despesa" && t.status === "pago")
    .reduce((a, t) => a + t.amount, 0);
  const saldo = receitas - despesas;
  const progresso = despesas > 0 ? Math.round((despesasPagas / despesas) * 100) : 0;

  const dividas = transactions.filter((t) => t.total_installments && t.total_installments > 1);
  const dividasAgrupadas = dividas.reduce(
    (acc, t) => {
      const name = t.description.replace(/\s*\(\d+\/\d+\)$/, "");
      if (!acc[name]) acc[name] = { total: 0, pagas: 0, totalDebt: t.total_debt ?? 0 };
      acc[name].total = t.total_installments ?? 0;
      if (t.status === "pago") acc[name].pagas++;
      return acc;
    },
    {} as Record<string, { total: number; pagas: number; totalDebt: number }>,
  );

  const monthLabel = new Date(currentMonth + "-01").toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="p-4" role="main" aria-label="Dashboard financeiro">
      <DashboardHeader />

      <MonthSelector currentMonth={currentMonth} direction={direction} onNavigate={navigateMonth} />

      {loading && <DashboardSkeleton />}

      {!loading && (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentMonth}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Cards resumo */}
            <section className="mb-6 grid grid-cols-3 gap-3" aria-label="Resumo financeiro">
              {[
                {
                  label: "Receitas",
                  value: receitas,
                  color: "text-t-income",
                  icon: TrendingUp,
                  delay: 0.05,
                },
                {
                  label: "Despesas",
                  value: despesas,
                  color: "text-t-expense",
                  icon: TrendingDown,
                  delay: 0.1,
                },
              ].map(({ label, value, color, icon: Icon, delay }) => (
                <motion.div
                  key={label}
                  className="border-t-border bg-t-surface rounded-2xl border p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                >
                  <div className="mb-1 flex items-center gap-1">
                    <Icon size={12} className={color} aria-hidden="true" />
                    <p className="text-t-muted text-[10px] font-bold uppercase">{label}</p>
                  </div>
                  <p className={`font-mono text-sm font-bold ${color}`}>{formatBRL(value)}</p>
                </motion.div>
              ))}

              <motion.div
                className="border-t-border bg-t-surface rounded-2xl border p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-t-muted mb-1 text-[10px] font-bold uppercase">Saldo</p>
                <motion.p
                  key={saldo}
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`font-mono text-sm font-bold ${saldo >= 0 ? "text-t-income" : "text-t-expense"}`}
                >
                  {formatBRL(saldo)}
                </motion.p>
              </motion.div>
            </section>

            {/* Barra de progresso */}
            {despesas > 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-t-muted mb-1 flex justify-between text-[10px]">
                  <span>Pago: {formatBRL(despesasPagas)}</span>
                  <span>Total: {formatBRL(despesas)}</span>
                </div>
                <div
                  className="bg-t-border h-2 overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={progresso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progresso de pagamento"
                >
                  <motion.div
                    className="bg-t-success h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progresso, 100)}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Transações ou empty state */}
            <section className="space-y-3" aria-label="Lançamentos do mês">
              <h2 className="text-t-muted px-1 text-xs font-black uppercase">Lançamentos do Mês</h2>
              {monthTransactions.length === 0 ? (
                <EmptyMonth monthLabel={monthLabel} onAdd={() => setShowForm(true)} />
              ) : (
                <AnimatePresence mode="popLayout">
                  {monthTransactions.map((t, i) => (
                    <TransactionCard
                      key={t.id}
                      transaction={t}
                      index={i}
                      onToggle={() => financeService.toggleStatus(t.id, t.status).then(reload)}
                      onEdit={() => setEditingTransaction(t)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </section>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Dívidas parceladas (global) */}
      {!loading && Object.keys(dividasAgrupadas).length > 0 && (
        <section className="mt-8 space-y-3" aria-label="Progresso das dívidas">
          <h2 className="text-t-muted px-1 text-xs font-black uppercase">Progresso das Dívidas</h2>
          {Object.entries(dividasAgrupadas).map(([name, info]) => {
            const p = Math.round((info.pagas / info.total) * 100);
            return (
              <div key={name} className="border-t-border bg-t-surface rounded-2xl border p-4">
                <div className="mb-1 flex justify-between">
                  <p className="text-sm font-bold">{name}</p>
                  <p className="text-t-muted text-xs">
                    {info.pagas}/{info.total}
                  </p>
                </div>
                {info.totalDebt > 0 && (
                  <p className="text-t-muted mb-2 text-[10px]">
                    Total: {formatBRL(info.totalDebt)}
                  </p>
                )}
                <div
                  className="bg-t-border h-2 overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={p}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progresso de ${name}`}
                >
                  <motion.div
                    className="bg-t-accent h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${p}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSaved={() => {
            setEditingTransaction(null);
            reload();
          }}
        />
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Novo lançamento"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mx-auto w-full max-w-lg"
            >
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="text-t-muted"
                  aria-label="Fechar"
                >
                  Fechar
                </button>
              </div>
              <AddTransactionForm
                onTransactionAdded={(date) => {
                  const month = date.slice(0, 7);
                  if (month !== currentMonth) {
                    setDirection(month > currentMonth ? 1 : -1);
                    setCurrentMonth(month);
                  }
                  reload();
                  setShowForm(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.85, rotate: 90 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowForm(true)}
        className="bg-t-accent fixed right-6 bottom-24 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-light text-white shadow-2xl"
        aria-label="Adicionar novo lançamento"
      >
        +
      </motion.button>
    </main>
  );
}
