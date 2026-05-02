import { formatBRL } from "../lib/utils";

export function SummaryCard({ income, expenses }: { income: number; expenses: number }) {
  const balance = income - expenses;
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">Renda Prevista</p>
        <p className="text-2xl font-bold text-emerald-500">{formatBRL(income)}</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">Dívidas/Gastos do Mês</p>
        <p className="text-2xl font-bold text-rose-500">{formatBRL(expenses)}</p>
      </div>
      <div
        className={`rounded-2xl border p-4 ${balance < 0 ? "border-rose-900 bg-rose-950" : "border-slate-800 bg-slate-900"}`}
      >
        <p className="text-sm text-slate-400">Saldo Restante (Fôlego)</p>
        <p className={`text-2xl font-bold ${balance < 0 ? "text-rose-400" : "text-white"}`}>
          {formatBRL(balance)}
        </p>
      </div>
    </div>
  );
}
