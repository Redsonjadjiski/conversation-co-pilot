import { useEffect, useState } from "react";
import { Users, Clock, Target, AlertTriangle, Plug, Brain, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { MessageChart } from "@/components/MessageChart";
import { HotLeads } from "@/components/HotLeads";
import { RevenueCard } from "@/components/RevenueCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ADMIN_EMAIL = "jadjiski.ia@gmail.com";

const howItWorksSteps = [
  {
    step: 1,
    icon: Plug,
    title: "Conexão de API",
    description: "Conecte sua chave da OpenAI e o webhook da Evolution API em poucos cliques.",
  },
  {
    step: 2,
    icon: Brain,
    title: "Treinamento da IA",
    description: "Alimente o agente com informações do seu negócio para respostas personalizadas.",
  },
  {
    step: 3,
    icon: TrendingUp,
    title: "Recuperação de Vendas",
    description: "A IA atende, qualifica e recupera leads automaticamente 24/7 no WhatsApp.",
  },
];

export default function Dashboard() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [nomeEmpresa, setNomeEmpresa] = useState("Atende AI");
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalRecuperado, setTotalRecuperado] = useState(0);
  const [hasConfig, setHasConfig] = useState(false);

  const isDemo = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const { data: config } = await supabase
        .from("configuracoes_ia")
        .select("nome_empresa, openai_api_key, webhook_make")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (config?.nome_empresa) setNomeEmpresa(config.nome_empresa);
      setHasConfig(!!(config?.openai_api_key && config?.webhook_make));

      const { data: leads } = await supabase
        .from("leads")
        .select("id, valor_recuperado")
        .eq("user_id", user!.id);

      if (leads) {
        setTotalLeads(leads.length);
        setTotalRecuperado(
          leads.reduce((sum, l) => sum + (l.valor_recuperado ?? 0), 0)
        );
      }
    }

    fetchData();
  }, [user]);

  const showWarning = !subscription.subscribed || !hasConfig;

  const displayLeads = isDemo && totalLeads === 0 ? 1247 : totalLeads;
  const displayHours = isDemo && totalLeads === 0 ? "187h" : (totalLeads > 0 ? `${Math.round(totalLeads * 0.15)}h` : "0h");
  const displayRate = isDemo && totalLeads === 0 ? "68.4%" : (totalLeads > 0 ? "68.4%" : "0%");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo ao <span className="gradient-text-neon font-semibold">{nomeEmpresa}</span>, seu braço direito nas vendas
          </p>
        </div>
        {isDemo && (
          <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-[11px] font-semibold">
            Modo Demo Ativo
          </Badge>
        )}
      </div>

      {showWarning && (
        <Alert variant="destructive" className="rounded-2xl border-warning/30 bg-warning/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atendimento Desativado</AlertTitle>
          <AlertDescription className="space-y-2">
            {!subscription.subscribed && (
              <p>Você ainda não possui uma assinatura ativa.</p>
            )}
            {!hasConfig && (
              <p>Suas chaves de API ou webhook não foram configurados.</p>
            )}
            <div className="flex gap-2 mt-2">
              {!subscription.subscribed && (
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => navigate("/subscription")}>
                  Ver Planos
                </Button>
              )}
              {!hasConfig && (
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => navigate("/connection")}>
                  Configurar
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <RevenueCard totalRecuperado={totalRecuperado} isDemo={isDemo} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          icon={Users}
          title="Total de Leads Atendidos"
          value={displayLeads > 0 ? displayLeads.toLocaleString("pt-BR") : "0"}
          trend={displayLeads > 0 ? `${displayLeads} leads` : undefined}
          delay={0}
        />
        <MetricCard
          icon={Clock}
          title="Horas Economizadas"
          value={displayHours}
          subtitle="Estimado com base nos leads atendidos"
          delay={0.1}
        />
        <MetricCard
          icon={Target}
          title="Taxa de Qualificação"
          value={displayRate}
          subtitle="Leads qualificados pela IA"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <MessageChart />
        </div>
        <div className="lg:col-span-2">
          <HotLeads isDemo={isDemo} />
        </div>
      </div>

      {/* Como Funciona Section */}
      <div className="section-glow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold tracking-tight">Como Funciona</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Três passos simples para automatizar seu atendimento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {howItWorksSteps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
                className="glass-card rounded-2xl p-6 gradient-border group hover:glow-border transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm group-hover:bg-primary/20 transition-colors">
                    {item.step}
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center">
                    <item.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
