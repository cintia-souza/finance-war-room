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

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-t-3xl border-t border-slate-800 bg-slate-900 p-6"
        >
          <h3 className="text-lg font-bold text-white">Editar Lançamento</h3>

          {/* Toggle Receita/Despesa */}
          <div className="flex gap-2 rounded-2xl bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => {
                setType("despesa");
                setCategory("moradia");
              }}
              className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
                type === "despesa" ? "bg-rose-600 text-white" : "text-slate-400"
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => {
                setType("receita");
                setCategory("salario");
              }}
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
            value={description}
            required
            className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={amount}
              required
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 p-4 font-mono text-white outline-none focus:ring-2 focus:ring-blue-600"
              onChange={(e) => setAmount(e.target.value)}
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

          {transaction.total_installments && (
            <p className="text-xs text-slate-500">
              Parcela {transaction.current_installment}/{transaction.total_installments}
              {transaction.total_debt && ` • Dívida total: R$ ${transaction.total_debt.toFixed(2)}`}
            </p>
          )}

          <textarea
            placeholder="Observações (opcional)"
            rows={2}
            value={notes}
            className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 p-4 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full rounded-2xl border border-rose-900/50 bg-rose-950/30 p-4 font-bold text-rose-400 disabled:opacity-50"
          >
            Excluir Lançamento
          </button>
        </form>
      </div>
    </div>
  );
}
