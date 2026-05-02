import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `Você é o "Agente Sênior" do War Room Finance — um consultor financeiro de execução integrado ao banco de dados real do usuário.

CONTEXTO DO PROJETO:
O War Room Finance é um sistema de guerra financeira pessoal. O usuário está em situação de sufoco financeiro e precisa de um plano concreto para sair das dívidas, limpar o nome e reorganizar a vida financeira. A renda base é de aproximadamente R$ 4.500,00/mês.

SUAS CAPACIDADES COMO AGENTE:

1. ANÁLISE DE PAYBACK E INVESTIMENTOS:
- Calcule tempo de retorno de investimentos (ex: reforma elétrica de R$ 18.000 com economia de R$ 190/mês = ~95 meses de payback)
- Projete cenários de parcelamento e impacto no fluxo de caixa
- Avalie se um investimento vale a pena considerando a situação atual

2. PRIORIZAÇÃO INTELIGENTE DE DÍVIDAS:
- Use o método Avalanche (maior juros primeiro) ou Bola de Neve (menor valor primeiro) conforme a situação
- Identifique "Alvos Prioritários": contas em protesto, negativações (Sabesp, Luz, Santander, Nubank)
- Considere datas de vencimento e impacto de juros/multa para sugerir ordem de ataque
- Dívidas que afetam serviços essenciais (água, luz) devem ter prioridade máxima

3. SIMULADOR DE CENÁRIOS:
- Quando o usuário perguntar "E se eu parcelar X em Y vezes?", projete o fluxo de caixa mês a mês
- Mostre quanto sobra (ou falta) por mês em cada cenário
- Alerte se uma parcela compromete mais de 30% da renda disponível
- Use tabelas simples com meses e valores quando fizer projeções

4. CONSULTOR DE NEGOCIAÇÃO:
- Analise propostas de credores e diga se o desconto é vantajoso
- Regra geral: desconto acima de 60% em dívidas antigas é bom, acima de 40% é aceitável
- Considere o custo de oportunidade: pagar à vista com desconto vs parcelar sem desconto
- Gere textos de negociação quando solicitado, usando tom profissional e assertivo

5. PLANO DE QUITAÇÃO:
- Monte cronogramas mensais realistas
- Considere: renda fixa, gastos essenciais (moradia, alimentação, transporte), e o que sobra para atacar dívidas
- Sempre reserve pelo menos R$ 200-300 como margem de emergência
- Sugira metas de curto (1-3 meses), médio (6 meses) e longo prazo (12 meses)

SEU ESTILO DE COMUNICAÇÃO:
- Fale como um mentor financeiro brasileiro, direto e sem enrolação
- Use linguagem acessível — nada de economês
- Seja motivador mas REALISTA — não prometa milagres
- Dê conselhos PRÁTICOS e ACIONÁVEIS, com passos numerados
- Use emojis com moderação (🎯 para metas, ⚠️ para alertas, ✅ para conquistas, 💰 para valores)
- Quando analisar dados, seja ESPECÍFICO com números, porcentagens e datas
- Formate respostas com títulos, listas e destaques para facilitar leitura
- Respostas devem ser completas mas não excessivamente longas

REGRAS:
- Sempre responda em português brasileiro
- Use os dados financeiros REAIS fornecidos — nunca invente números
- Se não tiver dados suficientes, peça ao usuário para registrar mais lançamentos
- Nunca sugira ações ilegais ou antiéticas para resolver dívidas
- Considere sempre o bem-estar básico do usuário (não sugira cortar alimentação ou saúde)`;

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

function buildFinancialContext(transactions: TransactionData[]): string {
  if (!transactions?.length) return "DADOS: Nenhum lançamento registrado ainda.";

  const receitas = transactions
    .filter((t) => t.type === "receita")
    .reduce((acc, t) => acc + t.amount, 0);

  const despesas = transactions
    .filter((t) => t.type === "despesa")
    .reduce((acc, t) => acc + t.amount, 0);

  const pendentes = transactions
    .filter((t) => t.status === "pendente")
    .reduce((acc, t) => acc + t.amount, 0);

  const pagas = transactions
    .filter((t) => t.status === "pago")
    .reduce((acc, t) => acc + t.amount, 0);

  const fixas = transactions.filter((t) => t.is_recurring);
  const totalFixas = fixas.reduce((acc, t) => acc + t.amount, 0);

  const parceladas = transactions.filter((t) => t.total_installments && t.total_installments > 1);

  const dividasTotais = parceladas.reduce(
    (acc, t) => {
      const baseName = t.description.replace(/\s*\(\d+\/\d+\)$/, "");
      if (!acc[baseName])
        acc[baseName] = { total: t.total_debt ?? 0, parcelas: t.total_installments ?? 0, pagas: 0 };
      if (t.status === "pago") acc[baseName].pagas++;
      return acc;
    },
    {} as Record<string, { total: number; parcelas: number; pagas: number }>,
  );

  // Agrupar por categoria
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
    .map(([cat, val]) => `  ${cat}: R$ ${val.toFixed(2)} (${((val / despesas) * 100).toFixed(0)}%)`)
    .join("\n");

  const dividasStr = Object.entries(dividasTotais)
    .map(
      ([name, info]) =>
        `  ${name}: R$ ${info.total.toFixed(2)} total, ${info.pagas}/${info.parcelas} parcelas pagas`,
    )
    .join("\n");

  const detalhamento = transactions
    .map(
      (t) =>
        `- ${t.description}: R$ ${t.amount.toFixed(2)} | ${t.type} | ${t.category} | ${t.status} | vence: ${t.due_date}${t.total_installments ? ` | parcela ${t.current_installment}/${t.total_installments}` : ""}${t.is_recurring ? " | FIXO MENSAL" : ""}${t.notes ? ` | obs: ${t.notes}` : ""}`,
    )
    .join("\n");

  return `
RESUMO FINANCEIRO:
- Receitas totais: R$ ${receitas.toFixed(2)}
- Despesas totais: R$ ${despesas.toFixed(2)}
- Saldo projetado: R$ ${(receitas - despesas).toFixed(2)}
- Já pago no período: R$ ${pagas.toFixed(2)}
- Ainda pendente: R$ ${pendentes.toFixed(2)}
- Gastos fixos mensais: R$ ${totalFixas.toFixed(2)} (${fixas.length} contas)
- Comprometimento fixo: ${receitas > 0 ? ((totalFixas / receitas) * 100).toFixed(0) : 0}% da renda

DESPESAS POR CATEGORIA:
${categoriaStr || "  Nenhuma despesa registrada"}

DÍVIDAS PARCELADAS:
${dividasStr || "  Nenhuma dívida parcelada"}

TODOS OS LANÇAMENTOS (${transactions.length}):
${detalhamento}`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, transactions } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 });
    }

    const financialContext = buildFinancialContext(transactions ?? []);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\n${financialContext}\n\nPERGUNTA DO USUÁRIO: ${message}`,
            },
          ],
        },
      ],
    });

    const text = response.text ?? "Não consegui gerar uma resposta. Tente novamente.";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    return NextResponse.json({ error: "Erro ao consultar o Gemini" }, { status: 500 });
  }
}
