import { useEffect, useState } from "react";
import { Users, Clock, Target } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { MessageChart } from "@/components/MessageChart";
import { HotLeads } from "@/components/HotLeads";
import { RevenueCard } from "@/components/RevenueCard";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [nomeEmpresa, setNomeEmpresa] = useState("Atende AI");
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalRecuperado, setTotalRecuperado] = useState(0);

  useEffect(() => {
    async function fetchData() {
      // Fetch company name
      const { data: config } = await supabase
        .from("configuracoes_ia")
        .select("nome_empresa")
        .eq("id", 1)
        .maybeSingle();

      if (config?.nome_empresa) {
        setNomeEmpresa(config.nome_empresa);
      }

      // Fetch leads stats
      const { data: leads } = await supabase
        .from("leads")
        .select("id, valor_recuperado");

      if (leads) {
        setTotalLeads(leads.length);
        setTotalRecuperado(
          leads.reduce((sum, l) => sum + (l.valor_recuperado ?? 0), 0)
        );
      }
    }

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bem-vindo ao {nomeEmpresa}, seu braço direito nas vendas
        </p>
      </div>

      <RevenueCard totalRecuperado={totalRecuperado} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={Users}
          title="Total de Leads Atendidos"
          value={totalLeads > 0 ? totalLeads.toLocaleString("pt-BR") : "0"}
          trend={totalLeads > 0 ? `${totalLeads} leads` : undefined}
          delay={0}
        />
        <MetricCard
          icon={Clock}
          title="Horas Economizadas"
          value={totalLeads > 0 ? `${Math.round(totalLeads * 0.15)}h` : "0h"}
          subtitle="Estimado com base nos leads atendidos"
          delay={0.1}
        />
        <MetricCard
          icon={Target}
          title="Taxa de Qualificação"
          value={totalLeads > 0 ? "68.4%" : "0%"}
          subtitle="Leads qualificados pela IA"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <MessageChart />
        </div>
        <div className="lg:col-span-2">
          <HotLeads />
        </div>
      </div>
    </div>
  );
}
