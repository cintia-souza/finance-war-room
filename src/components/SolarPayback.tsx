"use client";
import { formatBRL } from "@/lib/utils";

export default function SolarPayback() {
  const investimentoTotal = 18000;
  const economiaMensal = 190;
  const mesesPayback = Math.ceil(investimentoTotal / economiaMensal);
  const anosPayback = (mesesPayback / 12).toFixed(1);

  return (
    <div className="rounded-3xl border border-blue-900/30 bg-slate-900 p-6 shadow-2xl">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-blue-400">📊 Viabilidade Solar</h3>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-slate-400">Investimento (Reforma + Solar)</span>
          <span className="font-mono font-bold text-white">{formatBRL(investimentoTotal)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-[15%] bg-blue-500" /> {/* Exemplo de progresso de economia */}
        </div>
        <p className="text-center text-xs text-slate-500 italic">
          O projeto se paga em **{mesesPayback} meses** (~{anosPayback} anos).
        </p>
      </div>
    </div>
  );
}
