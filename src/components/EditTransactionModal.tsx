"use client";
import { useState } from "react";
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  RECEITA_CATEGORIES,
  DESPESA_CATEGORIES,
  CATEGORY_LABELS,
} from "@/types/finance";
import { financeService } from "@/app/services/finance";
import { X } from "lucide-react";
import { formatBRL } from "@/lib/utils";

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSaved: () => void;
}

export function EditTransactionModal({ transaction, onClose, onSaved }: EditTransactionModalProps) {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [category, setCategory] = useState<TransactionCategory>(transaction.category);
  const [dueDate, setDueDate] = useState(transaction.due_date);
  const [notes, setNotes] = useState(transaction.notes ?? "");
  const [loading, setLoading] = useState(false);

  const categories = type === "receita" ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await financeService.updateTransaction(transaction.id, {
        description,
        amount: parseFloat(amount),
        type,
        category,
        due_date: dueDate,
        notes: notes || null,
      });
      onSaved();
    } catch {
      alert("Erro ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
    setLoading(true);
    try {
      await financeService.deleteTransaction(transaction.id);
      onSaved();
    } catch {
      alert("Erro ao excluir lançamento.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-t-border bg-t-bg p-4 text-t-text outline-none focus:ring-2 focus:ring-t-accent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Editar lançamento"
    >
      <div className="mx-auto w-full max-w-lg">
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-t-muted" aria-label="Fechar">
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="border-t-border bg-t-surface max-h-[85vh] space-y-4 overflow-y-auto rounded-t-3xl border-t p-6"
        >
          <h3 className="text-lg font-bold">Editar Lançamento</h3>

          <div className="bg-t-bg flex gap-2 rounded-2xl p-1" role="radiogroup">
            <button
              type="button"
              role="radio"
              aria-checked={type === "despesa"}
              onClick={() => {
                setType("despesa");
                setCategory("moradia");
              }}
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
              onClick={() => {
                setType("receita");
                setCategory("salario");
              }}
              className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
                type === "receita" ? "bg-t-income text-white" : "text-t-muted"
              }`}
            >
              Receita
            </button>
          </div>

          <div>
            <label htmlFor="edit-desc" className="sr-only">
              Descrição
            </label>
            <input
              id="edit-desc"
              type="text"
              placeholder="Descrição"
              value={description}
              required
              className={inputClass}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-amount" className="sr-only">
                Valor
              </label>
              <input
                id="edit-amount"
                type="number"
                step="0.01"
                placeholder="Valor"
                value={amount}
                required
                className={`${inputClass} font-mono`}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-category" className="sr-only">
                Categoria
              </label>
              <select
                id="edit-category"
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
            <label htmlFor="edit-date" className="sr-only">
              Data
            </label>
            <input
              id="edit-date"
              type="date"
              value={dueDate}
              className={inputClass}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {transaction.total_installments && (
            <p className="text-t-muted text-xs">
              Parcela {transaction.current_installment}/{transaction.total_installments}
              {transaction.total_debt && ` • Dívida total: ${formatBRL(transaction.total_debt)}`}
            </p>
          )}

          <div>
            <label htmlFor="edit-notes" className="sr-only">
              Observações
            </label>
            <textarea
              id="edit-notes"
              placeholder="Observações (opcional)"
              rows={2}
              value={notes}
              className={`${inputClass} text-sm`}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-t-accent w-full rounded-2xl p-4 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="border-t-danger/30 bg-t-danger/10 text-t-danger w-full rounded-2xl border p-4 font-bold disabled:opacity-50"
          >
            Excluir Lançamento
          </button>
        </form>
      </div>
    </div>
  );
}
