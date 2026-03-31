import { motion } from "framer-motion";
import { Plug, QrCode, Key, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Connection() {
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
    </div>
  );
}
