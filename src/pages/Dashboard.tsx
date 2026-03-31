import { Users, Clock, Target } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { MessageChart } from "@/components/MessageChart";
import { HotLeads } from "@/components/HotLeads";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu agente CloserAI</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={Users}
          title="Total de Leads Atendidos"
          value="1.284"
          trend="+12.5%"
          delay={0}
        />
        <MetricCard
          icon={Clock}
          title="Horas Economizadas"
          value="186h"
          subtitle="Equivalente a 23 dias de trabalho"
          trend="+8.2%"
          delay={0.1}
        />
        <MetricCard
          icon={Target}
          title="Taxa de Qualificação"
          value="68.4%"
          subtitle="Leads qualificados pela IA"
          trend="+3.1%"
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
