import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Bot, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAIL = "jadjiski.ia@gmail.com";

interface Lead {
  id: string;
  nome: string | null;
  telefone: string | null;
  status: string | null;
  valor_recuperado: number | null;
  data_contato: string | null;
}

interface DemoLead {
  id: number;
  name: string;
  phone: string;
  status: "ai" | "human";
  score: number;
  lastMessage: string;
  time: string;
  conversation: { role: "user" | "assistant"; text: string }[];
}

const demoLeads: DemoLead[] = [
  { id: 1, name: "Carlos Silva", phone: "+55 11 9****-1234", status: "ai", score: 9, lastMessage: "Quero saber o preço do plano Pro", time: "2min",
    conversation: [
      { role: "user", text: "Oi, boa tarde!" },
      { role: "assistant", text: "Olá Carlos! Bem-vindo 😊 Como posso ajudar?" },
      { role: "user", text: "Quero saber o preço do plano Pro" },
      { role: "assistant", text: "O plano Pro custa R$297/mês e inclui atendimento ilimitado + integrações premium. Quer que eu te explique todos os benefícios?" },
    ],
  },
  { id: 2, name: "Ana Beatriz", phone: "+55 21 9****-5678", status: "ai", score: 8, lastMessage: "Vocês fazem integração com CRM?", time: "5min",
    conversation: [
      { role: "user", text: "Vocês fazem integração com CRM?" },
      { role: "assistant", text: "Sim! Integramos com os principais CRMs do mercado: HubSpot, Pipedrive e RD Station." },
    ],
  },
  { id: 3, name: "Pedro Santos", phone: "+55 31 9****-9012", status: "human", score: 5, lastMessage: "Preciso falar com um humano", time: "12min",
    conversation: [
      { role: "user", text: "Preciso falar com um humano" },
      { role: "assistant", text: "Entendi! Estou transferindo para nossa equipe agora." },
    ],
  },
  { id: 4, name: "Mariana Costa", phone: "+55 41 9****-3456", status: "ai", score: 3, lastMessage: "Só estou pesquisando", time: "25min",
    conversation: [
      { role: "user", text: "Só estou pesquisando por enquanto" },
      { role: "assistant", text: "Sem problema! Fico à disposição. Posso enviar um resumo dos nossos planos por aqui?" },
    ],
  },
  { id: 5, name: "Lucas Ferreira", phone: "+55 51 9****-7890", status: "ai", score: 7, lastMessage: "Tem desconto para pagamento anual?", time: "32min",
    conversation: [
      { role: "user", text: "Tem desconto para pagamento anual?" },
      { role: "assistant", text: "Sim! No plano anual você economiza 20%. O Pro sai por R$237/mês! 🔥" },
    ],
  },
];

function getThermometer(score: number) {
  if (score >= 8) return { label: "Quente 🔥", className: "thermometer-hot" };
  if (score >= 4) return { label: "Morno", className: "thermometer-warm" };
  return { label: "Frio", className: "thermometer-cold" };
}

export default function LeadTracker() {
  const { user } = useAuth();
  const isDemo = user?.email === ADMIN_EMAIL;
  const [selectedDemoLead, setSelectedDemoLead] = useState<DemoLead | null>(null);
  const [realLeads, setRealLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (!user || isDemo) return;
    async function fetchLeads() {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user!.id)
        .order("data_contato", { ascending: false });
      if (data) setRealLeads(data);
    }
    fetchLeads();
  }, [user, isDemo]);

  const statusMap: Record<string, string> = {
    novo: "Novo",
    em_atendimento: "Em Atendimento",
    convertido: "Convertido",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Lead Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe seus leads em tempo real</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground">Lead</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Interesse</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground hidden md:table-cell">Última mensagem</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right">Tempo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isDemo ? (
              demoLeads.map((lead) => {
                const therm = getThermometer(lead.score);
                return (
                  <TableRow
                    key={lead.id}
                    className="border-border/30 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedDemoLead(lead)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                          {lead.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lead.name}</p>
                          <p className="text-[11px] text-muted-foreground">{lead.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.status === "ai" ? "default" : "secondary"} className="rounded-full text-[11px]">
                        {lead.status === "ai" ? "IA Atendendo" : "Aguardando Humano"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`${therm.className} text-[11px] font-semibold px-2.5 py-1 rounded-full`}>
                        {lead.score}/10 {therm.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate hidden md:table-cell">
                      {lead.lastMessage}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-right">{lead.time}</TableCell>
                  </TableRow>
                );
              })
            ) : realLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              realLeads.map((lead) => (
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
                    <Badge variant="outline" className="rounded-full text-[11px]">
                      {statusMap[lead.status ?? "novo"] ?? lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    R$ {(lead.valor_recuperado ?? 0).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">-</TableCell>
                  <TableCell className="text-sm text-muted-foreground text-right">
                    {lead.data_contato ? new Date(lead.data_contato).toLocaleDateString("pt-BR") : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Demo conversation modal */}
      <AnimatePresence>
        {selectedDemoLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedDemoLead(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary">
                    {selectedDemoLead.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium">{selectedDemoLead.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDemoLead.phone}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDemoLead(null)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-5 space-y-3">
                {selectedDemoLead.conversation.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-accent rounded-bl-md"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.role === "user" && (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
