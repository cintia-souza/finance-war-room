import { supabase } from "@/lib/supabase";
import { Transaction, TransactionInsert, TransactionStatus } from "@/types/finance";

async function getUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  return user.id;
}

export const financeService = {
  async getTransactions(): Promise<Transaction[]> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return (data as Transaction[]) || [];
  },

  async toggleStatus(id: string, currentStatus: TransactionStatus): Promise<void> {
    const newStatus: TransactionStatus = currentStatus === "pago" ? "pendente" : "pago";

    const { error } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar status:", error.message);
      throw error;
    }
  },

  async updateTransaction(id: string, updates: Partial<TransactionInsert>): Promise<void> {
    const { error } = await supabase.from("transactions").update(updates).eq("id", id);

    if (error) {
      console.error("Erro ao editar transação:", error.message);
      throw error;
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir transação:", error.message);
      throw error;
    }
  },

  async addTransaction(transaction: TransactionInsert): Promise<Transaction[]> {
    const { data, error } = await supabase.from("transactions").insert([transaction]).select();

    if (error) {
      console.error("Erro ao adicionar transação:", error.message, error.details, error.hint);
      throw error;
    }
    return (data as Transaction[]) || [];
  },

  async importTransactions(transactions: TransactionInsert[]): Promise<number> {
    const batchSize = 50;
    let imported = 0;

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const { error } = await supabase.from("transactions").insert(batch);

      if (error) {
        console.error("Erro ao importar lote:", error.message);
        throw error;
      }
      imported += batch.length;
    }

    return imported;
  },
};
