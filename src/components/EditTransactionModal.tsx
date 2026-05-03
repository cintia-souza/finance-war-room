"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
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
import { ConfirmModal } from "@/components/ConfirmModal";

interface EditTransactionModalProps {
  transaction: Transaction;
  allTransactions: Transaction[];
  onClose: () => void;
  onSaved: () => void;
}

export function EditTransactionModal({
  transaction,
  allTransactions,
  onClose,
  onSaved,
}: EditTransactionModalProps) {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [category, setCategory] = useState<TransactionCategory>(transaction.category);
  const [dueDate, setDueDate] = useState(transaction.due_date);
  const [notes, setNotes] = useState(transaction.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "all" | null>(null);

  const categories = type === "receita" ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;

  // Encontrar parcelas irmãs (mesma descrição base)
  const baseName = transaction.description.replace(/\s*\(\d+\/\d+\)$/, "");
  const isInstallment = transaction.total_installments && transaction.total_installments > 1;
  const siblingIds = isInstallment
    ? allTransactions
        .filter(
          (t) =>
            t.description.replace(/\s*\(\d+\/\d+\)$/, "") === baseName &&
            t.total_installments === transaction.total_installments,
        )
        .map((t) => t.id)
    : [];

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

  const handleDeleteSingle = async () => {
    setDeleteMode(null);
    setLoading(true);
    try {
      await financeService.deleteTransaction(transaction.id);
      onSaved();
    } catch {
      alert("Erro ao excluir.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleteMode(null);
    setLoading(true);
    try {
      await financeService.deleteMultiple(siblingIds);
      onSaved();
    } catch {
      alert("Erro ao excluir parcelas.");
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
              className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${type === "despesa" ? "bg-t-expense text-white" : "text-t-muted"}`}
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
              className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${type === "receita" ? "bg-t-income text-white" : "text-t-muted"}`}
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

          {isInstallment && (
            <div className="border-t-border bg-t-bg rounded-xl border p-3">
              <p className="text-t-muted text-xs font-bold">
                Parcela {transaction.current_installment}/{transaction.total_installments}
              </p>
              {transaction.total_debt && (
                <p className="text-t-muted text-[10px]">
                  Dívida total: {formatBRL(transaction.total_debt)}
                </p>
              )}
            </div>
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
            className="bg-t-accent hover:bg-t-accent-hover w-full cursor-pointer rounded-2xl p-4 font-bold text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>

          {/* Botões de exclusão */}
          <div className={`space-y-2 ${isInstallment ? "" : ""}`}>
            <button
              type="button"
              onClick={() => setDeleteMode("single")}
              disabled={loading}
              className="border-t-danger/30 bg-t-danger/10 text-t-danger hover:bg-t-danger/20 w-full cursor-pointer rounded-2xl border p-4 font-bold transition-colors disabled:opacity-50"
            >
              Excluir este lançamento
            </button>

            {isInstallment && siblingIds.length > 1 && (
              <button
                type="button"
                onClick={() => setDeleteMode("all")}
                disabled={loading}
                className="border-t-danger/50 bg-t-danger/20 text-t-danger hover:bg-t-danger/30 w-full cursor-pointer rounded-2xl border p-4 font-bold transition-colors disabled:opacity-50"
              >
                Excluir todas as {siblingIds.length} parcelas
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Modais de confirmação */}
      <AnimatePresence>
        {deleteMode === "single" && (
          <ConfirmModal
            title="Excluir lançamento"
            message={`Excluir "${transaction.description}"?`}
            confirmLabel="Excluir"
            cancelLabel="Cancelar"
            danger
            onConfirm={handleDeleteSingle}
            onCancel={() => setDeleteMode(null)}
          />
        )}
        {deleteMode === "all" && (
          <ConfirmModal
            title="Excluir todas as parcelas"
            message={`Excluir todas as ${siblingIds.length} parcelas de "${baseName}"? Essa ação não pode ser desfeita.`}
            confirmLabel={`Excluir ${siblingIds.length} parcelas`}
            cancelLabel="Cancelar"
            danger
            onConfirm={handleDeleteAll}
            onCancel={() => setDeleteMode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
