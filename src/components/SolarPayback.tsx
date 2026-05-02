"use client";
import { formatBRL } from "@/lib/utils";

export default function SolarPayback() {
  const investimentoTotal = 18000;
  const economiaMensal = 190;
  const mesesPayback = Math.ceil(investimentoTotal / economiaMensal);
  const anosPayback = (mesesPayback / 12).toFixed(1);

  return (
    <div className="border-t-accent/20 bg-t-surface rounded-3xl border p-6 shadow-2xl">
      <h3 className="text-t-accent mb-4 flex items-center gap-2 font-bold">📊 Viabilidade Solar</h3>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <span className="text-t-muted text-sm">Investimento (Reforma + Solar)</span>
          <span className="font-mono font-bold">{formatBRL(investimentoTotal)}</span>
        </div>
        <div className="bg-t-border h-2 w-full overflow-hidden rounded-full">
          <div className="bg-t-accent h-full w-[15%]" />
        </div>
        <p className="text-t-muted text-center text-xs italic">
          O projeto se paga em **{mesesPayback} meses** (~{anosPayback} anos).
        </p>
      </div>
    </div>
  );
}
