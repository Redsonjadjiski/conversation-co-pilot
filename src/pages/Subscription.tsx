import { motion } from "framer-motion";
import { CreditCard, Check, Crown, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const PLANS = {
  monthly: {
    name: "Plano Mensal",
    price: "R$ 149,00",
    period: "/mês",
    description: "Ideal para quem quer testar.",
    note: "+ R$ 497,00 de Taxa de Setup",
    priceId: "price_1THaAkBdS2ci3z0zKYPlv2GS",
    popular: false,
    icon: Calendar,
  },
  annual: {
    name: "Plano Anual",
    price: "R$ 1.798,80",
    period: " (ou 12x de R$ 149,90)",
    description: "Melhor custo-benefício.",
    note: "SETUP GRÁTIS (Economia de R$ 497,00)",
    priceId: "price_1THaCxBdS2ci3z0zpv6asYZx",
    popular: true,
    icon: Crown,
  },
};

export default function Subscription() {
  const { subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const plans = Object.values(PLANS);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Assinatura
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha o plano ideal para turbinar seu atendimento com o Atende AI
        </p>
      </div>

      {subscription.subscribed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 border-success/30 text-center"
        >
          <p className="text-sm font-medium text-success">✅ Assinatura ativa</p>
          {subscription.subscription_end && (
            <p className="text-xs text-muted-foreground mt-1">
              Próxima renovação: {new Date(subscription.subscription_end).toLocaleDateString("pt-BR")}
            </p>
          )}
          <Button variant="outline" size="sm" className="mt-3 rounded-xl" onClick={handleManage}>
            Gerenciar Assinatura
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card rounded-2xl p-6 relative flex flex-col ${
              plan.popular ? "border-primary glow-border" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-full">
                Mais Popular
              </div>
            )}

            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <plan.icon className="h-5 w-5 text-primary" />
            </div>

            <h3 className="font-semibold text-lg">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

            <div className="mb-2">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>

            <div className={`text-xs font-semibold mb-6 px-2 py-1 rounded-lg inline-block w-fit ${
              plan.popular
                ? "bg-success/15 text-success border border-success/20"
                : "bg-warning/15 text-warning border border-warning/20"
            }`}>
              {plan.note}
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {[
                "Mensagens ilimitadas",
                "Agente de IA personalizado",
                "Lead Tracker avançado",
                "Suporte prioritário",
                "Dashboard completo",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? "default" : "outline"}
              className="w-full rounded-xl"
              disabled={loading === plan.priceId || subscription.subscribed}
              onClick={() => handleCheckout(plan.priceId)}
            >
              {subscription.subscribed
                ? "Plano Ativo"
                : loading === plan.priceId
                ? "Redirecionando..."
                : "Assinar Agora"}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={checkSubscription} className="text-xs text-muted-foreground">
          Atualizar status da assinatura
        </Button>
      </div>
    </div>
  );
}
