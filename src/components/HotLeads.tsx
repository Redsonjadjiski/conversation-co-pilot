import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const leads = [
  { name: "Carlos Silva", score: 9, lastMessage: "Quero saber o preço do plano Pro", time: "2min" },
  { name: "Ana Beatriz", score: 8, lastMessage: "Vocês fazem integração com CRM?", time: "5min" },
  { name: "Pedro Santos", score: 8, lastMessage: "Preciso de uma demo agora", time: "12min" },
  { name: "Mariana Costa", score: 7, lastMessage: "Quanto custa o plano anual?", time: "18min" },
];

export function HotLeads() {
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
              <p className="text-xs text-muted-foreground truncate">{lead.lastMessage}</p>
            </div>
            <div className="thermometer-hot text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0">
              {lead.score}/10
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
