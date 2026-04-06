import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { GitBranch, MessageSquare, Clock, HelpCircle, ArrowDown, Plus, Trash2, Zap, Save, GripVertical, FileText, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SubscriptionLock } from "@/components/SubscriptionLock";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface FlowBlock {
  id: string;
  type: "message" | "delay" | "condition" | "action";
  label: string;
  config: string;
}

interface FlowRecord {
  id: string;
  nome: string;
  fluxo_json: FlowBlock[];
  ativo: boolean;
}

const blockTypes = [
  { type: "message" as const, label: "Mensagem", icon: MessageSquare, desc: "Enviar texto" },
  { type: "delay" as const, label: "Aguardar", icon: Clock, desc: "Pausar fluxo" },
  { type: "condition" as const, label: "Condição", icon: HelpCircle, desc: "Se / Senão" },
  { type: "action" as const, label: "Ação", icon: Zap, desc: "Executar comando" },
];

const colorMap = {
  message: { bg: "bg-primary/10", border: "border-primary/30", icon: "text-primary", badge: "bg-primary/20 text-primary" },
  delay: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "text-amber-400", badge: "bg-amber-500/20 text-amber-400" },
  condition: { bg: "bg-sky-500/10", border: "border-sky-500/30", icon: "text-sky-400", badge: "bg-sky-500/20 text-sky-400" },
  action: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-400" },
};

const iconMap = { message: MessageSquare, delay: Clock, condition: HelpCircle, action: Zap };

