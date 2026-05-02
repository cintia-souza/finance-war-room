import { z } from "zod/v4";

export const transactionInsertSchema = z.object({
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição muito longa")
    .trim(),
  amount: z.number().positive("Valor deve ser positivo").max(99_999_999, "Valor muito alto"),
  type: z.enum(["receita", "despesa"]),
  category: z.enum([
    "salario",
    "freelance",
    "outros_receita",
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
  ]),
  status: z.enum(["pendente", "pago"]),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  is_recurring: z.boolean(),
  total_installments: z.number().int().min(2).max(360).nullable(),
  current_installment: z.number().int().min(1).max(360).nullable(),
  total_debt: z.number().positive().max(99_999_999).nullable(),
  notes: z.string().max(500).nullable(),
  user_id: z.string().uuid("ID de usuário inválido"),
});

export const transactionUpdateSchema = transactionInsertSchema.partial().omit({ user_id: true });

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Mensagem vazia").max(2000, "Mensagem muito longa").trim(),
  transactions: z.array(z.any()).optional(),
});

export type TransactionInsertInput = z.infer<typeof transactionInsertSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
