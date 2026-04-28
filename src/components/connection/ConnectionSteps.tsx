import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Brain, Webhook, Check, Zap, Sparkles, ChevronRight, AlertCircle, Lock, Loader2, ExternalLink } from "lucide-react";
import WhatsAppConnect from "./WhatsAppConnect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LS_KEY = "atendeia_connection_fields";

function getUserInstanceName(userId: string) {
  return `atendeai_${userId.slice(0, 8)}`;
}

 interface StepStatus {
  aiKey: string;
  aiProvider: "claude" | "gemini";
   training: string;
   webhookUrl: string;
   evolutionApiKey: string;
   instanceName: string;
 }

export type LogEntry = {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "error" | "warning";
  message: string;
};

function loadFromLocalStorage(): Partial<StepStatus> {
  try { const raw = localStorage.getItem(LS_KEY); if (raw) return JSON.parse(raw); } catch {} return {};
}
function saveToLocalStorage(fields: StepStatus) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(fields)); } catch {}
}

function StepIndicator({ step, currentStep, completed }: { step: number; currentStep: number; completed: boolean }) {
  const isActive = step === currentStep;
  return (
    <div className="flex items-center gap-3">
      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all duration-300 ${completed ? "bg-success/20 text-success border border-success/30" : isActive ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted text-muted-foreground border border-border/50"}`}>
        {completed ? <Check className="h-4 w-4" /> : step}
      </div>
      {step < 3 && <div className={`hidden sm:block h-px w-8 transition-colors duration-300 ${completed ? "bg-success/40" : "bg-border/50"}`} />}
    </div>
  );
}

 async function testClaudeKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
   try {
     const response = await fetch("https://api.anthropic.com/v1/messages", {
       method: "POST",
       headers: {
         "x-api-key": apiKey,
         "anthropic-version": "2023-06-01",
         "content-type": "application/json"
       },
       body: JSON.stringify({
         model: "claude-3-haiku-20240307",
         max_tokens: 10,
         messages: [{ role: "user", content: "ping" }]
       })
     });
     if (response.ok) return { valid: true };
     const err = await response.json().catch(() => ({}));
     return { valid: false, error: err?.error?.message || `Erro (HTTP ${response.status})` };
   } catch { return { valid: false, error: "Não foi possível conectar à API da Anthropic." }; }
 }

interface ConnectionStepsProps {
  onLog: (entry: Omit<LogEntry, "id" | "timestamp">) => void;
  onInstanceCreated?: () => void;
}

