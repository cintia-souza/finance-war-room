"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Check, X, ArrowLeft, AlertCircle } from "lucide-react";
import { parseStatement, rowsToTransactions } from "@/lib/statementParser";
import { TransactionInsert, CATEGORY_LABELS } from "@/types/finance";
import { financeService } from "@/app/services/finance";
import { supabase } from "@/lib/supabase";
import { formatBRL } from "@/lib/utils";
import Link from "next/link";

type Step = "upload" | "preview" | "importing" | "done";

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [transactions, setTransactions] = useState<TransactionInsert[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    try {
      const content = await file.text();
      const rows = parseStatement(content, file.name);

      if (rows.length === 0) {
        setError("Nenhuma transação encontrada. Verifique o formato do arquivo.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão expirada.");
        return;
      }

      const parsed = rowsToTransactions(rows, user.id);
      setTransactions(parsed);
      setSelected(new Set(parsed.map((_, i) => i)));
      setFileName(file.name);
      setStep("preview");
    } catch {
      setError("Erro ao ler o arquivo. Tente outro formato.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    setStep("importing");
    try {
      const toImport = transactions.filter((_, i) => selected.has(i));
      const count = await financeService.importTransactions(toImport);
      setImportedCount(count);
      setStep("done");
    } catch {
      setError("Erro ao importar. Tente novamente.");
      setStep("preview");
    }
  };

  const toggleItem = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === transactions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(transactions.map((_, i) => i)));
    }
  };

  const receitas = transactions
    .filter((_, i) => selected.has(i))
    .filter((t) => t.type === "receita")
    .reduce((a, t) => a + t.amount, 0);

  const despesas = transactions
    .filter((_, i) => selected.has(i))
    .filter((t) => t.type === "despesa")
    .reduce((a, t) => a + t.amount, 0);

  return (
    <main className="p-4">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="bg-t-border text-t-muted hover:text-t-text flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-sm font-bold">Importar Extrato</h1>
          <p className="text-t-muted text-[10px]">CSV ou OFX do seu banco</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* UPLOAD */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-t-border bg-t-surface hover:border-t-accent/50 flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-colors"
            >
              <Upload size={40} className="text-t-muted" />
              <div className="text-center">
                <p className="font-bold">Arraste o arquivo aqui</p>
                <p className="text-t-muted mt-1 text-xs">ou clique para selecionar</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-t-border text-t-muted rounded-lg px-3 py-1 text-[10px] font-bold">
                  .CSV
                </span>
                <span className="bg-t-border text-t-muted rounded-lg px-3 py-1 text-[10px] font-bold">
                  .OFX
                </span>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.ofx,.qfx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {error && (
              <div className="bg-t-danger/10 text-t-danger mt-4 flex items-center gap-2 rounded-xl p-3 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="mt-8 space-y-3">
              <h3 className="text-t-muted text-xs font-black uppercase">Como exportar</h3>
              {[
                { bank: "Nubank", steps: "App → Início → Extrato → Exportar → CSV" },
                { bank: "Itaú", steps: "App → Extrato → Compartilhar → OFX" },
                { bank: "Santander", steps: "App → Extrato → Exportar → CSV" },
                { bank: "Bradesco", steps: "Internet Banking → Extrato → Salvar como OFX" },
                { bank: "Inter", steps: "App → Extrato → Exportar → CSV" },
              ].map(({ bank, steps }) => (
                <div key={bank} className="border-t-border bg-t-surface rounded-xl border p-3">
                  <p className="text-sm font-bold">{bank}</p>
                  <p className="text-t-muted text-[10px]">{steps}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PREVIEW */}
        {step === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-t-accent" />
                <p className="text-sm font-bold">{fileName}</p>
              </div>
              <button
                onClick={() => {
                  setStep("upload");
                  setTransactions([]);
                  setError("");
                }}
                className="text-t-muted hover:text-t-text text-xs"
              >
                Trocar arquivo
              </button>
            </div>

            {/* Resumo */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="border-t-border bg-t-surface rounded-xl border p-3 text-center">
                <p className="text-t-muted text-[10px] font-bold uppercase">Selecionados</p>
                <p className="font-mono text-sm font-bold">
                  {selected.size}/{transactions.length}
                </p>
              </div>
              <div className="border-t-border bg-t-surface rounded-xl border p-3 text-center">
                <p className="text-t-muted text-[10px] font-bold uppercase">Receitas</p>
                <p className="text-t-income font-mono text-sm font-bold">{formatBRL(receitas)}</p>
              </div>
              <div className="border-t-border bg-t-surface rounded-xl border p-3 text-center">
                <p className="text-t-muted text-[10px] font-bold uppercase">Despesas</p>
                <p className="text-t-expense font-mono text-sm font-bold">{formatBRL(despesas)}</p>
              </div>
            </div>

            {/* Selecionar todos */}
            <button
              onClick={toggleAll}
              className="text-t-accent mb-3 text-xs font-bold hover:underline"
            >
              {selected.size === transactions.length ? "Desmarcar todos" : "Selecionar todos"}
            </button>

            {/* Lista */}
            <div className="max-h-[50vh] space-y-2 overflow-y-auto">
              {transactions.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => toggleItem(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                    selected.has(i)
                      ? "border-t-accent/30 bg-t-accent/5"
                      : "border-t-border bg-t-surface opacity-50"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      selected.has(i) ? "border-t-accent bg-t-accent" : "border-t-border"
                    }`}
                  >
                    {selected.has(i) && <Check size={12} className="text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.description}</p>
                    <p className="text-t-muted text-[10px]">
                      {t.due_date} • {CATEGORY_LABELS[t.category]}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 font-mono text-sm font-bold ${
                      t.type === "receita" ? "text-t-income" : "text-t-expense"
                    }`}
                  >
                    {t.type === "receita" ? "+" : "-"}
                    {formatBRL(t.amount)}
                  </p>
                </motion.div>
              ))}
            </div>

            {error && (
              <div className="bg-t-danger/10 text-t-danger mt-3 flex items-center gap-2 rounded-xl p-3 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setStep("upload");
                  setTransactions([]);
                }}
                className="border-t-border bg-t-bg text-t-text hover:bg-t-surface flex-1 cursor-pointer rounded-2xl border p-4 text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0}
                className="bg-t-accent hover:bg-t-accent-hover flex-1 cursor-pointer rounded-2xl p-4 text-sm font-bold text-white transition-colors disabled:opacity-50"
              >
                Importar {selected.size} itens
              </button>
            </div>
          </motion.div>
        )}

        {/* IMPORTING */}
        {step === "importing" && (
          <motion.div
            key="importing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-16"
          >
            <div className="border-t-border border-t-t-accent h-10 w-10 animate-spin rounded-full border-2" />
            <p className="text-sm font-bold">Importando transações...</p>
            <p className="text-t-muted text-xs">Isso pode levar alguns segundos</p>
          </motion.div>
        )}

        {/* DONE */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-t-success flex h-16 w-16 items-center justify-center rounded-full"
            >
              <Check size={32} className="text-white" />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-bold">{importedCount} transações importadas!</p>
              <p className="text-t-muted mt-1 text-xs">Seus dados já estão no dashboard.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("upload");
                  setTransactions([]);
                  setImportedCount(0);
                }}
                className="border-t-border bg-t-bg hover:bg-t-surface cursor-pointer rounded-2xl border px-6 py-3 text-sm font-bold transition-colors"
              >
                Importar outro
              </button>
              <Link
                href="/dashboard"
                className="bg-t-accent hover:bg-t-accent-hover cursor-pointer rounded-2xl px-6 py-3 text-sm font-bold text-white transition-colors"
              >
                Ver dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
