import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Send, Bot, User, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const personalities = [
  { id: "aggressive", label: "Vendedor Agressivo", desc: "Foca em fechar vendas rapidamente com urgência e escassez." },
  { id: "friendly", label: "Consultor Amigável", desc: "Constrói rapport, ouve e guia o lead com empatia." },
  { id: "support", label: "Suporte Técnico", desc: "Responde dúvidas técnicas com precisão e objetividade." },
];

const mockMessages = [
  { role: "user" as const, text: "Oi, quanto custa o plano?" },
  { role: "assistant" as const, text: "Olá! 😊 Temos opções a partir de R$97/mês. Posso te mostrar qual se encaixa melhor no seu negócio?" },
];

export default function AIBrain() {
  const [personality, setPersonality] = useState("friendly");
  const [knowledge, setKnowledge] = useState("");
  const [chatMessages, setChatMessages] = useState(mockMessages);
  const [testInput, setTestInput] = useState("");

  const handleTestSend = () => {
    if (!testInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: testInput },
      { role: "assistant", text: "Entendi! Deixa eu verificar isso para você. Com base no conhecimento configurado, posso te ajudar com mais detalhes sobre isso." },
    ]);
    setTestInput("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Cérebro da IA
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Treine o agente com o conhecimento do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Training */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-1">Conhecimento da Empresa</h3>
            <p className="text-sm text-muted-foreground mb-4">Cole textos, preços, FAQs e manuais do seu negócio</p>
            <Textarea
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value)}
              placeholder="Ex: Nosso produto custa R$97/mês no plano básico e R$297/mês no plano Pro. Oferecemos 14 dias de teste grátis..."
              className="min-h-[200px] bg-background/50 border-border/50 rounded-xl resize-none text-sm"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-muted-foreground">{knowledge.length} caracteres</span>
              <Button size="sm" className="rounded-xl">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Salvar Conhecimento
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4">Personalidade do Agente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {personalities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    personality === p.id
                      ? "border-primary bg-primary/10 glow-border"
                      : "border-border/50 bg-accent/30 hover:border-border"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Chat simulator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-2xl flex flex-col h-[540px]"
        >
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Simulador de Chat</p>
                <p className="text-[11px] text-muted-foreground">Teste as respostas da IA</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-accent rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTestSend()}
                placeholder="Testar uma mensagem..."
                className="rounded-xl bg-background/50 border-border/50 text-sm"
              />
              <Button size="icon" onClick={handleTestSend} className="rounded-xl shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
