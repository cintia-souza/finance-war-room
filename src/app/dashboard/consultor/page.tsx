"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Transaction } from "@/types/finance";
import { financeService } from "@/app/services/finance";

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
  {
    text: "🤝 Me ofereceram 40% de desconto numa dívida. Aceito?",
    label: "Negociação",
  },
];

export default function ConsultorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    financeService.getTransactions().then(setTransactions);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, transactions }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response ?? data.error ?? "Erro ao obter resposta.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro de conexão. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <main className="flex h-[calc(100vh-64px)] flex-col p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600">
          <Bot size={20} />
        </div>
        <div>
          <h1 className="text-sm font-bold">Consultor Financeiro</h1>
          <p className="text-[10px] text-slate-500">Powered by Gemini AI</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-6 pt-12">
            <Sparkles size={40} className="text-violet-500" />
            <div className="text-center">
              <p className="font-bold">Agente Financeiro Sênior</p>
              <p className="mt-1 text-xs text-slate-500">
                Conectado aos seus dados reais. Analisa, prioriza, simula cenários e monta planos de
                quitação.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => sendMessage(prompt.text)}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-left transition-colors hover:border-violet-500/50 hover:bg-violet-950/20"
                >
                  <p className="text-[10px] font-bold text-violet-400">{prompt.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{prompt.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600">
                <Bot size={14} />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-200"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600">
              <Bot size={14} />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte ao consultor..."
          disabled={loading}
          className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 transition-all hover:bg-violet-500 active:scale-95 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </main>
  );
}
