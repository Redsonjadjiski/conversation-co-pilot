import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Brain, Send, Bot, User, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubscriptionLock } from "@/components/SubscriptionLock";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const personalities = [
  { id: "aggressive", label: "Vendedor Agressivo", desc: "Foca em fechar vendas rapidamente com urgência e escassez." },
  { id: "friendly", label: "Consultor Amigável", desc: "Constrói rapport, ouve e guia o lead com empatia." },
  { id: "support", label: "Suporte Técnico", desc: "Responde dúvidas técnicas com precisão e objetividade." },
];

const personalityPrompts: Record<string, string> = {
  aggressive: "Você é um vendedor agressivo. Use urgência e escassez. Foque em fechar a venda rapidamente.",
  friendly: "Você é um consultor amigável. Construa rapport, ouça o cliente e guie-o com empatia.",
  support: "Você é um suporte técnico. Responda dúvidas com precisão e objetividade.",
};

export default function AIBrain() {
  const { user } = useAuth();
  const [personality, setPersonality] = useState("friendly");
  const [knowledge, setKnowledge] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "👋 Olá! Eu sou o agente Atende AI. Faça um teste — me envie uma mensagem como se fosse um lead interessado." },
  ]);
  const [testInput, setTestInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("configuracoes_ia").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setKnowledge(data.instrucoes_sistema ?? "");
        setCompanyName(data.nome_empresa ?? "");
        setGeminiKey(data.openai_api_key ?? "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const MAX_CHARS = 60000;
  const sanitizeText = (text: string) => text.replace(/[ \t]+/g, " ").replace(/(\r?\n){3,}/g, "\n\n").replace(/^ +| +$/gm, "").trim();

  const handleSave = async () => {
    if (!user || !knowledge.trim()) { toast.error("Insira o conhecimento antes de salvar."); return; }
    const sanitized = sanitizeText(knowledge);
    setKnowledge(sanitized);
    setSaving(true);
    try {
      const { error } = await supabase.from("configuracoes_ia").upsert({
        user_id: user.id, instrucoes_sistema: sanitized, nome_empresa: companyName || "Atende AI",
      }, { onConflict: "user_id" });
      if (error) {
        await supabase.from("configuracoes_ia").delete().eq("user_id", user.id);
        await supabase.from("configuracoes_ia").insert({ user_id: user.id, instrucoes_sistema: sanitized, nome_empresa: companyName || "Atende AI" });
      }
      toast.success("Conhecimento salvo!");
    } catch (err: any) { toast.error("Erro: " + (err.message || "Tente novamente.")); }
    finally { setSaving(false); }
  };

  const handleTestSend = async () => {
    if (!testInput.trim()) return;
    if (!geminiKey) {
      toast.error("Configure sua chave Gemini na aba Conexão primeiro.");
      return;
    }

    const userMsg = testInput;
    setTestInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);

    try {
      const systemPrompt = `${personalityPrompts[personality]}\n\nNome da empresa: ${companyName || "Atende AI"}\n\nConhecimento:\n${knowledge}`;
      const contents = [
        { role: "user", parts: [{ text: systemPrompt + "\n\nMensagem do lead: " + userMsg }] },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: "assistant", text: `❌ Erro: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <SubscriptionLock featureName="Treinamento de IA">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Cérebro da IA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Treine e teste o agente Atende AI</p>
        </div>

        {!geminiKey && !loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 text-sm text-warning">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Configure sua chave Gemini na aba Conexão para usar o simulador de chat.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-1">Conhecimento da Empresa</h3>
              <p className="text-sm text-muted-foreground mb-4">Cole textos, preços, FAQs e manuais do seu negócio</p>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nome da empresa"
                className="mb-3 rounded-xl bg-background border-border text-sm" disabled={loading} />
              <Textarea value={knowledge} onChange={e => { if (e.target.value.length <= MAX_CHARS) setKnowledge(e.target.value); }}
                placeholder="Ex: Nosso produto custa R$97/mês..."
                className="min-h-[200px] bg-background border-border rounded-xl resize-none text-sm" disabled={loading} maxLength={MAX_CHARS} />
              <div className="flex justify-between items-center mt-3">
                <span className={`text-xs ${knowledge.length >= MAX_CHARS ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {knowledge.length.toLocaleString("pt-BR")} / {MAX_CHARS.toLocaleString("pt-BR")}
                </span>
                <Button size="sm" className="rounded-xl" onClick={handleSave} disabled={saving || loading}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Personalidade do Agente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {personalities.map(p => (
                  <button key={p.id} onClick={() => setPersonality(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${personality === p.id ? "border-primary bg-primary/10 glow-border" : "border-border/50 bg-accent/30 hover:border-border"}`}>
                    <p className="text-sm font-medium mb-1">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Chat simulator */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card rounded-2xl flex flex-col h-[540px]">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center"><Bot className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-sm font-medium">Simulador de Chat</p>
                  <p className="text-[11px] text-muted-foreground">Teste com a API do Gemini</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5"><Bot className="h-3.5 w-3.5 text-primary" /></div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-accent rounded-bl-md"}`}>
                    {msg.role === "assistant" ? <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.text}</ReactMarkdown></div> : msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5"><User className="h-3.5 w-3.5 text-muted-foreground" /></div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0"><Bot className="h-3.5 w-3.5 text-primary" /></div>
                  <div className="bg-accent rounded-2xl rounded-bl-md px-3.5 py-2.5"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-border/50">
              <div className="flex gap-2">
                <Input value={testInput} onChange={e => setTestInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !chatLoading && handleTestSend()}
                  placeholder="Testar uma mensagem..." className="rounded-xl bg-background border-border text-sm" disabled={chatLoading} />
                <Button size="icon" onClick={handleTestSend} className="rounded-xl shrink-0" disabled={chatLoading || !testInput.trim()}>
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
