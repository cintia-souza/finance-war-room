"use client";
import { useEffect, useState } from "react";
import { Transaction, CATEGORY_LABELS } from "@/types/finance";
import { formatBRL } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Pencil,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { financeService } from "@/app/services/finance";
import AddTransactionForm from "@/components/AddTransactionForm";
import { EditTransactionModal } from "@/components/EditTransactionModal";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    let ignore = false;
    financeService.getTransactions().then((data) => {
      if (!ignore) setTransactions(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  function reload() {
    financeService.getTransactions().then(setTransactions);
  }

  // Filtrar por mês
  const monthTransactions = transactions.filter((t) => t.due_date?.startsWith(currentMonth));

  const receitas = monthTransactions
    .filter((t) => t.type === "receita")
    .reduce((acc, t) => acc + t.amount, 0);

  const despesas = monthTransactions
    .filter((t) => t.type === "despesa")
    .reduce((acc, t) => acc + t.amount, 0);

  const despesasPagas = monthTransactions
    .filter((t) => t.type === "despesa" && t.status === "pago")
    .reduce((acc, t) => acc + t.amount, 0);

  const saldo = receitas - despesas;

  // Dívidas com parcelas (agrupar por descrição base)
  const dividas = transactions.filter((t) => t.total_installments && t.total_installments > 1);
  const dividasAgrupadas = dividas.reduce(
    (acc, t) => {
      const baseName = t.description.replace(/\s*\(\d+\/\d+\)$/, "");
      if (!acc[baseName]) {
        acc[baseName] = { total: 0, pagas: 0, totalDebt: t.total_debt ?? 0 };
      }
      acc[baseName].total = t.total_installments ?? 0;
      if (t.status === "pago") acc[baseName].pagas++;
      return acc;
    },
    {} as Record<string, { total: number; pagas: number; totalDebt: number }>,
  );

  const navigateMonth = (direction: number) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  const monthLabel = new Date(currentMonth + "-01").toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="p-4">
      <DashboardHeader />

      {/* Navegação por mês */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="p-2 text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <p className="text-sm font-bold text-slate-300 capitalize">{monthLabel}</p>
        <button onClick={() => navigateMonth(1)} className="p-2 text-slate-400">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Cards resumo */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <div className="mb-1 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <p className="text-[10px] font-bold text-slate-500 uppercase">Receitas</p>
          </div>
          <p className="font-mono text-sm font-bold text-emerald-400">{formatBRL(receitas)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <div className="mb-1 flex items-center gap-1">
            <TrendingDown size={12} className="text-rose-500" />
            <p className="text-[10px] font-bold text-slate-500 uppercase">Despesas</p>
          </div>
          <p className="font-mono text-sm font-bold text-rose-400">{formatBRL(despesas)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <p className="mb-1 text-[10px] font-bold text-slate-500 uppercase">Saldo</p>
          <p
            className={`font-mono text-sm font-bold ${saldo >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {formatBRL(saldo)}
          </p>
        </div>
      </div>

      {/* Barra de progresso do mês */}
      {despesas > 0 && (
        <div className="mb-8">
          <div className="mb-1 flex justify-between text-[10px] text-slate-500">
            <span>Pago: {formatBRL(despesasPagas)}</span>
            <span>Total: {formatBRL(despesas)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min((despesasPagas / despesas) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Progresso das dívidas parceladas */}
      {Object.keys(dividasAgrupadas).length > 0 && (
        <section className="mb-8 space-y-3">
          <h3 className="px-1 text-xs font-black text-slate-500 uppercase">
            Progresso das Dívidas
          </h3>
          {Object.entries(dividasAgrupadas).map(([name, info]) => {
            const progress = (info.pagas / info.total) * 100;
            return (
              <div key={name} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-1 flex justify-between">
                  <p className="text-sm font-bold">{name}</p>
                  <p className="text-xs text-slate-400">
                    {info.pagas}/{info.total} parcelas
                  </p>
                </div>
                {info.totalDebt > 0 && (
                  <p className="mb-2 text-[10px] text-slate-500">
                    Total: {formatBRL(info.totalDebt)}
                  </p>
                )}
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Lista de transações do mês */}
      <section className="space-y-3">
        <h3 className="px-1 text-xs font-black text-slate-500 uppercase">Lançamentos do Mês</h3>
        {monthTransactions.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-600">Nenhum lançamento neste mês.</p>
        )}
        {monthTransactions.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
              t.status === "pago"
                ? "border-slate-900 bg-slate-900/30 opacity-40"
                : "border-slate-800 bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => financeService.toggleStatus(t.id, t.status).then(reload)}
                className="shrink-0 transition-transform active:scale-90"
              >
                {t.status === "pago" ? (
                  <CheckCircle2 className="text-emerald-500" size={20} />
                ) : (
                  <Circle className="text-slate-700 hover:text-slate-500" size={20} />
                )}
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{t.description}</p>
                <p className="text-[10px] text-slate-500">
                  {CATEGORY_LABELS[t.category] ?? t.category}
                  {t.is_recurring && " • Fixo"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingTransaction(t)}
                className="rounded-full bg-slate-800 p-1.5 text-slate-400 hover:text-blue-400"
              >
                <Pencil size={12} />
              </button>
              <p
                className={`font-mono text-sm font-bold ${
                  t.type === "receita"
                    ? "text-emerald-400"
                    : t.status === "pago"
                      ? "text-slate-500"
                      : "text-white"
                }`}
              >
                {t.type === "receita" ? "+" : "-"}
                {formatBRL(t.amount)}
              </p>
            </div>
          </div>
        ))}
      </section>

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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-lg">
            <div className="flex justify-end p-4">
              <button onClick={() => setShowForm(false)} className="text-slate-400">
                Fechar
              </button>
            </div>
            <AddTransactionForm
              onTransactionAdded={() => {
                reload();
                setShowForm(false);
              }}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="fixed right-6 bottom-24 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-light shadow-2xl shadow-blue-500/40 transition-all hover:scale-110 active:scale-95"
      >
        +
      </button>
    </main>
  );
}
