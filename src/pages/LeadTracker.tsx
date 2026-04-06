import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  data_contato: string | null;
}

const statusOptions = [
  { value: "novo", label: "Novo" },
  { value: "em_atendimento", label: "Em Atendimento" },
  { value: "convertido", label: "Convertido" },
  { value: "perdido", label: "Perdido" },
];

const statusColors: Record<string, string> = {
  novo: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  em_atendimento: "bg-warning/15 text-warning border-warning/20",
  convertido: "bg-success/15 text-success border-success/20",
  perdido: "bg-destructive/15 text-destructive border-destructive/20",
};

const emptyLead = { nome: "", telefone: "", status: "novo", valor_recuperado: 0 };

export default function LeadTracker() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form, setForm] = useState(emptyLead);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .order("data_contato", { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const openCreate = () => {
    setEditingLead(null);
    setForm(emptyLead);
    setShowModal(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      nome: lead.nome ?? "",
      telefone: lead.telefone ?? "",
      status: lead.status ?? "novo",
      valor_recuperado: lead.valor_recuperado ?? 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user || !form.nome.trim()) {
      toast.error("Preencha o nome do lead");
      return;
    }
    setSaving(true);
    try {
      if (editingLead) {
        const { error } = await supabase.from("leads").update({
          nome: form.nome,
          telefone: form.telefone,
          status: form.status,
          valor_recuperado: form.valor_recuperado,
        }).eq("id", editingLead.id);
        if (error) throw error;
        toast.success("Lead atualizado!");
      } else {
        const { error } = await supabase.from("leads").insert({
          user_id: user.id,
          nome: form.nome,
          telefone: form.telefone,
          status: form.status,
          valor_recuperado: form.valor_recuperado,
        });
        if (error) throw error;
        toast.success("Lead adicionado!");
      }
      setShowModal(false);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar lead");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("leads").delete().eq("id", deleteId);
    if (error) {
      toast.error("Erro ao excluir lead");
    } else {
      toast.success("Lead excluído!");
      fetchLeads();
    }
    setDeleteId(null);
  };

  const filtered = leads.filter(l => {
    if (filterStatus !== "todos" && l.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(l.nome?.toLowerCase().includes(q) || l.telefone?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Lead Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seus leads em tempo real</p>
        </div>
        <Button className="neon-cta rounded-xl" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground">Lead</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Valor</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground hidden md:table-cell">Data</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(lead => (
                <TableRow key={lead.id} className="border-border/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                        {(lead.nome ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.nome ?? "Sem nome"}</p>
                        <p className="text-[11px] text-muted-foreground">{lead.telefone ?? "-"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full text-[11px] ${statusColors[lead.status ?? "novo"] ?? ""}`}>
                      {statusOptions.find(s => s.value === lead.status)?.label ?? lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-primary">
                    R$ {(lead.valor_recuperado ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {lead.data_contato ? new Date(lead.data_contato).toLocaleDateString("pt-BR") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(lead)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(lead.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingLead ? "Editar Lead" : "Adicionar Lead"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="rounded-xl" />
            <Input placeholder="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} className="rounded-xl" />
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Valor recuperado (R$)" value={form.valor_recuperado || ""} onChange={e => setForm({ ...form, valor_recuperado: parseFloat(e.target.value) || 0 })} className="rounded-xl" />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button className="neon-cta rounded-xl" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editingLead ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" className="rounded-xl" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
