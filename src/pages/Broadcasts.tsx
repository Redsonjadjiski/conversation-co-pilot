import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Users, Paperclip, Eye, Plus, Image, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SubscriptionLock } from "@/components/SubscriptionLock";

const demoLists = [
  { id: "1", name: "Leads Quentes", count: 142 },
  { id: "2", name: "Clientes Ativos", count: 89 },
  { id: "3", name: "Reengajamento", count: 234 },
  { id: "4", name: "Novos Contatos", count: 67 },
];

const variables = ["{nome}", "{empresa}", "{produto}", "{valor}"];

export default function Broadcasts() {
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<string | null>(null);

  const insertVariable = (v: string) => {
    setMessage((prev) => prev + " " + v);
  };

  const previewMessage = message
    .replace("{nome}", "João Silva")
    .replace("{empresa}", "Tech Corp")
    .replace("{produto}", "Plano Pro")
    .replace("{valor}", "R$ 149,00");

  return (
    <SubscriptionLock featureName="Disparos em Massa">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            Disparos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie mensagens em massa para suas listas de contatos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Config */}
          <div className="lg:col-span-3 space-y-5">
            {/* List Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Selecionar Lista
                </h3>
                <Button size="sm" variant="outline" className="rounded-xl text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Nova Lista
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {demoLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedList(list.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedList === list.id
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-border/50 bg-accent/20 hover:border-border"
                    }`}
                  >
                    <p className="text-sm font-medium">{list.name}</p>
                    <p className="text-xs text-muted-foreground">{list.count} contatos</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Message Composer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Compor Mensagem</h3>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-muted-foreground mr-1">Variáveis:</span>
                {variables.map((v) => (
                  <Badge
                    key={v}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 text-xs"
                    onClick={() => insertVariable(v)}
                  >
                    {v}
                  </Badge>
                ))}
              </div>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Olá {nome}! Temos uma oferta especial para você..."
                className="min-h-[140px] bg-background/50 border-border/50 rounded-xl resize-none text-sm"
              />

              <div className="flex items-center gap-3 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs"
                  onClick={() => setMediaFile(mediaFile ? null : "imagem_promo.jpg")}
                >
                  {mediaFile ? (
                    <>
                      <X className="h-3 w-3 mr-1" /> Remover Mídia
                    </>
                  ) : (
                    <>
                      <Image className="h-3 w-3 mr-1" /> Anexar Imagem
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl text-xs">
                  <FileText className="h-3 w-3 mr-1" /> Anexar PDF
                </Button>
                {mediaFile && (
                  <span className="text-xs text-primary">📎 {mediaFile}</span>
                )}
              </div>
            </motion.div>

            <Button
              className="neon-cta rounded-xl w-full py-5 text-base"
              disabled={!selectedList || !message.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Disparo
            </Button>
          </div>

          {/* Right: Phone Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-card rounded-2xl p-4 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Preview</h3>
              </div>

              {/* Phone frame */}
              <div className="mx-auto w-full max-w-[280px]">
                <div className="bg-[#0a1628] rounded-[2rem] p-3 border-2 border-border/30">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-4 py-2 text-[10px] text-muted-foreground">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  {/* Chat header */}
                  <div className="bg-card/30 rounded-t-xl px-3 py-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Send className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Atende AI</p>
                      <p className="text-[10px] text-primary">online</p>
                    </div>
                  </div>
                  {/* Chat body */}
                  <div className="bg-[#0c1a30] min-h-[300px] p-3 rounded-b-xl">
                    {previewMessage ? (
                      <div className="bg-card/50 border border-border/30 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[90%]">
                        {mediaFile && (
                          <div className="bg-primary/10 rounded-lg p-4 mb-2 flex items-center justify-center">
                            <Image className="h-8 w-8 text-primary/40" />
                          </div>
                        )}
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">
                          {previewMessage || "Digite sua mensagem..."}
                        </p>
                        <p className="text-[9px] text-muted-foreground text-right mt-1">10:30 ✓✓</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center mt-20">
                        Digite uma mensagem para visualizar
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SubscriptionLock>
  );
}
