export type TransactionCategory = "fixo" | "variavel" | "divida" | "renda" | "investimento";
export type TransactionStatus = "pendente" | "pago";

export type Transaction = {
  id: string;
  created_at: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  status: TransactionStatus;
  due_date: string;
  user_id: string;
};

export type TransactionInsert = Omit<Transaction, "id" | "created_at">;
