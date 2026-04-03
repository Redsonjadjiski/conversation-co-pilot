import { motion } from "framer-motion";
import { CreditCard, Check, Crown, Zap, Coins, Star, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const PLANS = [
  {
    id: "starter",
    name: "IA Starter",
    price: "R$ 277",
    period: "/mês",
    tokens: "5 Milhões de Tokens",
    connections: "1 Número conectado",
    webhooks: "10.000 Webhooks/mês",
    priceId: "price_1THzcMBdS2ci3z0zWRH8yQsN",
    popular: false,
    icon: Zap,
    features: [
      "5M Tokens de IA inclusos",
      "1 Número WhatsApp",
      "Limite de 10.000 Webhooks/mês",
      "Agente de IA personalizado",
      "Lead Tracker",
      "Dashboard completo",
      "Suporte por e-mail",
    ],
  },
  {
    id: "pro",
    name: "IA Pro",
    price: "R$ 357",
    period: "/mês",
    tokens: "10 Milhões de Tokens",
    connections: "1+ Números conectados",
    webhooks: "20.000 Webhooks/mês",
    priceId: "price_1THzcfBdS2ci3z0z1beCQNT4",
    popular: true,
    icon: Crown,
    features: [
      "10M Tokens de IA inclusos",
      "Múltiplos Números WhatsApp",
      "Limite de 20.000 Webhooks/mês",
      "Agente de IA personalizado",
      "Lead Tracker avançado",
      "CRM Kanban completo",
      "Flow Builder",
      "Suporte prioritário",
    ],
  },
];

const TOKEN_PACKAGES = [
  { tokens: "1M", amount: 1_000_000, price: "R$ 16,99", priceId: "price_1THzcxBdS2ci3z0z7I1YNUbU", tag: null, extraWebhooks: 3000 },
  { tokens: "2M", amount: 2_000_000, price: "R$ 22,99", priceId: "price_1THzdMBdS2ci3z0z3rDhCo4G", tag: null, extraWebhooks: 6000 },
  { tokens: "3M", amount: 3_000_000, price: "R$ 29,99", priceId: "price_1THzddBdS2ci3z0z91x5yXym", tag: null, extraWebhooks: 9000 },
  { tokens: "4M", amount: 4_000_000, price: "R$ 39,99", priceId: "price_1THze0BdS2ci3z0zLjfb6rKU", tag: null, extraWebhooks: 12000 },
  { tokens: "5M", amount: 5_000_000, price: "R$ 49,99", priceId: "price_1THzeFBdS2ci3z0zFzNQXhfb", tag: "Melhor Custo-Benefício", extraWebhooks: 15000 },
  { tokens: "10M", amount: 10_000_000, price: "R$ 89,90", priceId: "price_1THzegBdS2ci3z0zWzohE69E", tag: "Super Econômico", extraWebhooks: 30000 },
];

export default function Subscription() {
  const { subscription, checkSubscription, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState(false);

  const handleCheckout = async (priceId: string, mode: "subscription" | "payment" = "subscription") => {
    setLoading(priceId);
    try {
      const fnName = mode === "subscription" ? "create-checkout" : "create-token-checkout";
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Assinatura
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha o plano ideal para turbinar seu atendimento com o Atende AI
        </p>
      </div>

      {(subscription.subscribed || isAdmin) && (
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
          <div className="flex justify-center gap-2 mt-3">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleManage}>
              Gerenciar Assinatura
            </Button>
            <Button size="sm" className="rounded-xl" onClick={() => setShowTokens(true)}>
              <Coins className="h-4 w-4 mr-1" /> Recarregar Tokens
            </Button>
          </div>
        </motion.div>
      )}

      {/* Anti-spam notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span>Limites de Webhooks aplicados para garantir atendimento de qualidade e evitar spam.</span>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
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
            <p className="text-sm text-muted-foreground mb-1">{plan.connections}</p>
            <p className="text-sm text-muted-foreground mb-1">{plan.tokens}</p>
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-primary" />
              {plan.webhooks}
            </p>

            <div className="mb-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? "default" : "outline"}
              className="w-full rounded-xl"
              disabled={loading === plan.priceId || subscription.subscribed || isAdmin}
              onClick={() => handleCheckout(plan.priceId)}
            >
              {subscription.subscribed || isAdmin
                ? "Plano Ativo"
                : loading === plan.priceId
                ? "Redirecionando..."
                : "Assinar Agora"}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Recharge CTA for non-subscribed */}
      {!subscription.subscribed && !isAdmin && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Já é assinante?{" "}
            <button className="text-primary underline" onClick={() => setShowTokens(true)}>
              Recarregar Tokens
            </button>
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={checkSubscription} className="text-xs text-muted-foreground">
          Atualizar status da assinatura
        </Button>
      </div>

      {/* Token Recharge Modal */}
      <Dialog open={showTokens} onOpenChange={setShowTokens}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" /> Recarregar Tokens
            </DialogTitle>
            <DialogDescription>
              Compre tokens extras para o ciclo atual. Válidos até o próximo reset mensal.
              Cada pacote também adiciona Webhooks proporcionais (+3.000 por 1M de tokens).
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {TOKEN_PACKAGES.map((pkg) => (
              <motion.button
                key={pkg.tokens}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCheckout(pkg.priceId, "payment")}
                disabled={loading === pkg.priceId}
                className={`relative rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 ${
                  pkg.tag ? "border-primary/30 bg-primary/5" : "border-border"
                }`}
              >
                {pkg.tag && (
                  <Badge className="absolute -top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2">
                    <Star className="h-3 w-3 mr-0.5" />
                    {pkg.tag}
                  </Badge>
                )}
                <p className="font-bold text-lg">{pkg.tokens} Tokens</p>
                <p className="text-primary font-semibold text-sm">{pkg.price}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  +{pkg.extraWebhooks.toLocaleString("pt-BR")} webhooks
                </p>
                {loading === pkg.priceId && (
                  <p className="text-xs text-muted-foreground mt-1">Redirecionando...</p>
                )}
              </motion.button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4 px-2">
            1 Milhão de tokens = Aproximadamente 2.500 a 3.000 mensagens de atendimento completas.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
