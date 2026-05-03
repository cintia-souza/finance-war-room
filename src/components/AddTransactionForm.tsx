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
  onTransactionAdded: (date: string) => void;
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
      onTransactionAdded(dueDate);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha ao salvar transação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-t-border bg-t-surface p-4 text-t-text outline-none focus:ring-2 focus:ring-t-accent";

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t-border bg-t-surface max-h-[85vh] space-y-4 overflow-y-auto rounded-t-3xl border-t p-6"
      aria-label="Formulário de novo lançamento"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold">Novo Lançamento</h3>
        <div className="bg-t-border h-1 w-12 rounded-full" aria-hidden="true" />
      </div>

      <fieldset>
        <legend className="sr-only">Tipo de lançamento</legend>
        <div className="bg-t-bg flex gap-2 rounded-2xl p-1" role="radiogroup">
          <button
            type="button"
            role="radio"
            aria-checked={type === "despesa"}
            onClick={() => handleTypeChange("despesa")}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
              type === "despesa" ? "bg-t-expense text-white" : "text-t-muted"
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={type === "receita"}
            onClick={() => handleTypeChange("receita")}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
              type === "receita" ? "bg-t-income text-white" : "text-t-muted"
            }`}
          >
            Receita
          </button>
        </div>
      </fieldset>

      <div>
        <label htmlFor="add-description" className="sr-only">
          Descrição
        </label>
        <input
          id="add-description"
          type="text"
          placeholder="Descrição"
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="add-amount" className="sr-only">
            Valor
          </label>
          <input
            id="add-amount"
            type="number"
            step="0.01"
            placeholder={hasInstallments ? "Valor parcela" : "Valor"}
            className={`${inputClass} font-mono`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="add-category" className="sr-only">
            Categoria
          </label>
          <select
            id="add-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className={`${inputClass} text-sm`}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between px-1">
          <label htmlFor="add-date" className="text-t-muted text-xs font-bold">
            {type === "receita" ? "Data de recebimento" : "Data de vencimento"}
          </label>
          {dueDate > new Date().toISOString().split("T")[0] && (
            <span className="bg-t-accent/10 text-t-accent rounded-lg px-2 py-0.5 text-[10px] font-bold">
              Agendado
            </span>
          )}
        </div>
        <input
          id="add-date"
          type="date"
          value={dueDate}
          className={inputClass}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {type === "despesa" && (
        <fieldset className="space-y-3">
          <legend className="sr-only">Opções da despesa</legend>
          <div className="flex gap-4">
            <label className="text-t-muted flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked) setHasInstallments(false);
                }}
                className="accent-t-accent"
              />
              Conta fixa
            </label>
            <label className="text-t-muted flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hasInstallments}
                onChange={(e) => {
                  setHasInstallments(e.target.checked);
                  if (e.target.checked) setIsRecurring(false);
                }}
                className="accent-t-accent"
              />
              Parcelado
            </label>
          </div>

          {hasInstallments && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="add-installments" className="sr-only">
                  Número de parcelas
                </label>
                <input
                  id="add-installments"
                  type="number"
                  placeholder="Nº parcelas"
                  min="2"
                  className={`${inputClass} font-mono`}
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="add-total-debt" className="sr-only">
                  Valor total da dívida
                </label>
                <input
                  id="add-total-debt"
                  type="number"
                  step="0.01"
                  placeholder="Total dívida"
                  className={`${inputClass} font-mono`}
                  value={totalDebt}
                  onChange={(e) => setTotalDebt(e.target.value)}
                />
              </div>
            </div>
          )}
        </fieldset>
      )}

      <div>
        <label htmlFor="add-notes" className="sr-only">
          Observações
        </label>
        <textarea
          id="add-notes"
          placeholder="Observações (opcional)"
          rows={2}
          className={`${inputClass} text-sm`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full rounded-2xl p-4 font-bold text-white transition-all active:scale-95 disabled:opacity-50 ${
          type === "receita" ? "bg-t-income" : "bg-t-accent"
        }`}
      >
        {isSubmitting ? "Salvando..." : "Confirmar Lançamento"}
      </button>
    </form>
  );
}
