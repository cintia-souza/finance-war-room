"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Sparkles, ArrowLeft } from "lucide-react";
import { Transaction } from "@/types/finance";
import { financeService } from "@/app/services/finance";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_PROMPTS = [
  { text: "🎯 Analise minha situação financeira completa", label: "Diagnóstico" },
  { text: "⚔️ Qual dívida devo atacar primeiro este mês?", label: "Priorização" },
  { text: "📋 Monte um plano de quitação mês a mês", label: "Plano de ação" },
  { text: "✂️ Onde posso cortar gastos sem sofrer?", label: "Corte de gastos" },
  {
    text: "💡 Vale a pena investir R$ 18.000 em energia solar com economia de R$ 190/mês?",
    label: "Análise de payback",
  },
  { text: "🤝 Me ofereceram 40% de desconto numa dívida. Aceito?", label: "Negociação" },
];

export default function ConsultorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    financeService.getTransactions().then(setTransactions);
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, transactions }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response ?? data.error ?? "Erro ao obter resposta." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro de conexão. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <main className="flex h-[calc(100vh-64px)] flex-col p-4" role="main">
      <header className="mb-4 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="bg-t-border text-t-muted hover:text-t-text flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          aria-label="Voltar para o dashboard"
        >
          <ArrowLeft size={18} />
        </Link>
        <div
          className="bg-t-accent flex h-10 w-10 items-center justify-center rounded-full"
          aria-hidden="true"
        >
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold">Consultor Financeiro</h1>
          <p className="text-t-muted text-[10px]">Powered by Groq AI</p>
        </div>
      </header>

      <div
        className="flex-1 space-y-4 overflow-y-auto pb-4"
        role="log"
        aria-label="Mensagens do consultor"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-6 pt-8">
            <Sparkles size={40} className="text-t-accent" aria-hidden="true" />
            <div className="text-center">
              <p className="font-bold">Agente Financeiro Sênior</p>
              <p className="text-t-muted mt-1 text-xs">
                Conectado aos seus dados reais. Analisa, prioriza, simula cenários e monta planos de
                quitação.
              </p>
            </div>
            <nav className="grid w-full grid-cols-2 gap-2" aria-label="Sugestões rápidas">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => sendMessage(prompt.text)}
                  className="border-t-border bg-t-surface hover:border-t-accent/50 hover:bg-t-accent/5 rounded-2xl border p-3 text-left transition-colors"
                  aria-label={`Perguntar: ${prompt.text}`}
                >
                  <p className="text-t-accent text-[10px] font-bold">{prompt.label}</p>
                  <p className="text-t-muted mt-1 text-xs">{prompt.text}</p>
                </button>
              ))}
            </nav>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            role="article"
            aria-label={msg.role === "user" ? "Sua mensagem" : "Resposta do consultor"}
          >
            {msg.role === "assistant" && (
              <div
                className="bg-t-accent flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                aria-hidden="true"
              >
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-t-accent text-white"
                  : "border-t-border bg-t-surface text-t-text border"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div
                className="bg-t-accent flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                aria-hidden="true"
              >
                <User size={14} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3" role="status" aria-label="Consultor digitando">
            <div
              className="bg-t-accent flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <Bot size={14} className="text-white" />
            </div>
            <div className="border-t-border bg-t-surface rounded-2xl border px-4 py-3">
              <div className="flex gap-1">
                <span className="bg-t-muted h-2 w-2 animate-bounce rounded-full" />
                <span className="bg-t-muted h-2 w-2 animate-bounce rounded-full [animation-delay:0.1s]" />
                <span className="bg-t-muted h-2 w-2 animate-bounce rounded-full [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex gap-2 pt-2"
        role="search"
      >
        <label htmlFor="chat-input" className="sr-only">
          Mensagem para o consultor
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte ao consultor..."
          disabled={loading}
          className="border-t-border bg-t-surface text-t-text focus:ring-t-accent flex-1 rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-t-accent hover:bg-t-accent-hover flex h-12 w-12 items-center justify-center rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50"
          aria-label="Enviar mensagem"
        >
          <Send size={18} />
        </button>
      </form>
    </main>
  );
}
