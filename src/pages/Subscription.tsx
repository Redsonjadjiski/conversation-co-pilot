import { motion } from "framer-motion";
import { CreditCard, Check, Crown, Zap, Coins, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const PLANS = [
  {
    id: "basico", name: "Básico", price: "R$ 79,90", period: "/mês",
    tokens: "1 Milhão de Tokens", webhooks: "3.000 Webhooks/mês",
    priceId: "price_1THzcMBdS2ci3z0zWRH8yQsN",
    popular: false, icon: Zap,
    features: ["1M Tokens de IA", "3.000 Webhooks/mês", "1 Número WhatsApp", "Lead Tracker", "Dashboard", "Suporte por e-mail"],
  },
  {
    id: "profissional", name: "Profissional", price: "R$ 149,90", period: "/mês",
    tokens: "5 Milhões de Tokens", webhooks: "10.000 Webhooks/mês",
    priceId: "price_1THzcfBdS2ci3z0z1beCQNT4",
    popular: true, icon: Crown,
    features: ["5M Tokens de IA", "10.000 Webhooks/mês", "Múltiplos Números", "CRM Kanban", "Flow Builder", "Disparos em Massa", "Suporte prioritário"],
  },
  {
    id: "avancado", name: "Avançado", price: "R$ 249,90", period: "/mês",
    tokens: "10 Milhões de Tokens", webhooks: "20.000 Webhooks/mês",
    priceId: "price_1THzcxBdS2ci3z0z7I1YNUbU",
    popular: false, icon: Star,
    features: ["10M Tokens de IA", "20.000 Webhooks/mês", "Números ilimitados", "CRM + Flow Builder", "Disparos avançados", "Relatórios Premium", "Suporte VIP"],
  },
];

const TOKEN_PACKAGES = [
  { tokens: "1M", price: "R$ 16,99", priceId: "price_1THzcxBdS2ci3z0z7I1YNUbU", tag: null },
  { tokens: "2M", price: "R$ 22,99", priceId: "price_1THzdMBdS2ci3z0z3rDhCo4G", tag: null },
  { tokens: "5M", price: "R$ 49,99", priceId: "price_1THzeFBdS2ci3z0zFzNQXhfb", tag: "Melhor Custo-Benefício" },
  { tokens: "10M", price: "R$ 89,90", priceId: "price_1THzegBdS2ci3z0zWzohE69E", tag: "Super Econômico" },
];

export default function Subscription() {
  const { subscription, checkSubscription, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState(false);

  const tokenUsed = subscription.token_used ?? 0;
  const tokenLimit = (subscription.token_limit ?? 0) + (subscription.token_extras ?? 0);
  const webhookUsed = subscription.webhook_used ?? 0;
  const webhookLimit = subscription.webhook_limit ?? 0;
  const tokenPct = tokenLimit > 0 ? Math.min((tokenUsed / tokenLimit) * 100, 100) : 0;
  const webhookPct = webhookLimit > 0 ? Math.min((webhookUsed / webhookLimit) * 100, 100) : 0;

  const handleCheckout = async (priceId: string, mode: "subscription" | "payment" = "subscription") => {
    setLoading(priceId);
    try {
      const fnName = mode === "subscription" ? "create-checkout" : "create-token-checkout";
      const { data, error } = await supabase.functions.invoke(fnName, { body: { priceId } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setLoading(null); }
  };

  const handleManage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" /> Assinatura
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Escolha o plano ideal para o Atende AI</p>
      </div>

      {(subscription.subscribed || isAdmin) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 space-y-4">
          <p className="text-sm font-medium text-success text-center">✅ Assinatura ativa</p>
          {subscription.subscription_end && (
            <p className="text-xs text-muted-foreground text-center">Renovação: {new Date(subscription.subscription_end).toLocaleDateString("pt-BR")}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Tokens</span>
                <span className="text-muted-foreground">{tokenUsed.toLocaleString("pt-BR")} / {tokenLimit.toLocaleString("pt-BR")}</span>
              </div>
              <Progress value={tokenPct} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Webhooks</span>
                <span className="text-muted-foreground">{webhookUsed.toLocaleString("pt-BR")} / {webhookLimit.toLocaleString("pt-BR")}</span>
              </div>
              <Progress value={webhookPct} className="h-2" />
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleManage}>Gerenciar Assinatura</Button>
            <Button size="sm" className="rounded-xl" onClick={() => setShowTokens(true)}><Coins className="h-4 w-4 mr-1" /> Comprar Tokens</Button>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span>Limites de Webhooks aplicados para garantir qualidade.</span>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass-card rounded-2xl p-6 relative flex flex-col ${plan.popular ? "border-primary glow-border" : ""}`}>
            {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-full">Mais Popular</div>}
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><plan.icon className="h-5 w-5 text-primary" /></div>
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-1">{plan.tokens}</p>
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-primary" />{plan.webhooks}</p>
            <div className="mb-4"><span className="text-3xl font-bold">{plan.price}</span><span className="text-sm text-muted-foreground">{plan.period}</span></div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" /><span>{f}</span></li>)}
            </ul>
            <Button variant={plan.popular ? "default" : "outline"} className="w-full rounded-xl"
              disabled={loading === plan.priceId || subscription.subscribed || isAdmin}
              onClick={() => handleCheckout(plan.priceId)}>
              {subscription.subscribed || isAdmin ? "Plano Ativo" : loading === plan.priceId ? "Redirecionando..." : "Assinar Agora"}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={checkSubscription} className="text-xs text-muted-foreground">Atualizar status</Button>
      </div>

      {/* Tokens modal */}
      <Dialog open={showTokens} onOpenChange={setShowTokens}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" /> Recarregar Tokens</DialogTitle>
            <DialogDescription>Compre tokens extras para o ciclo atual.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {TOKEN_PACKAGES.map(pkg => (
              <motion.button key={pkg.tokens} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleCheckout(pkg.priceId, "payment")} disabled={loading === pkg.priceId}
                className={`relative rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 ${pkg.tag ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                {pkg.tag && <Badge className="absolute -top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2"><Star className="h-3 w-3 mr-0.5" />{pkg.tag}</Badge>}
                <p className="font-bold text-lg">{pkg.tokens} Tokens</p>
                <p className="text-primary font-semibold text-sm">{pkg.price}</p>
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
