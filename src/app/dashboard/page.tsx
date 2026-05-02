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

  const navigateMonth = (dir: number) => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const monthLabel = new Date(currentMonth + "-01").toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="p-4" role="main" aria-label="Dashboard financeiro">
      <DashboardHeader />

      <nav className="mb-6 flex items-center justify-between" aria-label="Navegação por mês">
        <button
          onClick={() => navigateMonth(-1)}
          className="text-t-muted p-2"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="text-t-text text-sm font-bold capitalize" aria-live="polite">
          {monthLabel}
        </p>
        <button
          onClick={() => navigateMonth(1)}
          className="text-t-muted p-2"
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} />
        </button>
      </nav>

      <section className="mb-6 grid grid-cols-3 gap-3" aria-label="Resumo financeiro">
        <div className="border-t-border bg-t-surface rounded-2xl border p-3">
          <div className="mb-1 flex items-center gap-1">
            <TrendingUp size={12} className="text-t-income" aria-hidden="true" />
            <p className="text-t-muted text-[10px] font-bold uppercase">Receitas</p>
          </div>
          <p className="text-t-income font-mono text-sm font-bold">{formatBRL(receitas)}</p>
        </div>
        <div className="border-t-border bg-t-surface rounded-2xl border p-3">
          <div className="mb-1 flex items-center gap-1">
            <TrendingDown size={12} className="text-t-expense" aria-hidden="true" />
            <p className="text-t-muted text-[10px] font-bold uppercase">Despesas</p>
          </div>
          <p className="text-t-expense font-mono text-sm font-bold">{formatBRL(despesas)}</p>
        </div>
        <div className="border-t-border bg-t-surface rounded-2xl border p-3">
          <p className="text-t-muted mb-1 text-[10px] font-bold uppercase">Saldo</p>
          <p
            className={`font-mono text-sm font-bold ${saldo >= 0 ? "text-t-income" : "text-t-expense"}`}
          >
            {formatBRL(saldo)}
          </p>
        </div>
      </section>

      {despesas > 0 && (
        <div className="mb-8">
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
            <div
              className="bg-t-success h-full rounded-full transition-all"
              style={{ width: `${Math.min(progresso, 100)}%` }}
            />
          </div>
        </div>
      )}

      {Object.keys(dividasAgrupadas).length > 0 && (
        <section className="mb-8 space-y-3" aria-label="Progresso das dívidas">
          <h2 className="text-t-muted px-1 text-xs font-black uppercase">Progresso das Dívidas</h2>
          {Object.entries(dividasAgrupadas).map(([name, info]) => {
            const p = Math.round((info.pagas / info.total) * 100);
            return (
              <div key={name} className="border-t-border bg-t-surface rounded-2xl border p-4">
                <div className="mb-1 flex justify-between">
                  <p className="text-sm font-bold">{name}</p>
                  <p className="text-t-muted text-xs">
                    {info.pagas}/{info.total} parcelas
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
                  <div
                    className="bg-t-accent h-full rounded-full transition-all"
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section className="space-y-3" aria-label="Lançamentos do mês">
        <h2 className="text-t-muted px-1 text-xs font-black uppercase">Lançamentos do Mês</h2>
        {monthTransactions.length === 0 && (
          <p className="text-t-muted py-8 text-center text-sm">Nenhum lançamento neste mês.</p>
        )}
        {monthTransactions.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
              t.status === "pago"
                ? "border-t-border/50 bg-t-surface/30 opacity-40"
                : "border-t-border bg-t-surface"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => financeService.toggleStatus(t.id, t.status).then(reload)}
                className="shrink-0 transition-transform active:scale-90"
                aria-label={
                  t.status === "pago"
                    ? `Marcar ${t.description} como pendente`
                    : `Marcar ${t.description} como pago`
                }
              >
                {t.status === "pago" ? (
                  <CheckCircle2 className="text-t-success" size={20} />
                ) : (
                  <Circle className="text-t-muted hover:text-t-text" size={20} />
                )}
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{t.description}</p>
                <p className="text-t-muted text-[10px]">
                  {CATEGORY_LABELS[t.category] ?? t.category}
                  {t.is_recurring && " • Fixo"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setEditingTransaction(t)}
                className="bg-t-border text-t-muted hover:text-t-accent rounded-full p-1.5"
                aria-label={`Editar ${t.description}`}
              >
                <Pencil size={12} />
              </button>
              <p
                className={`font-mono text-sm font-bold ${t.type === "receita" ? "text-t-income" : t.status === "pago" ? "text-t-muted" : "text-t-text"}`}
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
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Novo lançamento"
        >
          <div className="mx-auto w-full max-w-lg">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowForm(false)}
                className="text-t-muted"
                aria-label="Fechar formulário"
              >
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
        className="bg-t-accent fixed right-6 bottom-24 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-light text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
        aria-label="Adicionar novo lançamento"
      >
        +
      </button>
    </main>
  );
}
