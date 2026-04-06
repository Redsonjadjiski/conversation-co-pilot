import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Users, Eye, Image, CalendarClock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SubscriptionLock } from "@/components/SubscriptionLock";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Lead { id: string; nome: string | null; telefone: string | null; status: string | null; }

const variables = ["{nome}", "{telefone}"];

export default function Broadcasts() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("leads").select("id, nome, telefone, status").eq("user_id", user.id)
      .then(({ data }) => { if (data) setLeads(data); });
  }, [user]);

  const statusGroups = [
    { value: "novo", label: "Novos", count: leads.filter(l => l.status === "novo").length },
    { value: "em_atendimento", label: "Em Atendimento", count: leads.filter(l => l.status === "em_atendimento").length },
    { value: "convertido", label: "Convertidos", count: leads.filter(l => l.status === "convertido").length },
    { value: "todos", label: "Todos", count: leads.length },
  ];

  const selectedLeads = selectedStatus === "todos" ? leads : leads.filter(l => l.status === selectedStatus);

  const replaceVars = (text: string, lead: Lead) => {
    return text.replace("{nome}", lead.nome ?? "").replace("{telefone}", lead.telefone ?? "");
  };

  const previewMessage = message.replace("{nome}", "João Silva").replace("{telefone}", "(11) 99999-0000");

  const handleSend = async () => {
    if (!user || !selectedStatus || !message.trim() || selectedLeads.length === 0) return;

    // Fetch evolution settings
    const { data: evo } = await supabase.from("evolution_settings").select("*").eq("user_id", user.id).maybeSingle();
    if (!evo) { toast.error("Configure a Evolution API na aba Conexão primeiro."); return; }

    setSending(true);
    setProgress({ current: 0, total: selectedLeads.length });
    let sent = 0;
    let errors = 0;
    const baseUrl = (evo as any).server_url.replace(/\/+$/, "");
    const instanceName = (evo as any).instance_name;
    const apiKey = (evo as any).api_key;

    for (const lead of selectedLeads) {
      if (!lead.telefone) { errors++; setProgress(p => ({ ...p, current: p.current + 1 })); continue; }
      try {
        const res = await fetch(`${baseUrl}/message/sendText/${instanceName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: apiKey },
          body: JSON.stringify({ number: lead.telefone.replace(/\D/g, ""), text: replaceVars(message, lead) }),
        });
        if (res.ok) sent++;
        else errors++;
      } catch { errors++; }
      setProgress(p => ({ ...p, current: p.current + 1 }));
      // Small delay between messages
      await new Promise(r => setTimeout(r, 1000));
    }

    setSending(false);
    toast.success(`Disparo concluído! ${sent} enviados, ${errors} erros.`);
    setMessage("");
    setSelectedStatus(null);
  };

  return (
    <SubscriptionLock featureName="Disparos em Massa">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" /> Disparos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Envie mensagens em massa para seus leads</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">
            {/* Group Selection */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-primary" /> Selecionar Grupo
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {statusGroups.map(g => (
                  <button key={g.value} onClick={() => setSelectedStatus(g.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${selectedStatus === g.value ? "border-primary bg-primary/10 glow-border" : "border-border/50 bg-accent/20 hover:border-border"}`}>
                    <p className="text-sm font-medium">{g.label}</p>
                    <p className="text-xs text-muted-foreground">{g.count} contatos</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Message */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Compor Mensagem</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-muted-foreground mr-1">Variáveis:</span>
                {variables.map(v => (
                  <Badge key={v} variant="outline" className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 text-xs"
                    onClick={() => setMessage(prev => prev + " " + v)}>{v}</Badge>
                ))}
              </div>
              <Textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Olá {nome}! Temos uma oferta especial para você..."
                className="min-h-[140px] bg-background/50 border-border/50 rounded-xl resize-none text-sm" />
            </motion.div>

            {/* Send */}
            <div className="flex gap-3">
              <Button className="neon-cta rounded-xl flex-1 py-5 text-base"
                disabled={!selectedStatus || !message.trim() || sending || selectedLeads.length === 0}
                onClick={handleSend}>
                {sending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando {progress.current}/{progress.total}...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Enviar Disparo ({selectedLeads.length})</>
                )}
              </Button>
              <Button variant="outline" className="rounded-xl py-5" disabled={!selectedStatus || !message.trim()}
                onClick={() => setShowSchedule(true)}>
                <CalendarClock className="h-4 w-4 mr-2" /> Agendar
              </Button>
            </div>
          </div>

          {/* Preview */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-4 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Preview</h3>
              </div>
              <div className="mx-auto w-full max-w-[280px]">
                <div className="bg-[#0a1628] rounded-[2rem] p-3 border-2 border-border/30">
                  <div className="flex justify-between items-center px-4 py-2 text-[10px] text-muted-foreground">
                    <span>9:41</span><div className="flex gap-1"><span>📶</span><span>🔋</span></div>
                  </div>
                  <div className="bg-card/30 rounded-t-xl px-3 py-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Send className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div><p className="text-xs font-medium">Atende AI</p><p className="text-[10px] text-primary">online</p></div>
                  </div>
                  <div className="bg-[#0c1a30] min-h-[300px] p-3 rounded-b-xl">
                    {previewMessage ? (
                      <div className="bg-card/50 border border-border/30 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[90%]">
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{previewMessage || "Digite sua mensagem..."}</p>
                        <p className="text-[9px] text-muted-foreground text-right mt-1">10:30 ✓✓</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center mt-20">Digite uma mensagem para visualizar</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Agendar Disparo</DialogTitle></DialogHeader>
          <div className="py-2">
            <label className="text-sm text-muted-foreground">Data e hora do envio</label>
            <Input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="rounded-xl mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowSchedule(false)}>Cancelar</Button>
            <Button className="neon-cta rounded-xl" onClick={() => { toast.info("Agendamento será implementado em breve!"); setShowSchedule(false); }}>
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SubscriptionLock>
  );
}
