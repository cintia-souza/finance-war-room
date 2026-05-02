"use client";
import { useState } from "react";
import { Transaction, TransactionCategory } from "@/types/finance";
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
  const [category, setCategory] = useState<TransactionCategory>(transaction.category);
  const [dueDate, setDueDate] = useState(transaction.due_date);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await financeService.updateTransaction(transaction.id, {
        description,
        amount: parseFloat(amount),
        category,
        due_date: dueDate,
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
              placeholder="R$ 0,00"
              value={amount}
              required
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 p-4 font-mono text-white outline-none focus:ring-2 focus:ring-blue-600"
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="appearance-none rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white outline-none"
            >
              <option value="divida">Dívida</option>
              <option value="fixo">Fixo</option>
              <option value="variavel">Variável</option>
              <option value="renda">Renda</option>
              <option value="investimento">Investimento</option>
            </select>
          </div>

          <input
            type="date"
            value={dueDate}
            className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => setDueDate(e.target.value)}
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
