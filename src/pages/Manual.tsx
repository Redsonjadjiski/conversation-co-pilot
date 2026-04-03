import { motion } from "framer-motion";
import { BookOpen, Lock, CheckCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const chapters = [
  { title: "1. Introdução ao Atende AI", desc: "Visão geral da plataforma e primeiros passos." },
  { title: "2. Configuração da API", desc: "Como conectar sua chave OpenAI e webhook da Evolution API." },
  { title: "3. Treinamento da IA", desc: "Inserindo conhecimento, FAQs e instruções personalizadas." },
  { title: "4. Lead Tracker", desc: "Monitorando leads, status e valor recuperado." },
  { title: "5. Disparos em Massa", desc: "Como criar e enviar campanhas pelo WhatsApp." },
  { title: "6. CRM Kanban", desc: "Gerenciando seu funil de vendas com drag & drop." },
  { title: "7. Flow Builder", desc: "Montando fluxos de conversa automatizados." },
  { title: "8. Boas Práticas Anti-Bloqueio", desc: "Dicas para manter seu WhatsApp seguro." },
  { title: "9. Suporte e FAQ", desc: "Respostas para as dúvidas mais comuns." },
];

export default function ManualPage() {
  const { subscription, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Manual is available for annual plan subscribers, admin, or anyone with active subscription
  // (Monthly plan includes manual after paying the R$499 setup)
  const hasAccess = isAdmin || subscription.subscribed;

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Manual de Configuração
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Guia completo para configurar e usar o Atende AI
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-10 text-center border border-primary/20 glow-border"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Manual Bloqueado</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            O Manual de Configuração é liberado automaticamente para assinantes do{" "}
            <strong className="text-foreground">Plano Anual</strong> ou após o pagamento da taxa de setup do{" "}
            <strong className="text-foreground">Plano Mensal (R$ 499)</strong>.
          </p>
          <Button onClick={() => navigate("/subscription")} className="neon-cta rounded-xl px-8">
            Assinar para Liberar
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Manual de Configuração
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Guia completo para configurar e usar o Atende AI
          </p>
        </div>
        <Button variant="outline" className="rounded-xl">
          <Download className="h-4 w-4 mr-2" /> Baixar PDF
        </Button>
      </div>

      <div className="space-y-3">
        {chapters.map((ch, i) => (
          <motion.div
            key={ch.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4 flex items-center gap-4 hover:glow-border transition-all cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">{ch.title}</h3>
              <p className="text-xs text-muted-foreground">{ch.desc}</p>
            </div>
            <CheckCircle className="h-4 w-4 text-primary/40 shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
