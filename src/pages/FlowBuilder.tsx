import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, MessageSquare, Clock, HelpCircle, ArrowDown, Plus, Trash2, Zap, Save, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SubscriptionLock } from "@/components/SubscriptionLock";
import { toast } from "sonner";

interface FlowBlock {
  id: string;
  type: "message" | "delay" | "condition" | "action";
  label: string;
  config: string;
}

const blockTypes = [
  { type: "message" as const, label: "Mensagem", icon: MessageSquare, desc: "Enviar texto" },
  { type: "delay" as const, label: "Aguardar", icon: Clock, desc: "Pausar fluxo" },
  { type: "condition" as const, label: "Condição", icon: HelpCircle, desc: "Se / Senão" },
  { type: "action" as const, label: "Ação", icon: Zap, desc: "Executar comando" },
];

const initialBlocks: FlowBlock[] = [
  { id: "1", type: "message", label: "Boas-vindas", config: "Olá {nome}! Bem-vindo ao Atende AI 😊" },
  { id: "2", type: "delay", label: "Aguardar resposta", config: "5 minutos" },
  { id: "3", type: "condition", label: "Respondeu?", config: "Se respondeu → continuar | Se não → follow-up" },
  { id: "4", type: "message", label: "Follow-up", config: "Oi {nome}, vi que você se interessou! Posso te ajudar?" },
  { id: "5", type: "action", label: "Marcar lead", config: "Status → Quente" },
];

const colorMap = {
  message: { bg: "bg-primary/10", border: "border-primary/30", icon: "text-primary", badge: "bg-primary/20 text-primary" },
  delay: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "text-amber-400", badge: "bg-amber-500/20 text-amber-400" },
  condition: { bg: "bg-sky-500/10", border: "border-sky-500/30", icon: "text-sky-400", badge: "bg-sky-500/20 text-sky-400" },
  action: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-400" },
};

const iconMap = { message: MessageSquare, delay: Clock, condition: HelpCircle, action: Zap };

export default function FlowBuilder() {
  const [blocks, setBlocks] = useState<FlowBlock[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const addBlock = (type: FlowBlock["type"]) => {
    const labels = { message: "Nova Mensagem", delay: "Aguardar", condition: "Nova Condição", action: "Nova Ação" };
    const newBlock = { id: crypto.randomUUID(), type, label: labels[type], config: "" };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(newBlock.id);
    toast.success(`Bloco "${labels[type]}" adicionado`);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
    toast.success("Bloco removido");
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); return; }
    setBlocks((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(dragIdx, 1);
      arr.splice(targetIdx, 0, item);
      return arr;
    });
    setDragIdx(null);
  };

  const saveFlow = () => {
    toast.success("Fluxo salvo com sucesso!", { description: `${blocks.length} blocos configurados.` });
  };

  const selected = blocks.find((b) => b.id === selectedBlock);

  return (
    <SubscriptionLock featureName="Flow Builder">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-primary" />
              Flow Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monte fluxos de conversa arrastando e configurando blocos
            </p>
          </div>
          <Button className="neon-cta rounded-xl" onClick={saveFlow}>
            <Save className="h-4 w-4 mr-2" /> Salvar Fluxo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Block palette */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 sticky top-24">
              <h3 className="font-semibold text-sm mb-3">Adicionar Bloco</h3>
              <div className="space-y-2">
                {blockTypes.map((bt) => (
                  <button
                    key={bt.type}
                    onClick={() => addBlock(bt.type)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border ${colorMap[bt.type].border} ${colorMap[bt.type].bg} hover:scale-[1.02] transition-all text-left`}
                  >
                    <bt.icon className={`h-4 w-4 ${colorMap[bt.type].icon}`} />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{bt.label}</span>
                      <p className="text-[10px] text-muted-foreground">{bt.desc}</p>
                    </div>
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Flow canvas */}
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-4">Fluxo de Conversa</h3>

              {/* Start */}
              <div className="flex justify-center mb-2">
                <div className="bg-primary/15 border border-primary/30 rounded-full px-5 py-1.5 text-xs font-semibold text-primary">
                  ▶ Início
                </div>
              </div>

              <div className="space-y-0">
                {blocks.map((block, i) => {
                  const Icon = iconMap[block.type];
                  const colors = colorMap[block.type];
                  const isSelected = selectedBlock === block.id;

                  return (
                    <div key={block.id}>
                      {/* Connector */}
                      <div className="flex justify-center py-1">
                        <ArrowDown className="h-4 w-4 text-border" />
                      </div>

                      {/* Block */}
                      <div
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(i)}
                        onClick={() => setSelectedBlock(block.id)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${colors.bg} ${
                          isSelected ? `${colors.border} ring-2 ring-primary/20 shadow-lg` : `${colors.border} hover:shadow-md`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />
                          <Icon className={`h-4 w-4 shrink-0 ${colors.icon}`} />
                          <span className="text-sm font-medium flex-1 truncate">{block.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors.badge}`}>
                            {block.type === "message" ? "MSG" : block.type === "delay" ? "WAIT" : block.type === "condition" ? "IF" : "ACT"}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                            className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 text-destructive/60 hover:text-destructive" />
                          </button>
                        </div>
                        {block.config && (
                          <p className="text-[11px] text-muted-foreground mt-1.5 ml-8 line-clamp-2">{block.config}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* End */}
              <div className="flex justify-center py-1 mt-1">
                <ArrowDown className="h-4 w-4 text-border" />
              </div>
              <div className="flex justify-center">
                <div className="bg-muted border border-border/40 rounded-full px-5 py-1.5 text-xs font-medium text-muted-foreground">
                  ⏹ Fim
                </div>
              </div>

              {blocks.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-10">
                  Clique nos blocos à esquerda para montar seu fluxo
                </p>
              )}
            </motion.div>
          </div>

          {/* Config panel */}
          <div className="lg:col-span-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-4 sticky top-24">
              <h3 className="font-semibold text-sm mb-4">Configuração do Bloco</h3>
              {selected ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
                    <Input
                      value={selected.label}
                      onChange={(e) => setBlocks((prev) => prev.map((b) => (b.id === selected.id ? { ...b, label: e.target.value } : b)))}
                      className="rounded-xl bg-background/50 border-border/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {selected.type === "message" ? "Texto da mensagem" :
                       selected.type === "delay" ? "Tempo de espera" :
                       selected.type === "condition" ? "Condição (Se / Senão)" :
                       "Comando a executar"}
                    </label>
                    <Textarea
                      value={selected.config}
                      onChange={(e) => setBlocks((prev) => prev.map((b) => (b.id === selected.id ? { ...b, config: e.target.value } : b)))}
                      className="rounded-xl bg-background/50 border-border/50 text-sm min-h-[100px] resize-none"
                      placeholder={
                        selected.type === "message" ? "Olá {nome}! Como posso ajudar?" :
                        selected.type === "delay" ? "5 minutos" :
                        selected.type === "condition" ? "Se respondeu → sim | Se não → não" :
                        "Marcar lead como quente"
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${colorMap[selected.type].badge} text-xs`}>
                      {selected.type}
                    </Badge>
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
                <div className="text-center py-8">
                  <HelpCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Selecione um bloco no fluxo para editá-lo
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </SubscriptionLock>
  );
}