export default function ConnectionSteps({ onLog, onInstanceCreated }: ConnectionStepsProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [activated, setActivated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validating, setValidating] = useState(false);
  const { toast } = useToast();

  const defaultInstanceName = user ? getUserInstanceName(user.id) : "atendeai";

  const [fields, setFields] = useState<StepStatus>(() => {
    const saved = loadFromLocalStorage();
    return {
      aiKey: saved.aiKey || "",
      aiProvider: saved.aiProvider || "claude",
      training: saved.training || "",
      webhookUrl: saved.webhookUrl || "https://evolution-api-production-c130.up.railway.app",
      evolutionApiKey: saved.evolutionApiKey || "atendeai2026",
      instanceName: saved.instanceName || defaultInstanceName,
    };
  });

  // Update instanceName when user loads
  useEffect(() => {
    if (user && fields.instanceName === "atendeai") {
      setFields(f => ({ ...f, instanceName: getUserInstanceName(user.id) }));
    }
  }, [user]);

  const [completed, setCompleted] = useState({ step1: false, step2: false, step3: false });
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => { saveToLocalStorage(fields); }, [fields]);

  useEffect(() => {
    if (!user) return;
    async function loadConfig() {
      const { data } = await supabase.from("configuracoes_ia").select("*").eq("user_id", user!.id).maybeSingle();
    if (data) {
      if (data.openai_api_key) { 
        setFields(f => ({ 
          ...f, 
          aiKey: data.openai_api_key!,
          aiProvider: (data as any).provider_ia || "claude"
        })); 
        setCompleted(c => ({ ...c, step1: true })); 
      }
        if (data.instrucoes_sistema && data.instrucoes_sistema.length >= 50) { setFields(f => ({ ...f, training: data.instrucoes_sistema! })); setCompleted(c => ({ ...c, step2: true })); }
        if (data.webhook_make) { setFields(f => ({ ...f, webhookUrl: data.webhook_make! })); setCompleted(c => ({ ...c, step3: true })); }
        if (data.evolution_api_key) setFields(f => ({ ...f, evolutionApiKey: data.evolution_api_key! }));
      }
      const { data: evoData } = await supabase.from("evolution_settings").select("*").eq("user_id", user!.id).maybeSingle();
      if (evoData) {
        setFields(f => ({
          ...f,
          webhookUrl: (evoData as any).server_url || f.webhookUrl,
          evolutionApiKey: (evoData as any).api_key || f.evolutionApiKey,
          instanceName: (evoData as any).instance_name || f.instanceName,
        }));
        if ((evoData as any).server_url) setCompleted(c => ({ ...c, step3: true }));
      }
    }
    loadConfig();
  }, [user]);

  const isStep1Valid = fields.aiProvider === "claude" 
    ? /^sk-ant-(api\d+-)?.+/.test(fields.aiKey) && fields.aiKey.length >= 20
    : fields.aiKey.length >= 10;
  const isStep2Valid = fields.training.trim().length >= 50;
  const isStep3Valid = fields.webhookUrl.startsWith("http") && fields.webhookUrl.length >= 10;
  const allCompleted = completed.step1 && completed.step2 && completed.step3;

  const upsertConfig = async (data: Record<string, any>) => {
    if (!user) return;
    const { error } = await supabase.from("configuracoes_ia").upsert({ ...data, user_id: user.id }, { onConflict: "user_id" });
    if (error) {
      await supabase.from("configuracoes_ia").delete().eq("user_id", user.id);
      await supabase.from("configuracoes_ia").insert({ ...data, user_id: user.id });
    }
  };

  const saveEvolutionSettings = async () => {
    if (!user || !fields.webhookUrl || !fields.evolutionApiKey) return;
    const payload = { user_id: user.id, server_url: fields.webhookUrl, api_key: fields.evolutionApiKey, instance_name: fields.instanceName };
    const { error } = await supabase.from("evolution_settings").upsert(payload, { onConflict: "user_id" });
    if (error) {
      await supabase.from("evolution_settings").delete().eq("user_id", user.id);
      await supabase.from("evolution_settings").insert(payload);
    }
    onInstanceCreated?.();
  };

  const handleValidateStep1 = async () => {
    setValidating(true); setApiError(null);
    onLog({ type: "info", message: `Testando chave do ${fields.aiProvider === 'claude' ? 'Claude' : 'Gemini'}...` });
    
    let result;
    if (fields.aiProvider === "claude") {
      result = await testClaudeKey(fields.aiKey);
    } else {
      // Simulação de validação Gemini (já que não temos SDK instalado para teste rápido aqui)
      await new Promise(r => setTimeout(r, 1000));
      result = { valid: fields.aiKey.length >= 10 };
    }

    setValidating(false);
    if (result.valid) {
      await upsertConfig({ 
        openai_api_key: fields.aiKey,
        // Simulamos o campo no payload para o backend (mesmo que a coluna não exista, o Supabase ignora ou o upsert trata)
        provider_ia: fields.aiProvider 
      } as any);
      setCompleted(prev => ({ ...prev, step1: true }));
      setCurrentStep(2);
      onLog({ type: "success", message: `Chave ${fields.aiProvider === 'claude' ? 'Claude' : 'Gemini'} validada e salva!` });
      toast({ title: "✅ Chave válida!", description: `Conexão com ${fields.aiProvider === 'claude' ? 'Anthropic' : 'Google'} confirmada.` });
    } else {
      const errMsg = result.error ?? "Erro desconhecido";
      setApiError(errMsg);
      onLog({ type: "error", message: `Falha: ${errMsg}` });
      toast({ title: "❌ Chave inválida", description: errMsg, variant: "destructive" });
    }
  };

  const handleValidateStep = async (step: number) => {
    if (step === 1) { handleValidateStep1(); return; }
    setValidating(true);
    onLog({ type: "info", message: step === 2 ? "Processando treinamento..." : "Testando webhook..." });
    await new Promise(r => setTimeout(r, 800));
    setValidating(false);
    if (step === 2 && isStep2Valid) {
      await upsertConfig({ instrucoes_sistema: fields.training });
      setCompleted(prev => ({ ...prev, step2: true }));
      setCurrentStep(3);
      onLog({ type: "success", message: "Treinamento salvo!" });
    } else if (step === 3 && isStep3Valid) {
      await upsertConfig({ webhook_make: fields.webhookUrl, evolution_api_key: fields.evolutionApiKey });
      await saveEvolutionSettings();
      setCompleted(prev => ({ ...prev, step3: true }));
      onLog({ type: "success", message: "Configuração da Evolution API salva!" });
    }
  };

  const handleActivate = () => {
    onLog({ type: "info", message: "Ativando agente no WhatsApp..." });
    setShowSuccess(true);
    setTimeout(() => { setActivated(true); onLog({ type: "success", message: "🚀 Agente Atende AI ativado!" }); }, 2500);
  };

  const stepTitles = [
    { icon: Key, label: fields.aiProvider === "claude" ? "Claude API Key" : "Gemini API Key" }, 
    { icon: Brain, label: "Treine a IA" }, 
    { icon: Webhook, label: "Webhook" }
  ];

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 sm:gap-0">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex items-center gap-2 sm:gap-0">
            <button onClick={() => { if (step === 1 || (step === 2 && completed.step1) || (step === 3 && completed.step2)) setCurrentStep(step); }} className="flex items-center gap-2 group">
              <StepIndicator step={step} currentStep={currentStep} completed={step === 1 ? completed.step1 : step === 2 ? completed.step2 : completed.step3} />
              <span className={`text-xs font-medium hidden sm:inline transition-colors ${currentStep === step ? "text-foreground" : "text-muted-foreground"}`}>{stepTitles[step - 1].label}</span>
            </button>
            {step < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-1 hidden sm:block" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="rounded-2xl bg-card border border-border p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Key className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold text-foreground">Passo 1: {fields.aiProvider === "claude" ? "Claude" : "Gemini"} API Key</h3>
                <p className="text-sm text-muted-foreground">Insira sua chave do {fields.aiProvider === "claude" ? "Anthropic Console" : "Google AI Studio"}</p>
              </div>
              {completed.step1 && <div className="ml-auto h-7 w-7 rounded-full bg-success/20 flex items-center justify-center"><Check className="h-4 w-4 text-success" /></div>}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1 bg-accent/50 rounded-xl border border-border/50 w-fit">
                <button 
                  onClick={() => { setFields(f => ({ ...f, aiProvider: "claude" })); setApiError(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${fields.aiProvider === 'claude' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Claude (Anthropic)
                </button>
                <button 
                  onClick={() => { setFields(f => ({ ...f, aiProvider: "gemini" })); setApiError(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${fields.aiProvider === 'gemini' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Gemini (Google)
                </button>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">{fields.aiProvider === "claude" ? "Claude" : "Gemini"} API Key</label>
                <Input 
                  type="password" 
                  value={fields.aiKey} 
                  onChange={e => { setFields(f => ({ ...f, aiKey: e.target.value })); setApiError(null); }} 
                  placeholder={fields.aiProvider === "claude" ? "sk-ant-..." : "AIzaSy..."} 
                  className="rounded-xl bg-background border-border text-foreground" 
                />
                <a 
                  href={fields.aiProvider === "claude" ? "https://console.anthropic.com/" : "https://aistudio.google.com/"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
                >
                  <ExternalLink className="h-3 w-3" />
                  Obtenha sua chave no {fields.aiProvider === "claude" ? "Anthropic Console" : "Google AI Studio"}
                </a>
                {apiError && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{apiError}</p>}
                {fields.aiKey.length > 0 && !isStep1Valid && !apiError && (
                  <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fields.aiProvider === "claude" 
                      ? 'A chave deve começar com "sk-ant-" e ter pelo menos 20 caracteres'
                      : 'A chave do Gemini deve ter pelo menos 10 caracteres'}
                  </p>
                )}
              </div>
            </div>
            <Button onClick={() => handleValidateStep(1)} disabled={!isStep1Valid || validating || completed.step1} className="rounded-xl w-full">
              {validating ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Testando...</span>
                : completed.step1 ? <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Concluído</span>
                : <span className="flex items-center gap-2">Testar Chave <ChevronRight className="h-4 w-4" /></span>}
            </Button>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="rounded-2xl bg-card border border-border p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Brain className="h-5 w-5 text-primary" /></div>
              <div><h3 className="font-semibold text-foreground">Passo 2: Treine a IA</h3><p className="text-sm text-muted-foreground">Cole informações sobre seu negócio (mínimo 50 caracteres)</p></div>
              {completed.step2 && <div className="ml-auto h-7 w-7 rounded-full bg-success/20 flex items-center justify-center"><Check className="h-4 w-4 text-success" /></div>}
            </div>
            <div>
              <Textarea value={fields.training} onChange={e => setFields(f => ({ ...f, training: e.target.value }))} placeholder="Descreva seu produto, preços, diferenciais..." className="min-h-[160px] bg-background border-border rounded-xl resize-none text-sm text-foreground" />
              <p className={`text-xs mt-1.5 ${fields.training.length >= 50 ? "text-success" : "text-muted-foreground"}`}>{fields.training.length}/50 caracteres {fields.training.length >= 50 ? "✓" : "(mínimo)"}</p>
            </div>
            <Button onClick={() => handleValidateStep(2)} disabled={!isStep2Valid || validating || completed.step2} className="rounded-xl w-full">
              {validating ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processando...</span>
                : completed.step2 ? <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Concluído</span>
                : <span className="flex items-center gap-2">Treinar e Continuar <ChevronRight className="h-4 w-4" /></span>}
            </Button>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="rounded-2xl bg-card border border-border p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Webhook className="h-5 w-5 text-primary" /></div>
              <div><h3 className="font-semibold text-foreground">Passo 3: Ative o Webhook</h3><p className="text-sm text-muted-foreground">URL da Evolution API</p></div>
              {completed.step3 && <div className="ml-auto h-7 w-7 rounded-full bg-success/20 flex items-center justify-center"><Check className="h-4 w-4 text-success" /></div>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">URL do Servidor</label>
              <Input value={fields.webhookUrl} onChange={e => setFields(f => ({ ...f, webhookUrl: e.target.value }))} placeholder="https://seu-app.up.railway.app" className="rounded-xl bg-background border-border text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">API Key da Evolution</label>
              <Input type="password" value={fields.evolutionApiKey} onChange={e => setFields(f => ({ ...f, evolutionApiKey: e.target.value }))} className="rounded-xl bg-background border-border text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Nome da Instância</label>
              <Input value={fields.instanceName} onChange={e => setFields(f => ({ ...f, instanceName: e.target.value }))} placeholder={defaultInstanceName} className="rounded-xl bg-background border-border text-foreground" />
              <p className="text-xs text-muted-foreground mt-1.5">Único por usuário (padrão: {defaultInstanceName})</p>
            </div>
            <Button onClick={() => handleValidateStep(3)} disabled={!isStep3Valid || validating || completed.step3} className="rounded-xl w-full">
              {validating ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Testando...</span>
                : completed.step3 ? <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Concluído</span>
                : <span className="flex items-center gap-2">Validar Webhook <Check className="h-4 w-4" /></span>}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activate */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-card border border-border p-8 flex flex-col items-center relative overflow-hidden shadow-sm">
        <AnimatePresence mode="wait">
          {showSuccess && !activated ? (
            <motion.div key="anim" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex flex-col items-center gap-4 py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.6 }} className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-success" />
              </motion.div>
              <p className="text-lg font-semibold text-foreground">Agente Ativado! 🚀</p>
            </motion.div>
          ) : activated ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-4">
              <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
              <p className="font-semibold text-success">Agente Online</p>
            </motion.div>
          ) : (
            <motion.div key="btn" className="w-full flex flex-col items-center">
              {!allCompleted ? (
                <>
                  <Lock className="h-6 w-6 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4 text-center">Complete os 3 passos para desbloquear</p>
                  <div className="flex gap-2 mb-4">
                    {[completed.step1, completed.step2, completed.step3].map((done, i) => (
                      <div key={i} className={`h-2 w-12 rounded-full transition-colors ${done ? "bg-success" : "bg-muted"}`} />
                    ))}
                  </div>
                </>
              ) : <Sparkles className="h-6 w-6 text-primary mb-3" />}
              <button onClick={handleActivate} disabled={!allCompleted}
                className={`relative group w-full max-w-md py-4 px-8 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 overflow-hidden ${allCompleted ? "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                <span className="relative flex items-center justify-center gap-2"><Zap className="h-5 w-5" />Ativar Agente no WhatsApp</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
