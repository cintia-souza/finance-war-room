import { TransactionCategory, TransactionInsert, TransactionType } from "@/types/finance";

type ParsedRow = {
  date: string;
  description: string;
  amount: number;
};

function guessCategory(description: string): TransactionCategory {
  const d = description.toLowerCase();
  if (/salario|salário|pagamento|proventos/.test(d)) return "salario";
  if (/pix recebido|transferência recebida|ted recebida/.test(d)) return "outros_receita";
  if (/aluguel|condominio|condomínio|iptu/.test(d)) return "moradia";
  if (/luz|energia|cpfl|enel|sabesp|água|agua|saneamento/.test(d)) return "moradia";
  if (/mercado|supermercado|ifood|rappi|restaurante|padaria|lanchonete/.test(d))
    return "alimentacao";
  if (/uber|99|combustível|combustivel|gasolina|estacionamento|pedagio/.test(d))
    return "transporte";
  if (/farmacia|farmácia|drogaria|hospital|médico|medico|plano de saude/.test(d)) return "saude";
  if (/netflix|spotify|disney|amazon prime|youtube|assinatura/.test(d)) return "assinatura";
  if (/nubank|santander|itaú|itau|bradesco|cartão|cartao|fatura/.test(d)) return "cartao";
  if (/parcela|empréstimo|emprestimo|financiamento/.test(d)) return "divida";
  if (/escola|faculdade|curso|udemy|alura/.test(d)) return "educacao";
  if (/cinema|teatro|show|viagem|hotel|lazer/.test(d)) return "lazer";
  return "outros_despesa";
}

function parseDate(raw: string): string {
  // Tenta dd/mm/yyyy
  const brMatch = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;

  // Tenta yyyy-mm-dd
  const isoMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];

  // Tenta yyyymmdd (OFX)
  const ofxMatch = raw.match(/^(\d{4})(\d{2})(\d{2})/);
  if (ofxMatch) return `${ofxMatch[1]}-${ofxMatch[2]}-${ofxMatch[3]}`;

  return new Date().toISOString().split("T")[0];
}

function parseCSV(content: string): ParsedRow[] {
  const lines = content
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const separator = header.includes(";") ? ";" : ",";
  const cols = header.split(separator).map((c) => c.replace(/"/g, "").trim());

  // Detectar colunas
  const dateIdx = cols.findIndex((c) => /data|date/.test(c));
  const descIdx = cols.findIndex((c) => /descri|titulo|title|memo|histórico|historico/.test(c));
  const amountIdx = cols.findIndex((c) => /valor|amount|value|quantia/.test(c));

  if (dateIdx === -1 || amountIdx === -1) return [];

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map((v) => v.replace(/"/g, "").trim());
    if (values.length <= amountIdx) continue;

    const rawAmount = values[amountIdx]
      .replace(/R\$\s?/, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const amount = parseFloat(rawAmount);
    if (isNaN(amount) || amount === 0) continue;

    rows.push({
      date: parseDate(values[dateIdx]),
      description: descIdx >= 0 ? values[descIdx] : "Sem descrição",
      amount,
    });
  }

  return rows;
}

function parseOFX(content: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  const transactions = content.split("<STMTTRN>");

  for (let i = 1; i < transactions.length; i++) {
    const block = transactions[i];

    const dateMatch = block.match(/<DTPOSTED>(\d{8})/);
    const amountMatch = block.match(/<TRNAMT>([-\d.,]+)/);
    const memoMatch = block.match(/<MEMO>([^<\n]+)/) || block.match(/<NAME>([^<\n]+)/);

    if (!dateMatch || !amountMatch) continue;

    const amount = parseFloat(amountMatch[1].replace(",", "."));
    if (isNaN(amount) || amount === 0) continue;

    rows.push({
      date: parseDate(dateMatch[1]),
      description: memoMatch ? memoMatch[1].trim() : "Sem descrição",
      amount,
    });
  }

  return rows;
}

export function parseStatement(content: string, filename: string): ParsedRow[] {
  const ext = filename.toLowerCase();
  if (ext.endsWith(".ofx") || ext.endsWith(".qfx")) {
    return parseOFX(content);
  }
  return parseCSV(content);
}

export function rowsToTransactions(rows: ParsedRow[], userId: string): TransactionInsert[] {
  return rows.map((row) => {
    const type: TransactionType = row.amount > 0 ? "receita" : "despesa";
    const absAmount = Math.abs(row.amount);
    const category =
      type === "receita" ? guessCategory(row.description) : guessCategory(row.description);

    return {
      description: row.description,
      amount: Math.round(absAmount * 100) / 100,
      type,
      category,
      status: "pago" as const,
      due_date: row.date,
      is_recurring: false,
      total_installments: null,
      current_installment: null,
      total_debt: null,
      notes: "Importado do extrato",
      user_id: userId,
    };
  });
}
