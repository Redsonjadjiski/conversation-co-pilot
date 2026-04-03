import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Kanban, GripVertical, Phone, Plus, MoreHorizontal, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SubscriptionLock } from "@/components/SubscriptionLock";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Card {
  id: string;
  name: string;
  phone: string;
  value: string;
  tag: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  cards: Card[];
}

const initialColumns: Column[] = [
  {
    id: "leads",
    title: "Leads",
    color: "hsl(var(--cold))",
    cards: [
      { id: "1", name: "Ana Costa", phone: "(11) 98765-4321", value: "R$ 497", tag: "WhatsApp" },
      { id: "2", name: "Carlos Mendes", phone: "(21) 91234-5678", value: "R$ 149", tag: "Site" },
      { id: "3", name: "Bruna Lima", phone: "(31) 99876-5432", value: "R$ 297", tag: "Instagram" },
    ],
  },
  {
    id: "prospects",
    title: "Prospectos",
    color: "hsl(var(--warning))",
    cards: [
      { id: "4", name: "Pedro Santos", phone: "(41) 98765-1234", value: "R$ 997", tag: "Indicação" },
      { id: "5", name: "Julia Ferreira", phone: "(51) 91234-8765", value: "R$ 497", tag: "WhatsApp" },
    ],
  },
  {
    id: "negotiation",
    title: "Negociação",
    color: "hsl(var(--warm))",
    cards: [
      { id: "6", name: "Roberto Alves", phone: "(61) 98888-7777", value: "R$ 1.497", tag: "Empresa" },
    ],
  },
  {
    id: "clients",
    title: "Clientes",
    color: "hsl(var(--success))",
    cards: [
      { id: "7", name: "Marina Souza", phone: "(71) 97777-6666", value: "R$ 2.997", tag: "Premium" },
      { id: "8", name: "Lucas Oliveira", phone: "(81) 96666-5555", value: "R$ 497", tag: "Mensal" },
    ],
  },
];

export default function CRM() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; fromCol: string } | null>(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", value: "", tag: "WhatsApp" });

  const handleDragStart = (cardId: string, fromCol: string) => {
    setDraggedCard({ cardId, fromCol });
  };

  const handleDrop = useCallback(
    (toColId: string) => {
      if (!draggedCard || draggedCard.fromCol === toColId) {
        setDraggedCard(null);
        return;
      }
      setColumns((prev) => {
        const fromCol = prev.find((c) => c.id === draggedCard.fromCol);
        const card = fromCol?.cards.find((c) => c.id === draggedCard.cardId);
        if (!card) return prev;
        return prev.map((col) => {
          if (col.id === draggedCard.fromCol) {
            return { ...col, cards: col.cards.filter((c) => c.id !== draggedCard.cardId) };
          }
          if (col.id === toColId) {
            return { ...col, cards: [...col.cards, card] };
          }
          return col;
        });
      });
      setDraggedCard(null);
    },
    [draggedCard]
  );

  const deleteCard = (colId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) } : col
      )
    );
    toast.success("Lead removido com sucesso");
  };

  const addLead = () => {
    if (!newLead.name.trim() || !newLead.phone.trim()) {
      toast.error("Preencha nome e telefone");
      return;
    }
    const card: Card = {
      id: crypto.randomUUID(),
      name: newLead.name,
      phone: newLead.phone,
      value: newLead.value || "R$ 0",
      tag: newLead.tag || "WhatsApp",
    };
    setColumns((prev) =>
      prev.map((col) => (col.id === "leads" ? { ...col, cards: [...col.cards, card] } : col))
    );
    setNewLead({ name: "", phone: "", value: "", tag: "WhatsApp" });
    setShowNewLead(false);
    toast.success("Lead cadastrado com sucesso!");
  };

  return (
    <SubscriptionLock featureName="CRM Kanban">
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Kanban className="h-6 w-6 text-primary" />
              CRM
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus leads e clientes no funil de vendas
            </p>
          </div>
          <Button className="neon-cta rounded-xl" onClick={() => setShowNewLead(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Lead
          </Button>
        </div>

        {/* New Lead Modal */}
        <Dialog open={showNewLead} onOpenChange={setShowNewLead}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Input placeholder="Nome completo" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} className="rounded-xl" />
              <Input placeholder="Telefone" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} className="rounded-xl" />
              <Input placeholder="Valor (ex: R$ 497)" value={newLead.value} onChange={(e) => setNewLead({ ...newLead, value: e.target.value })} className="rounded-xl" />
              <Input placeholder="Tag (ex: WhatsApp, Site)" value={newLead.tag} onChange={(e) => setNewLead({ ...newLead, tag: e.target.value })} className="rounded-xl" />
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => setShowNewLead(false)}>Cancelar</Button>
              <Button className="neon-cta rounded-xl" onClick={addLead}>Cadastrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col, colIdx) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.1 }}
              className="min-w-[280px] flex-shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: col.color }} />
                    <h3 className="font-semibold text-sm">{col.title}</h3>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{col.cards.length}</Badge>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 min-h-[100px]">
                  {col.cards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id, col.id)}
                      className="bg-background/40 border border-border/40 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{card.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {card.phone}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-semibold text-primary">{card.value}</span>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{card.tag}</Badge>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteCard(col.id, card.id); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                                title="Apagar lead"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground rounded-xl"
                  onClick={() => setShowNewLead(true)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Adicionar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SubscriptionLock>
  );
}
