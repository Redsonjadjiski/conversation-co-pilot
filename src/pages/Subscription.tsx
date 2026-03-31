import { motion } from "framer-motion";
import { CreditCard, Check, Zap, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "R$97",
    period: "/mês",
    icon: Zap,
    description: "Para quem está começando",
    features: ["500 mensagens/mês", "1 agente de IA", "Suporte por email", "Dashboard básico"],
    popular: false,
  },
  {
    name: "Pro",
    price: "R$297",
    period: "/mês",
    icon: Crown,
    description: "Para negócios em crescimento",
    features: ["Mensagens ilimitadas", "3 agentes de IA", "Lead Tracker avançado", "Suporte prioritário", "Integrações premium"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "R$797",
    period: "/mês",
    icon: Rocket,
    description: "Para grandes operações",
    features: ["Tudo do Pro", "Agentes ilimitados", "API dedicada", "Gerente de conta", "SLA garantido", "White label"],
    popular: false,
  },
];

export default function Subscription() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Assinatura
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Escolha o plano ideal para o seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
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

            <div className="mb-6">
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
            >
              {plan.popular ? "Começar Agora" : "Escolher Plano"}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
