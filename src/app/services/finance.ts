import { supabase } from "@/lib/supabase";
import { Transaction, TransactionInsert, TransactionStatus } from "@/types/finance";

export const financeService = {
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
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

  async addTransaction(transaction: TransactionInsert): Promise<Transaction[]> {
    const { data, error } = await supabase.from("transactions").insert([transaction]).select();

    if (error) throw error;
    return (data as Transaction[]) || [];
  },
};
