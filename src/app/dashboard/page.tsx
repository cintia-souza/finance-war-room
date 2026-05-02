"use client";
import { useEffect, useState } from "react";

import { Transaction } from "@/types/finance";
import { formatBRL } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Circle, MessageSquare, Zap } from "lucide-react";
import { financeService } from "@/app/services/finance";
import AddTransactionForm from "@/components/AddTransactionForm";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);

  const SALARIO_BASE = 4500;

  const totalDividasPendente = transactions
    .filter((t) => t.status === "pendente")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldoDisponivel = SALARIO_BASE - totalDividasPendente;

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

  const dividasCriticas = transactions.filter(
    (t) =>
      t.status === "pendente" &&
      (t.description.toLowerCase().includes("sabesp") ||
        t.description.toLowerCase().includes("luz")),
  );

  const copyNegotiationText = (description: string, amount: number) => {
    const text = `Olá, gostaria de negociar o débito de ${description} no valor de ${formatBRL(amount)}. Tenho disponibilidade para quitar à vista com um desconto ou parcelar em condições que caibam no meu orçamento atual.`;
    navigator.clipboard.writeText(text);
    alert("Texto de negociação copiado!");
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 pb-24 text-white">
      <header className="mb-8 pt-4">
        <h1 className="text-2xl font-bold tracking-tight italic">WAR ROOM</h1>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase">Saldo Livre</p>
            <p
              className={`font-mono text-xl ${saldoDisponivel < 0 ? "text-rose-500" : "text-emerald-400"}`}
            >
              {formatBRL(saldoDisponivel)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Pendente</p>
            <p className="font-mono text-xl text-rose-500">{formatBRL(totalDividasPendente)}</p>
          </div>
        </div>
      </header>

      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-blue-500/30 bg-blue-600/10 p-4">
        <Zap className="text-blue-400" size={24} />
        <div>
          <h4 className="text-sm font-bold text-blue-400">Upgrade: Energia Solar</h4>
          <p className="text-xs text-blue-200/60">
            Parcela estimada: R$ 700,00 vs R$ 890,00 (Economia de R$ 190,00/mês)
          </p>
        </div>
      </div>

      {dividasCriticas.length > 0 && (
        <section className="mb-8 animate-pulse">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-amber-500 uppercase">
            <AlertCircle size={14} /> Alvos Prioritários (Limpar Nome)
          </h3>
          <div className="space-y-3">
            {dividasCriticas.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl border border-amber-900/50 bg-amber-950/30 p-4"
              >
                <div>
                  <p className="font-bold text-amber-200">{t.description}</p>
                  <p className="text-[10px] text-amber-500/70">DÍVIDA EM PROTESTO</p>
                </div>
                <button
                  onClick={() => financeService.toggleStatus(t.id, t.status).then(reload)}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white"
                >
                  QUITAR
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="px-1 text-xs font-black text-slate-500 uppercase">
          Linha de Frente (Dívidas)
        </h3>
        {transactions.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
              t.status === "pago"
                ? "border-slate-900 bg-slate-900/30 opacity-40"
                : "border-slate-800 bg-slate-900 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Botão de Toggle Status */}
              <button
                onClick={() => {
                  financeService.toggleStatus(t.id, t.status).then(reload);
                }}
                className="shrink-0 transition-transform active:scale-90"
              >
                {t.status === "pago" ? (
                  <CheckCircle2 className="text-emerald-500" />
                ) : (
                  <Circle className="text-slate-700 hover:text-slate-500" />
                )}
              </button>

              {/* Info da Transação */}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{t.description}</p>
                <p className="text-[10px] font-medium tracking-wider text-slate-500">
                  {t.category.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botão de Negociação (Aparece apenas se não estiver pago) */}
              {t.status === "pendente" && (
                <button
                  onClick={() => copyNegotiationText(t.description, t.amount)}
                  className="rounded-full bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-blue-400 active:bg-blue-900/20"
                  title="Copiar texto de negociação"
                >
                  <MessageSquare size={16} />
                </button>
              )}

              {/* Valor */}
              <p
                className={`shrink-0 font-mono font-bold ${
                  t.status === "pago" ? "text-slate-500" : "text-white"
                }`}
              >
                {formatBRL(t.amount)}
              </p>
            </div>
          </div>
        ))}
      </section>

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
        className="fixed right-6 bottom-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl font-light shadow-2xl shadow-blue-500/40 transition-all hover:scale-110 active:scale-95"
      >
        +
      </button>
    </main>
  );
}
