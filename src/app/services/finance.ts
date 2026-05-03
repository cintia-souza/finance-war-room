import { supabase } from "@/lib/supabase";
import { Transaction, TransactionInsert, TransactionStatus } from "@/types/finance";
import { transactionInsertSchema, transactionUpdateSchema } from "@/lib/validations";

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
    const userId = await getUserId();
    const newStatus: TransactionStatus = currentStatus === "pago" ? "pendente" : "pago";

    const { error } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", id)
      .eq("user_id", userId); // Double-check ownership

    if (error) {
      console.error("Erro ao atualizar status:", error.message);
      throw error;
    }
  },

  async updateTransaction(id: string, updates: Partial<TransactionInsert>): Promise<void> {
    const userId = await getUserId();

    // Validate input
    const parsed = transactionUpdateSchema.safeParse(updates);
    if (!parsed.success) throw new Error("Dados inválidos");

    const { error } = await supabase
      .from("transactions")
      .update(parsed.data)
      .eq("id", id)
      .eq("user_id", userId); // Double-check ownership

    if (error) {
      console.error("Erro ao editar transação:", error.message);
      throw error;
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    const userId = await getUserId();

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao excluir transação:", error.message);
      throw error;
    }
  },

  async deleteMultiple(ids: string[]): Promise<void> {
    const userId = await getUserId();

    const { error } = await supabase
      .from("transactions")
      .delete()
      .in("id", ids)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao excluir transações:", error.message);
      throw error;
    }
  },

  async addTransaction(transaction: TransactionInsert): Promise<Transaction[]> {
    // Validate input
    const parsed = transactionInsertSchema.safeParse(transaction);
    if (!parsed.success) {
      console.error("Validação falhou:", parsed.error.message);
      throw new Error("Dados inválidos");
    }

    const { data, error } = await supabase.from("transactions").insert([parsed.data]).select();

    if (error) {
      console.error("Erro ao adicionar transação:", error.message, error.details, error.hint);
      throw error;
    }
    return (data as Transaction[]) || [];
  },

  async importTransactions(transactions: TransactionInsert[]): Promise<number> {
    const userId = await getUserId();
    const batchSize = 50;
    let imported = 0;

    // Validate all and enforce user_id
    const validated = transactions.map((t) => {
      const parsed = transactionInsertSchema.safeParse({ ...t, user_id: userId });
      if (!parsed.success) throw new Error(`Transação inválida: ${t.description}`);
      return parsed.data;
    });

    for (let i = 0; i < validated.length; i += batchSize) {
      const batch = validated.slice(i, i + batchSize);
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
