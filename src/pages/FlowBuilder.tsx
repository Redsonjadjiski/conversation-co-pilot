import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, MessageSquare, Clock, HelpCircle, ArrowRight, Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SubscriptionLock } from "@/components/SubscriptionLock";

interface FlowBlock {
  id: string;
  type: "message" | "delay" | "condition" | "action";
  label: string;
  config: string;
}

const blockTypes = [
  { type: "message" as const, label: "Mensagem", icon: MessageSquare, color: "text-primary" },
  { type: "delay" as const, label: "Aguardar", icon: Clock, color: "text-warning" },
  { type: "condition" as const, label: "Condição", icon: HelpCircle, color: "text-cold" },
  { type: "action" as const, label: "Ação", icon: Zap, color: "text-success" },
];

const initialBlocks: FlowBlock[] = [
  { id: "1", type: "message", label: "Boas-vindas", config: "Olá {nome}! Bem-vindo ao Atende AI 😊" },
  { id: "2", type: "delay", label: "Aguardar resposta", config: "5 minutos" },
  { id: "3", type: "condition", label: "Respondeu?", config: "Se respondeu → continuar | Se não → follow-up" },
  { id: "4", type: "message", label: "Follow-up", config: "Oi {nome}, vi que você se interessou! Posso te ajudar?" },
  { id: "5", type: "action", label: "Marcar lead", config: "Status → Quente" },
];

const blockIconMap = {
  message: MessageSquare,
  delay: Clock,
  condition: HelpCircle,
  action: Zap,
};

const blockColorMap = {
  message: "border-primary/30 bg-primary/5",
  delay: "border-warning/30 bg-warning/5",
  condition: "border-cold/30 bg-cold/5",
  action: "border-success/30 bg-success/5",
};

const blockIconColor = {
  message: "text-primary",
  delay: "text-warning",
  condition: "text-cold",
  action: "text-success",
};

export default function FlowBuilder() {
  const [blocks, setBlocks] = useState<FlowBlock[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const addBlock = (type: FlowBlock["type"]) => {
    const labels = { message: "Nova Mensagem", delay: "Aguardar", condition: "Nova Condição", action: "Nova Ação" };
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, label: labels[type], config: "" },
    ]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const updateBlockConfig = (id: string, config: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, config } : b)));
  };

  const selected = blocks.find((b) => b.id === selectedBlock);

  return (
    <SubscriptionLock featureName="Flow Builder">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-primary" />
              Flow Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monte fluxos de conversa personalizados para seu agente
            </p>
          </div>
          <Button className="neon-cta rounded-xl">
            Salvar Fluxo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Block palette */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4"
          >
            <h3 className="font-semibold text-sm mb-4">Blocos</h3>
            <div className="space-y-2">
              {blockTypes.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-accent/20 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                >
                  <bt.icon className={`h-4 w-4 ${bt.color}`} />
                  <span className="text-sm">{bt.label}</span>
                  <Plus className="h-3 w-3 ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Flow canvas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold text-sm mb-4">Fluxo de Conversa</h3>
            <div className="space-y-1">
              {/* Start node */}
              <div className="flex items-center justify-center">
                <div className="bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5 text-xs font-medium text-primary">
                  Início
                </div>
              </div>

              {blocks.map((block, i) => {
                const Icon = blockIconMap[block.type];
                return (
                  <div key={block.id}>
                    {/* Connector */}
                    <div className="flex justify-center py-1">
                      <div className="w-px h-6 bg-border/40" />
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40 rotate-90" />
                    </div>

                    {/* Block */}
                    <button
                      onClick={() => setSelectedBlock(block.id)}
                      className={`w-full p-3 rounded-xl border transition-all text-left ${blockColorMap[block.type]} ${
                        selectedBlock === block.id ? "ring-2 ring-primary/40 glow-border" : "hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 shrink-0 ${blockIconColor[block.type]}`} />
                        <span className="text-sm font-medium flex-1">{block.label}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize">
                          {block.type}
                        </Badge>
                      </div>
                      {block.config && (
                        <p className="text-xs text-muted-foreground mt-1.5 ml-6 truncate">{block.config}</p>
                      )}
                    </button>
                  </div>
                );
              })}

              {/* End node */}
              <div className="flex justify-center py-1">
                <div className="w-px h-6 bg-border/40" />
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-muted border border-border/40 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
                  Fim
                </div>
              </div>
            </div>
          </motion.div>

          {/* Block config panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4"
          >
            <h3 className="font-semibold text-sm mb-4">Configuração</h3>
            {selected ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Nome do bloco</label>
                  <Input
                    value={selected.label}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b) => (b.id === selected.id ? { ...b, label: e.target.value } : b))
                      )
                    }
                    className="mt-1 rounded-xl bg-background/50 border-border/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Conteúdo / Configuração</label>
                  <Input
                    value={selected.config}
                    onChange={(e) => updateBlockConfig(selected.id, e.target.value)}
                    className="mt-1 rounded-xl bg-background/50 border-border/50 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-xl w-full"
                  onClick={() => removeBlock(selected.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Remover Bloco
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Clique em um bloco no fluxo para editar suas configurações.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </SubscriptionLock>
  );
}
