import { formatBRL } from "../lib/utils";

export function SummaryCard({ income, expenses }: { income: number; expenses: number }) {
  const balance = income - expenses;
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="border-t-border bg-t-surface rounded-2xl border p-4">
        <p className="text-t-muted text-sm">Renda Prevista</p>
        <p className="text-t-income text-2xl font-bold">{formatBRL(income)}</p>
      </div>
      <div className="border-t-border bg-t-surface rounded-2xl border p-4">
        <p className="text-t-muted text-sm">Dívidas/Gastos do Mês</p>
        <p className="text-t-expense text-2xl font-bold">{formatBRL(expenses)}</p>
      </div>
      <div
        className={`rounded-2xl border p-4 ${balance < 0 ? "border-t-danger/30 bg-t-danger/10" : "border-t-border bg-t-surface"}`}
      >
        <p className="text-t-muted text-sm">Saldo Restante (Fôlego)</p>
        <p className={`text-2xl font-bold ${balance < 0 ? "text-t-danger" : "text-t-text"}`}>
          {formatBRL(balance)}
        </p>
      </div>
    </div>
  );
}
