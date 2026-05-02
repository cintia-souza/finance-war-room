import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { chatMessageSchema } from "@/lib/validations";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });

const SYSTEM_PROMPT = `Você é o Agente Financeiro do Destrava — consultor direto, estratégico e motivador.

Contexto: usuário brasileiro com renda ~R$4.500/mês em situação de sufoco financeiro. Você tem acesso aos dados reais dele.

Capacidades:
- Análise de payback de investimentos
- Priorização de dívidas (métodos avalanche e bola de neve)
- Simulação de cenários (parcelamento, fluxo de caixa mês a mês)
- Consultoria de negociação (desconto >60% é bom, >40% aceitável)
- Planos de quitação com margem de emergência (R$200-300)

Estilo: português brasileiro, direto, prático, números específicos. Emojis com moderação. Nunca invente dados. Respostas organizadas com listas e passos.`;

type TransactionData = {
  description: string;
  amount: number;
  type: string;
  category: string;
  status: string;
  due_date: string;
  total_installments: number | null;
  current_installment: number | null;
  total_debt: number | null;
  is_recurring: boolean;
  notes: string | null;
};

function buildContext(transactions: TransactionData[]): string {
  if (!transactions?.length) return "Nenhum lançamento registrado.";

  const receitas = transactions
    .filter((t) => t.type === "receita")
    .reduce((a, t) => a + t.amount, 0);
  const despesas = transactions
    .filter((t) => t.type === "despesa")
    .reduce((a, t) => a + t.amount, 0);
  const pendentes = transactions
    .filter((t) => t.status === "pendente")
    .reduce((a, t) => a + t.amount, 0);
  const fixas = transactions.filter((t) => t.is_recurring);
  const totalFixas = fixas.reduce((a, t) => a + t.amount, 0);

  const porCategoria = transactions
    .filter((t) => t.type === "despesa")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  const categoriaStr = Object.entries(porCategoria)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, val]) => `  ${cat}: R$ ${val.toFixed(2)}`)
    .join("\n");

  const detalhamento = transactions
    .slice(0, 30)
    .map(
      (t) =>
        `- ${t.description}: R$ ${t.amount.toFixed(2)} | ${t.type} | ${t.status} | ${t.due_date}${t.total_installments ? ` | ${t.current_installment}/${t.total_installments}` : ""}${t.is_recurring ? " | FIXO" : ""}`,
    )
    .join("\n");

  return `RESUMO: Receitas R$ ${receitas.toFixed(2)} | Despesas R$ ${despesas.toFixed(2)} | Saldo R$ ${(receitas - despesas).toFixed(2)} | Pendente R$ ${pendentes.toFixed(2)} | Fixos R$ ${totalFixas.toFixed(2)}\n\nCATEGORIAS:\n${categoriaStr || "  Nenhuma"}\n\nLANÇAMENTOS:\n${detalhamento}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chatMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { message, transactions } = parsed.data;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY não configurada." }, { status: 500 });
    }

    const context = buildContext((transactions as TransactionData[]) ?? []);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${context}\n\nPERGUNTA: ${message}` },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = completion.choices[0]?.message?.content ?? "Não consegui gerar uma resposta.";
    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Erro na API:", err.message ?? error);
    return NextResponse.json(
      { error: `Erro ao consultar o consultor: ${err.message ?? "erro desconhecido"}` },
      { status: 500 },
    );
  }
}