export default function FlowBuilder() {
  const { user } = useAuth();
  const [flows, setFlows] = useState<FlowRecord[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState("Novo Fluxo");
  const [blocks, setBlocks] = useState<FlowBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingFlows, setLoadingFlows] = useState(true);

  const fetchFlows = useCallback(async () => {
    if (!user) return;
    setLoadingFlows(true);
    const { data } = await supabase.from("fluxos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setFlows(data.map((d: any) => ({ id: d.id, nome: d.nome, fluxo_json: d.fluxo_json as FlowBlock[], ativo: d.ativo })));
    setLoadingFlows(false);
  }, [user]);

  useEffect(() => { fetchFlows(); }, [fetchFlows]);

  const loadFlow = (flow: FlowRecord) => {
    setActiveFlowId(flow.id);
    setFlowName(flow.nome);
    setBlocks(flow.fluxo_json);
    setSelectedBlock(null);
  };

  const newFlow = () => {
    setActiveFlowId(null);
    setFlowName("Novo Fluxo");
    setBlocks([]);
    setSelectedBlock(null);
  };

  const addBlock = (type: FlowBlock["type"]) => {
    const labels = { message: "Nova Mensagem", delay: "Aguardar", condition: "Nova Condição", action: "Nova Ação" };
    const b = { id: crypto.randomUUID(), type, label: labels[type], config: "" };
    setBlocks(prev => [...prev, b]);
    setSelectedBlock(b.id);
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const saveFlow = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (activeFlowId) {
        await supabase.from("fluxos").update({ nome: flowName, fluxo_json: blocks as any }).eq("id", activeFlowId);
      } else {
        const { data } = await supabase.from("fluxos").insert({ user_id: user.id, nome: flowName, fluxo_json: blocks as any }).select("id").single();
        if (data) setActiveFlowId(data.id);
      }
      toast.success("Fluxo salvo!");
      fetchFlows();
    } catch { toast.error("Erro ao salvar fluxo"); }
    setSaving(false);
  };

  const toggleActive = async (flow: FlowRecord) => {
    await supabase.from("fluxos").update({ ativo: !flow.ativo }).eq("id", flow.id);
    fetchFlows();
    toast.success(flow.ativo ? "Fluxo desativado" : "Fluxo ativado!");
  };

  const selected = blocks.find(b => b.id === selectedBlock);

  return (
    <SubscriptionLock featureName="Flow Builder">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-primary" /> Flow Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Monte fluxos de conversa</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl" onClick={newFlow}><Plus className="h-4 w-4 mr-2" /> Novo Fluxo</Button>
            <Button className="neon-cta rounded-xl" onClick={saveFlow} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Saved flows + palette */}
          <div className="lg:col-span-3 space-y-4">
            {/* Saved flows */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="font-semibold text-sm mb-3">Fluxos Salvos</h3>
              {loadingFlows ? <Skeleton className="h-20 w-full" /> : flows.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum fluxo salvo</p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {flows.map(f => (
                    <div key={f.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-sm ${activeFlowId === f.id ? "bg-primary/10 border border-primary/30" : "hover:bg-accent/50"}`}
                      onClick={() => loadFlow(f)}>
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate">{f.nome}</span>
                      <button onClick={e => { e.stopPropagation(); toggleActive(f); }} className="p-1 rounded hover:bg-accent">
                        {f.ativo ? <Power className="h-3.5 w-3.5 text-success" /> : <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Block palette */}
            <div className="glass-card rounded-2xl p-4 sticky top-24">
              <h3 className="font-semibold text-sm mb-3">Adicionar Bloco</h3>
              <div className="space-y-2">
                {blockTypes.map(bt => (
                  <button key={bt.type} onClick={() => addBlock(bt.type)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border ${colorMap[bt.type].border} ${colorMap[bt.type].bg} hover:scale-[1.02] transition-all text-left`}>
                    <bt.icon className={`h-4 w-4 ${colorMap[bt.type].icon}`} />
                    <div className="flex-1"><span className="text-sm font-medium">{bt.label}</span><p className="text-[10px] text-muted-foreground">{bt.desc}</p></div>
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-2xl p-5">
              <Input value={flowName} onChange={e => setFlowName(e.target.value)} className="rounded-xl mb-4 text-sm font-semibold" placeholder="Nome do fluxo" />
              <div className="flex justify-center mb-2">
                <div className="bg-primary/15 border border-primary/30 rounded-full px-5 py-1.5 text-xs font-semibold text-primary">▶ Início</div>
              </div>
              <div className="space-y-0">
                {blocks.map(block => {
                  const Icon = iconMap[block.type];
                  const colors = colorMap[block.type];
                  const isSelected = selectedBlock === block.id;
                  return (
                    <div key={block.id}>
                      <div className="flex justify-center py-1"><ArrowDown className="h-4 w-4 text-border" /></div>
                      <div onClick={() => setSelectedBlock(block.id)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${colors.bg} ${isSelected ? `${colors.border} ring-2 ring-primary/20 shadow-lg` : `${colors.border} hover:shadow-md`}`}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 shrink-0 ${colors.icon}`} />
                          <span className="text-sm font-medium flex-1 truncate">{block.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors.badge}`}>
                            {block.type === "message" ? "MSG" : block.type === "delay" ? "WAIT" : block.type === "condition" ? "IF" : "ACT"}
                          </span>
                          <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} className="p-0.5 rounded hover:bg-destructive/20">
                            <Trash2 className="h-3 w-3 text-destructive/60 hover:text-destructive" />
                          </button>
                        </div>
                        {block.config && <p className="text-[11px] text-muted-foreground mt-1.5 ml-6 line-clamp-2">{block.config}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center py-1 mt-1"><ArrowDown className="h-4 w-4 text-border" /></div>
              <div className="flex justify-center">
                <div className="bg-muted border border-border/40 rounded-full px-5 py-1.5 text-xs font-medium text-muted-foreground">⏹ Fim</div>
              </div>
              {blocks.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">Clique nos blocos à esquerda para montar seu fluxo</p>}
            </div>
          </div>

          {/* Config panel */}
          <div className="lg:col-span-4">
            <div className="glass-card rounded-2xl p-4 sticky top-24">
              <h3 className="font-semibold text-sm mb-4">Configuração do Bloco</h3>
              {selected ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
                    <Input value={selected.label} onChange={e => setBlocks(prev => prev.map(b => b.id === selected.id ? { ...b, label: e.target.value } : b))}
                      className="rounded-xl bg-background/50 border-border/50 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {selected.type === "message" ? "Texto da mensagem" : selected.type === "delay" ? "Tempo de espera" : selected.type === "condition" ? "Condição" : "Comando"}
                    </label>
                    <Textarea value={selected.config} onChange={e => setBlocks(prev => prev.map(b => b.id === selected.id ? { ...b, config: e.target.value } : b))}
                      className="rounded-xl bg-background/50 border-border/50 text-sm min-h-[100px] resize-none" />
                  </div>
                  <Button size="sm" variant="destructive" className="rounded-xl w-full" onClick={() => removeBlock(selected.id)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Remover
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Selecione um bloco para editá-lo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SubscriptionLock>
  );
}
