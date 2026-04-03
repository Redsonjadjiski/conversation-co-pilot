import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubscriptionLock } from "@/components/SubscriptionLock";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const personalities = [
  { id: "aggressive", label: "Vendedor Agressivo", desc: "Foca em fechar vendas rapidamente com urgência e escassez." },
  { id: "friendly", label: "Consultor Amigável", desc: "Constrói rapport, ouve e guia o lead com empatia." },
  { id: "support", label: "Suporte Técnico", desc: "Responde dúvidas técnicas com precisão e objetividade." },
];

const welcomeMessage = {
  role: "assistant" as const,
  text: "👋 Olá! Eu sou o agente Atende AI. Estou pronto para atender seus clientes! Faça um teste — me envie uma mensagem como se fosse um lead interessado.",
};

export default function AIBrain() {
  const { user } = useAuth();
  const [personality, setPersonality] = useState("friendly");
  const [knowledge, setKnowledge] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([welcomeMessage]);
  const [testInput, setTestInput] = useState("");

  // Load existing config on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("configuracoes_ia")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setKnowledge(data.instrucoes_sistema ?? "");
        setCompanyName(data.nome_empresa ?? "");
      }
      if (error) {
        console.error("Erro ao carregar configuração:", error);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar.");
      return;
    }
    if (!knowledge.trim()) {
      toast.error("Insira o conhecimento antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      // Check if config already exists for this user
      const { data: existing } = await supabase
        .from("configuracoes_ia")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let error;
      if (existing) {
        // Update
        ({ error } = await supabase
          .from("configuracoes_ia")
          .update({
            instrucoes_sistema: knowledge,
            nome_empresa: companyName || "Atende AI",
          })
          .eq("user_id", user.id));
      } else {
        // Insert
        ({ error } = await supabase
          .from("configuracoes_ia")
          .insert({
            user_id: user.id,
            instrucoes_sistema: knowledge,
            nome_empresa: companyName || "Atende AI",
          }));
      }

      if (error) throw error;

      toast.success("Conhecimento salvo com sucesso! A IA já está usando as novas informações.");
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao salvar: " + (err.message || "Tente novamente."));
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = () => {
    if (!testInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { role: "user" as const, text: testInput },
      { role: "assistant" as const, text: "Entendi! Deixa eu verificar isso para você. Com base no conhecimento configurado, posso te ajudar com mais detalhes sobre isso." },
    ]);
    setTestInput("");
  };

  return (
    <SubscriptionLock featureName="Treinamento de IA">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Cérebro da IA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Treine o agente Atende AI com o conhecimento do seu negócio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-1">Conhecimento da Empresa</h3>
              <p className="text-sm text-muted-foreground mb-4">Cole textos, preços, FAQs e manuais do seu negócio</p>

              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nome da empresa (ex: Atende AI)"
                className="mb-3 rounded-xl bg-background/50 border-border/50 text-sm"
              />

              <Textarea
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
                placeholder="Ex: Nosso produto custa R$97/mês no plano básico e R$297/mês no plano Pro. Oferecemos 14 dias de teste grátis..."
                className="min-h-[200px] bg-background/50 border-border/50 rounded-xl resize-none text-sm"
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-muted-foreground">{knowledge.length} caracteres</span>
                <Button size="sm" className="rounded-xl" onClick={handleSave} disabled={saving || loading}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1.5" />
                  )}
                  {saving ? "Salvando..." : "Salvar Conhecimento"}
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
                  <p className="text-[11px] text-muted-foreground">Teste as respostas do Atende AI</p>
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
    </SubscriptionLock>
  );
}
