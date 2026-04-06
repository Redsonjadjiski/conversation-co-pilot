import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Kanban, GripVertical, Phone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Lead {
  id: string;
  nome: string | null;
  telefone: string | null;
  status: string | null;
  valor_recuperado: number | null;
}

const columns = [
  { id: "novo", title: "Novo", color: "hsl(var(--cold))" },
  { id: "em_atendimento", title: "Em Atendimento", color: "hsl(var(--warning))" },
  { id: "convertido", title: "Convertido", color: "hsl(var(--success))" },
  { id: "perdido", title: "Perdido", color: "hsl(var(--destructive))" },
];

export default function CRM() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<{ id: string; from: string } | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newColId, setNewColId] = useState("novo");
  const [form, setForm] = useState({ nome: "", telefone: "", valor: "" });
  const [saving, setSaving] = useState(false);

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("leads").select("id, nome, telefone, status, valor_recuperado").eq("user_id", user.id);
    if (data) setLeads(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDrop = async (toColId: string) => {
    if (!draggedCard || draggedCard.from === toColId) { setDraggedCard(null); return; }
    setLeads(prev => prev.map(l => l.id === draggedCard.id ? { ...l, status: toColId } : l));
    setDraggedCard(null);
    const { error } = await supabase.from("leads").update({ status: toColId }).eq("id", draggedCard.id);
    if (error) { toast.error("Erro ao atualizar status"); fetchLeads(); }
    else toast.success("Status atualizado!");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Lead removido!"); setLeads(prev => prev.filter(l => l.id !== id)); }
  };

  const handleAdd = async () => {
    if (!user || !form.nome.trim()) { toast.error("Preencha o nome"); return; }
    setSaving(true);
    const { error } = await supabase.from("leads").insert({
      user_id: user.id,
      nome: form.nome,
      telefone: form.telefone,
      status: newColId,
      valor_recuperado: parseFloat(form.valor) || 0,
    });
    setSaving(false);
    if (error) toast.error("Erro ao criar lead");
    else { toast.success("Lead criado!"); setShowNew(false); setForm({ nome: "", telefone: "", valor: "" }); fetchLeads(); }
  };

  const getColLeads = (colId: string) => leads.filter(l => (l.status ?? "novo") === colId);

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Kanban className="h-6 w-6 text-primary" /> CRM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seus leads no funil de vendas</p>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(c => <Skeleton key={c.id} className="min-w-[280px] h-[300px] rounded-2xl" />)}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col, colIdx) => {
            const colLeads = getColLeads(col.id);
            return (
              <motion.div key={col.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: colIdx * 0.1 }}
                className="min-w-[280px] flex-shrink-0"
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
              >
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: col.color }} />
                      <h3 className="font-semibold text-sm">{col.title}</h3>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{colLeads.length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3 min-h-[100px]">
                    {colLeads.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6">Sem leads</p>
                    )}
                    {colLeads.map(lead => (
                      <div key={lead.id} draggable onDragStart={() => setDraggedCard({ id: lead.id, from: col.id })}
                        className="bg-background/40 border border-border/40 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lead.nome ?? "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" /> {lead.telefone ?? "-"}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-semibold text-primary">
                                R$ {(lead.valor_recuperado ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                              <button onClick={e => { e.stopPropagation(); handleDelete(lead.id); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10">
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground rounded-xl"
                    onClick={() => { setNewColId(col.id); setShowNew(true); }}>
                    <Plus className="h-3 w-3 mr-1" /> Adicionar
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Novo Lead — {columns.find(c => c.id === newColId)?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="rounded-xl" />
            <Input placeholder="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} className="rounded-xl" />
            <Input placeholder="Valor (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} className="rounded-xl" />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button className="neon-cta rounded-xl" onClick={handleAdd} disabled={saving}>{saving ? "Salvando..." : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
