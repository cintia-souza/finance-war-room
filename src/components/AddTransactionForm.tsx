"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

import { TransactionCategory, TransactionInsert } from "@/types/finance";
import { financeService } from "@/app/services/finance";

interface AddTransactionFormProps {
  onTransactionAdded: () => void;
}

export default function AddTransactionForm({ onTransactionAdded }: AddTransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("divida");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const newTransaction: TransactionInsert = {
        description,
        amount: parseFloat(amount),
        category,
        status: "pendente",
        user_id: user.id,
        due_date: new Date().toISOString().split("T")[0],
      };

      await financeService.addTransaction(newTransaction);

      // Reset form
      setDescription("");
      setAmount("");
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
      className="animate-in slide-in-from-bottom space-y-4 rounded-t-3xl border-t border-slate-800 bg-slate-900 p-6 duration-300"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Novo Registro</h3>
        <div className="h-1 w-12 rounded-full bg-slate-700" /> {/* Handle visual para mobile */}
      </div>

      <input
        type="text"
        placeholder="O que você pagou/deve?"
        className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white outline-none focus:ring-2 focus:ring-blue-600"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <div className="flex gap-3">
        <input
          type="number"
          step="0.01"
          placeholder="R$ 0,00"
          className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 p-4 font-mono text-white outline-none focus:ring-2 focus:ring-blue-600"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          className="appearance-none rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white outline-none"
        >
          <option value="divida">Dívida</option>
          <option value="fixo">Fixo</option>
          <option value="renda">Renda</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full transform rounded-2xl bg-blue-600 p-4 font-bold text-white transition-all hover:bg-blue-500 active:scale-95 disabled:bg-slate-700"
      >
        {isSubmitting ? "Salvando..." : "Confirmar Lançamento"}
      </button>
    </form>
  );
}
