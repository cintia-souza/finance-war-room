"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  TransactionType,
  TransactionCategory,
  TransactionInsert,
  RECEITA_CATEGORIES,
  DESPESA_CATEGORIES,
  CATEGORY_LABELS,
} from "@/types/finance";
import { financeService } from "@/app/services/finance";

interface AddTransactionFormProps {
  onTransactionAdded: () => void;
}

export default function AddTransactionForm({ onTransactionAdded }: AddTransactionFormProps) {
  const [type, setType] = useState<TransactionType>("despesa");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("moradia");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasInstallments, setHasInstallments] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState("");
  const [totalDebt, setTotalDebt] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = type === "receita" ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === "receita" ? "salario" : "moradia");
    setHasInstallments(false);
    setIsRecurring(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      const parsedInstallments = hasInstallments ? parseInt(totalInstallments) : null;
      const parsedDebt = hasInstallments ? parseFloat(totalDebt || amount) : null;

      if (hasInstallments && parsedInstallments && parsedInstallments > 1) {
        const installmentAmount = parsedDebt ? parsedDebt / parsedInstallments : parseFloat(amount);

        for (let i = 1; i <= parsedInstallments; i++) {
          const installmentDate = new Date(dueDate);
          installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

          const transaction: TransactionInsert = {
            description: `${description} (${i}/${parsedInstallments})`,
            amount: Math.round(installmentAmount * 100) / 100,
            type,
            category,
            status: "pendente",
            due_date: installmentDate.toISOString().split("T")[0],
            is_recurring: false,
            total_installments: parsedInstallments,
            current_installment: i,
            total_debt: parsedDebt,
            notes,
            user_id: user.id,
          };
          await financeService.addTransaction(transaction);
        }
      } else {
        const transaction: TransactionInsert = {
          description,
          amount: parseFloat(amount),
          type,
          category,
          status: "pendente",
          due_date: dueDate,
          is_recurring: isRecurring,
          total_installments: null,
          current_installment: null,
          total_debt: null,
          notes: notes || null,
          user_id: user.id,
        };
        await financeService.addTransaction(transaction);
      }

      setDescription("");
      setAmount("");
      setTotalDebt("");
      setTotalInstallments("");
      setNotes("");
      setHasInstallments(false);
      onTransactionAdded();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha ao salvar transação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-t-3xl border-t border-slate-800 bg-slate-900 p-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Novo Lançamento</h3>
        <div className="h-1 w-12 rounded-full bg-slate-700" />
      </div>

      {/* Toggle Receita/Despesa */}
      <div className="flex gap-2 rounded-2xl bg-slate-800 p-1">
        <button
          type="button"
          onClick={() => handleTypeChange("despesa")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
            type === "despesa" ? "bg-rose-600 text-white" : "text-slate-400"
          }`}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("receita")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
            type === "receita" ? "bg-emerald-600 text-white" : "text-slate-400"
          }`}
        >
          Receita
        </button>
      </div>

      <input
        type="text"
        placeholder="Descrição"
        className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white outline-none focus:ring-2 focus:ring-blue-600"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <div className="flex gap-3">
        <input
          type="number"
          step="0.01"
          placeholder={hasInstallments ? "Valor da parcela" : "Valor"}
          className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 p-4 font-mono text-white outline-none focus:ring-2 focus:ring-blue-600"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          className="max-w-[140px] rounded-2xl border border-slate-700 bg-slate-800 p-4 text-sm text-white outline-none"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <input
        type="date"
        value={dueDate}
        className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white outline-none focus:ring-2 focus:ring-blue-600"
        onChange={(e) => setDueDate(e.target.value)}
      />

      {/* Opções extras para despesa */}
      {type === "despesa" && (
        <div className="space-y-3">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked) setHasInstallments(false);
                }}
                className="accent-blue-600"
              />
              Conta fixa mensal
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={hasInstallments}
                onChange={(e) => {
                  setHasInstallments(e.target.checked);
                  if (e.target.checked) setIsRecurring(false);
                }}
                className="accent-blue-600"
              />
              Parcelado
            </label>
          </div>

          {hasInstallments && (
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Nº parcelas"
                min="2"
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 p-4 font-mono text-white outline-none focus:ring-2 focus:ring-blue-600"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor total da dívida"
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 p-4 font-mono text-white outline-none focus:ring-2 focus:ring-blue-600"
                value={totalDebt}
                onChange={(e) => setTotalDebt(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      <textarea
        placeholder="Observações (opcional)"
        rows={2}
        className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full rounded-2xl p-4 font-bold text-white transition-all active:scale-95 disabled:bg-slate-700 ${
          type === "receita"
            ? "bg-emerald-600 hover:bg-emerald-500"
            : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        {isSubmitting ? "Salvando..." : "Confirmar Lançamento"}
      </button>
    </form>
  );
}
