export type TransactionType = "receita" | "despesa";
export type TransactionCategory =
  | "salario"
  | "freelance"
  | "outros_receita"
  | "moradia"
  | "alimentacao"
  | "transporte"
  | "saude"
  | "educacao"
  | "lazer"
  | "divida"
  | "cartao"
  | "assinatura"
  | "outros_despesa";
export type TransactionStatus = "pendente" | "pago";

export type Transaction = {
  id: string;
  created_at: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  status: TransactionStatus;
  due_date: string;
  is_recurring: boolean;
  total_installments: number | null;
  current_installment: number | null;
  total_debt: number | null;
  notes: string | null;
  user_id: string;
};

export type TransactionInsert = Omit<Transaction, "id" | "created_at">;

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salario: "Salário",
  freelance: "Freelance",
  outros_receita: "Outros (Receita)",
  moradia: "Moradia",
  alimentacao: "Alimentação",
  transporte: "Transporte",
  saude: "Saúde",
  educacao: "Educação",
  lazer: "Lazer",
  divida: "Dívida",
  cartao: "Cartão",
  assinatura: "Assinatura",
  outros_despesa: "Outros (Despesa)",
};

export const RECEITA_CATEGORIES: TransactionCategory[] = ["salario", "freelance", "outros_receita"];

export const DESPESA_CATEGORIES: TransactionCategory[] = [
  "moradia",
  "alimentacao",
  "transporte",
  "saude",
  "educacao",
  "lazer",
  "divida",
  "cartao",
  "assinatura",
  "outros_despesa",
];
