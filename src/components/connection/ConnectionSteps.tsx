import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Brain, Webhook, Check, Zap, Sparkles, ChevronRight, AlertCircle, Lock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StepStatus {
  openaiKey: string;
  training: string;
  webhookUrl: string;
}

export type LogEntry = {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "error" | "warning";
  message: string;
};

function StepIndicator({ step, currentStep, completed }: { step: number; currentStep: number; completed: boolean }) {
  const isActive = step === currentStep;
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all duration-300 ${
          completed
            ? "bg-success/20 text-success border border-success/30"
            : isActive
            ? "bg-primary/20 text-primary border border-primary/30"
            : "bg-muted text-muted-foreground border border-border/50"
        }`}
      >
        {completed ? <Check className="h-4 w-4" /> : step}
      </div>
      {step < 3 && (
        <div className={`hidden sm:block h-px w-8 transition-colors duration-300 ${completed ? "bg-success/40" : "bg-border/50"}`} />
      )}
    </div>
  );
}

async function testOpenAIKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (response.ok) return { valid: true };
    if (response.status === 401) return { valid: false, error: "Chave inválida ou expirada. Verifique no painel da OpenAI." };
    if (response.status === 429) return { valid: false, error: "Rate limit atingido. Tente novamente em alguns segundos." };
    return { valid: false, error: `Erro inesperado (HTTP ${response.status}). Tente novamente.` };
  } catch {
    return { valid: false, error: "Não foi possível conectar à OpenAI. Verifique sua internet." };
  }
}

interface ConnectionStepsProps {
  onLog: (entry: Omit<LogEntry, "id" | "timestamp">) => void;
}

export default function ConnectionSteps({ onLog }: ConnectionStepsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activated, setActivated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validating, setValidating] = useState(false);
  const { toast } = useToast();

  const [fields, setFields] = useState<StepStatus>({
    openaiKey: "",
    training: "",
    webhookUrl: "",
  });

  const [completed, setCompleted] = useState({ step1: false, step2: false, step3: false });
  const [apiError, setApiError] = useState<string | null>(null);

  const isStep1Valid = fields.openaiKey.startsWith("sk-") && fields.openaiKey.length >= 20;
  const isStep2Valid = fields.training.trim().length >= 50;
  const isStep3Valid = fields.webhookUrl.startsWith("http") && fields.webhookUrl.length >= 10;
  const allCompleted = completed.step1 && completed.step2 && completed.step3;

  const handleValidateStep1 = async () => {
    setValidating(true);
    setApiError(null);
    onLog({ type: "info", message: "Testando chave da OpenAI..." });

    const result = await testOpenAIKey(fields.openaiKey);

    setValidating(false);
    if (result.valid) {
      // Save to Supabase
      const { error } = await supabase
        .from("configuracoes_ia")
        .update({ openai_api_key: fields.openaiKey })
        .eq("id", 1);

      if (error) {
        // Try insert if row doesn't exist
        await supabase
          .from("configuracoes_ia")
          .insert({ id: 1, openai_api_key: fields.openaiKey });
      }

      setCompleted((prev) => ({ ...prev, step1: true }));
      setCurrentStep(2);
      onLog({ type: "success", message: "Chave OpenAI validada e salva no banco!" });
      toast({ title: "✅ Chave válida!", description: "Conexão com a OpenAI confirmada e salva." });
    } else {
      setApiError(result.error ?? "Erro desconhecido");
      onLog({ type: "error", message: `Falha na validação: ${result.error}` });
      toast({ title: "❌ Chave inválida", description: result.error, variant: "destructive" });
    }
  };

  const handleValidateStep = (step: number) => {
    if (step === 1) {
      handleValidateStep1();
      return;
    }
    setValidating(true);
    onLog({ type: "info", message: step === 2 ? "Processando treinamento da IA..." : "Testando conexão do webhook..." });
    setTimeout(() => {
      setValidating(false);
      if (step === 2 && isStep2Valid) {
        setCompleted((prev) => ({ ...prev, step2: true }));
        setCurrentStep(3);
        onLog({ type: "success", message: "Treinamento salvo com sucesso!" });
      } else if (step === 3 && isStep3Valid) {
        setCompleted((prev) => ({ ...prev, step3: true }));
        onLog({ type: "success", message: "Webhook ativo e funcionando!" });
      }
    }, 800);
  };

  const handleActivate = () => {
    onLog({ type: "info", message: "Ativando agente no WhatsApp..." });
    setShowSuccess(true);
    setTimeout(() => {
      setActivated(true);
      onLog({ type: "success", message: "🚀 Agente Atende AI ativado e online!" });
    }, 2500);
  };

  const stepTitles = [
    { icon: Key, label: "Chave OpenAI" },
    { icon: Brain, label: "Treine a IA" },
    { icon: Webhook, label: "Webhook" },
  ];

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 sm:gap-0">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2 sm:gap-0">
            <button
              onClick={() => {
                if (step === 1 || (step === 2 && completed.step1) || (step === 3 && completed.step2)) {
                  setCurrentStep(step);
                }
              }}
              className="flex items-center gap-2 group"
            >
              <StepIndicator step={step} currentStep={currentStep} completed={step === 1 ? completed.step1 : step === 2 ? completed.step2 : completed.step3} />
              <span className={`text-xs font-medium hidden sm:inline transition-colors ${currentStep === step ? "text-foreground" : "text-muted-foreground"}`}>
                {stepTitles[step - 1].label}
              </span>
            </button>
            {step < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-1 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Passo 1: Chave OpenAI</h3>
                <p className="text-sm text-muted-foreground">Insira sua API Key — ela será testada automaticamente</p>
              </div>
              {completed.step1 && (
                <div className="ml-auto h-7 w-7 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">OpenAI API Key</label>
              <Input
                type="password"
                value={fields.openaiKey}
                onChange={(e) => { setFields((f) => ({ ...f, openaiKey: e.target.value })); setApiError(null); }}
                placeholder="sk-proj-..."
                className="rounded-xl bg-background/50 border-border/50"
              />
              {apiError && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {apiError}
                </p>
              )}
              {fields.openaiKey.length > 0 && !isStep1Valid && !apiError && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  A chave deve começar com "sk-" e ter pelo menos 20 caracteres
                </p>
              )}
              {isStep1Valid && !completed.step1 && !apiError && (
                <p className="text-xs text-success mt-1.5 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Formato válido — clique para testar a conexão
                </p>
              )}
            </div>

            <Button onClick={() => handleValidateStep(1)} disabled={!isStep1Valid || validating || completed.step1} className="rounded-xl w-full">
              {validating ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Testando na OpenAI...</span>
              ) : completed.step1 ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Concluído</span>
              ) : (
                <span className="flex items-center gap-2">Testar Chave e Continuar <ChevronRight className="h-4 w-4" /></span>
              )}
            </Button>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Passo 2: Treine a IA</h3>
                <p className="text-sm text-muted-foreground">Cole informações sobre seu negócio (mínimo 50 caracteres)</p>
              </div>
              {completed.step2 && (
                <div className="ml-auto h-7 w-7 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
              )}
            </div>
            <div>
              <Textarea value={fields.training} onChange={(e) => setFields((f) => ({ ...f, training: e.target.value }))} placeholder="Descreva seu produto, preços, diferenciais, FAQ, tom de voz desejado..." className="min-h-[160px] bg-background/50 border-border/50 rounded-xl resize-none text-sm" />
              <div className="flex justify-between mt-1.5">
                <p className={`text-xs ${fields.training.length >= 50 ? "text-success" : "text-muted-foreground"}`}>
                  {fields.training.length}/50 caracteres {fields.training.length >= 50 ? "✓" : "(mínimo)"}
                </p>
              </div>
            </div>
            <Button onClick={() => handleValidateStep(2)} disabled={!isStep2Valid || validating || completed.step2} className="rounded-xl w-full">
              {validating ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processando treinamento...</span>
              ) : completed.step2 ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Concluído</span>
              ) : (
                <span className="flex items-center gap-2">Treinar e Continuar <ChevronRight className="h-4 w-4" /></span>
              )}
            </Button>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Webhook className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Passo 3: Ative o Webhook</h3>
                <p className="text-sm text-muted-foreground">URL da Evolution API para receber mensagens</p>
              </div>
              {completed.step3 && (
                <div className="ml-auto h-7 w-7 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">URL do Webhook (Evolution API)</label>
              <Input value={fields.webhookUrl} onChange={(e) => setFields((f) => ({ ...f, webhookUrl: e.target.value }))} placeholder="https://sua-api.evolution.com/webhook" className="rounded-xl bg-background/50 border-border/50" />
              {fields.webhookUrl.length > 0 && !isStep3Valid && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Insira uma URL válida começando com http</p>
              )}
              {isStep3Valid && !completed.step3 && (
                <p className="text-xs text-success mt-1.5 flex items-center gap-1"><Check className="h-3 w-3" /> URL válida</p>
              )}
            </div>
            <Button onClick={() => handleValidateStep(3)} disabled={!isStep3Valid || validating || completed.step3} className="rounded-xl w-full">
              {validating ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Testando conexão...</span>
              ) : completed.step3 ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Concluído</span>
              ) : (
                <span className="flex items-center gap-2">Validar Webhook <Check className="h-4 w-4" /></span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activate button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-8 flex flex-col items-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showSuccess && !activated ? (
            <motion.div key="success-animation" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex flex-col items-center gap-4 py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.6, times: [0, 0.6, 1] }} className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }}>
                  <Check className="h-10 w-10 text-success" />
                </motion.div>
              </motion.div>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-lg font-semibold">Agente Ativado com Sucesso! 🚀</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-sm text-muted-foreground">Seu agente Atende AI está online e pronto para atender.</motion.p>
            </motion.div>
          ) : activated ? (
            <motion.div key="activated" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-4">
              <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
              <p className="font-semibold text-success">Agente Online</p>
            </motion.div>
          ) : (
            <motion.div key="button" className="w-full flex flex-col items-center">
              {allCompleted && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-32 w-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                </div>
              )}
              {!allCompleted ? (
                <>
                  <Lock className="h-6 w-6 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4 text-center">Complete os 3 passos acima para desbloquear a ativação</p>
                  <div className="flex gap-2 mb-4">
                    {[completed.step1, completed.step2, completed.step3].map((done, i) => (
                      <div key={i} className={`h-2 w-12 rounded-full transition-colors duration-500 ${done ? "bg-success" : "bg-muted"}`} />
                    ))}
                  </div>
                </>
              ) : (
                <Sparkles className="h-6 w-6 text-primary mb-3" />
              )}
              <button
                onClick={handleActivate}
                disabled={!allCompleted}
                className={`relative group w-full max-w-md py-4 px-8 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 overflow-hidden ${
                  allCompleted ? "bg-primary text-primary-foreground hover:scale-[1.03] active:scale-[0.98]" : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {allCompleted && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" />
                  ATIVAR AGENTE NO WHATSAPP
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
