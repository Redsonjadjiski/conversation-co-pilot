import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Lead {
  nome: string | null;
  status: string | null;
  valor_recuperado: number | null;
  data_contato: string | null;
}

type LeadStatus = "novo" | "em_atendimento" | "convertido" | "perdido";

const statusLabels: Record<string, string> = {
  novo: "Novo",
  em_atendimento: "Em Atendimento",
  convertido: "Convertido",
  perdido: "Perdido",
};

const statusStyles: Record<string, string> = {
  novo: "bg-cold/15 text-cold border border-cold/20",
  em_atendimento: "bg-warning/15 text-warning border border-warning/20",
  convertido: "bg-primary/15 text-primary border border-primary/25",
  perdido: "bg-destructive/15 text-destructive border border-destructive/20",
};

export function HotLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("leads")
      .select("nome, status, valor_recuperado, data_contato")
      .eq("user_id", user.id)
      .order("data_contato", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setLeads(data);
      });
  }, [user]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="glass-card rounded-2xl p-6 gradient-border">
      <div className="flex items-center gap-2 mb-5">
        <Flame className="h-5 w-5 text-hot" />
        <h3 className="font-semibold">Leads Recentes</h3>
      </div>
      {leads.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum lead encontrado</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 border border-border/30 transition-all">
              <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                {(lead.nome ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{lead.nome ?? "Sem nome"}</p>
                <p className="text-xs text-muted-foreground">
                  R$ {(lead.valor_recuperado ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 rounded-full ${statusStyles[lead.status ?? "novo"] ?? ""}`}>
                {statusLabels[lead.status ?? "novo"] ?? lead.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
