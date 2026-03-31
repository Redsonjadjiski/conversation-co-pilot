import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plug, QrCode, Key, CheckCircle2, Zap, Check, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Connection() {
  const [activated, setActivated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleActivate = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setActivated(true);
    }, 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Plug className="h-6 w-6 text-primary" />
          Conexão
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure a conexão com WhatsApp e APIs</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-1 flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          WhatsApp (Evolution API)
        </h3>
        <p className="text-sm text-muted-foreground mb-5">Conecte seu número do WhatsApp via QR Code</p>

        <div className="flex flex-col items-center gap-4 py-8 border border-dashed border-border/50 rounded-xl bg-accent/20">
          <div className="h-48 w-48 bg-muted rounded-xl flex items-center justify-center">
            <QrCode className="h-20 w-20 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground">Escaneie o QR Code para conectar</p>
          <Button variant="outline" className="rounded-xl">
            Gerar QR Code
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 space-y-5"
      >
        <h3 className="font-semibold flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Chaves de API
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">URL da Evolution API</label>
            <Input placeholder="https://sua-api.evolution.com" className="rounded-xl bg-background/50 border-border/50" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">OpenAI API Key</label>
            <Input type="password" placeholder="sk-..." className="rounded-xl bg-background/50 border-border/50" />
          </div>
          <Button className="rounded-xl">
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Salvar Configurações
          </Button>
        </div>
      </motion.div>

      {/* Activate Agent Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-8 flex flex-col items-center relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {showSuccess && !activated ? (
            <motion.div
              key="success-animation"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.6, times: [0, 0.6, 1] }}
                className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <Check className="h-10 w-10 text-success" />
                </motion.div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-semibold"
              >
                Agente Ativado com Sucesso! 🚀
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-muted-foreground"
              >
                Seu agente CloserAI está online e pronto para atender.
              </motion.p>
            </motion.div>
          ) : activated ? (
            <motion.div
              key="activated"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 py-4"
            >
              <div className="h-3 w-3 rounded-full bg-success animate-pulse-glow" />
              <p className="font-semibold text-success">Agente Online</p>
            </motion.div>
          ) : (
            <motion.div key="button" className="w-full flex flex-col items-center">
              {/* Background glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-32 w-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
              </div>

              <Sparkles className="h-6 w-6 text-primary mb-3" />
              <p className="text-sm text-muted-foreground mb-5 text-center">
                Tudo configurado? Ative seu agente e comece a converter leads automaticamente.
              </p>

              <button
                onClick={handleActivate}
                className="relative group w-full max-w-md py-4 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-lg tracking-wide transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] overflow-hidden"
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
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
