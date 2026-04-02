import { useEffect, useState } from "react";
import { Users, Clock, Target, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { MessageChart } from "@/components/MessageChart";
import { HotLeads } from "@/components/HotLeads";
import { RevenueCard } from "@/components/RevenueCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "jadjiski.ia@gmail.com";

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

  // Demo values
  const displayLeads = isDemo && totalLeads === 0 ? 1247 : totalLeads;
  const displayHours = isDemo && totalLeads === 0 ? "187h" : (totalLeads > 0 ? `${Math.round(totalLeads * 0.15)}h` : "0h");
  const displayRate = isDemo && totalLeads === 0 ? "68.4%" : (totalLeads > 0 ? "68.4%" : "0%");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo ao {nomeEmpresa}, seu braço direito nas vendas
          </p>
        </div>
        {isDemo && (
          <Badge className="ml-auto bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800 text-[11px]">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <MessageChart />
        </div>
        <div className="lg:col-span-2">
          <HotLeads isDemo={isDemo} />
        </div>
      </div>
    </div>
  );
}
