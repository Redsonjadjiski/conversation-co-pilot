import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HotLeadsProps {
  isDemo?: boolean;
}

const demoLeads = [
  { name: "Carlos Silva", score: 9, lastMessage: "Quero saber o preço do plano Pro", time: "2min", status: "Novo" as const },
  { name: "Ana Beatriz", score: 8, lastMessage: "Vocês fazem integração com CRM?", time: "5min", status: "Em Atendimento" as const },
  { name: "Pedro Santos", score: 8, lastMessage: "Preciso de uma demo agora", time: "12min", status: "Convertido" as const },
  { name: "Mariana Costa", score: 7, lastMessage: "Quanto custa o plano anual?", time: "18min", status: "Novo" as const },
];

type LeadStatus = "Novo" | "Em Atendimento" | "Convertido";

const statusStyles: Record<LeadStatus, string> = {
  "Novo": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Em Atendimento": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Convertido": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export function HotLeads({ isDemo = false }: HotLeadsProps) {
  const leads = isDemo ? demoLeads : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Flame className="h-5 w-5 text-hot" />
        <h3 className="font-semibold">Leads Quentes Recentes</h3>
      </div>
      {leads.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum lead encontrado</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                {lead.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{lead.name}</p>
                  <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{lead.time}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">{lead.lastMessage}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${statusStyles[lead.status]}`}>
                  {lead.status}
                </Badge>
                <div className="thermometer-hot text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {lead.score}/10
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
