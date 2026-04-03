import { Lock, CreditCard, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface SubscriptionLockProps {
  children: React.ReactNode;
  featureName: string;
}

export function SubscriptionLock({ children, featureName }: SubscriptionLockProps) {
  const { subscription, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Admin always passes
  if (isAdmin) return <>{children}</>;

  // Not subscribed at all
  if (!subscription.subscribed) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none opacity-30 blur-[2px]">
          {children}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="glass-card rounded-2xl p-8 max-w-md text-center border border-primary/20 glow-border">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Funcionalidade Bloqueada</h3>
            <p className="text-sm text-muted-foreground mb-6">
              <strong>{featureName}</strong> é exclusiva para assinantes. Ative seu plano para liberar todas as funcionalidades.
            </p>
            <Button onClick={() => navigate("/subscription")} className="neon-cta rounded-xl px-6">
              <CreditCard className="h-4 w-4 mr-2" />
              Assinar Agora <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Subscribed but limits reached (tokens or webhooks)
  if (subscription.locked) {
    const isWebhook = subscription.lock_reason === "webhooks";
    return (
      <div className="relative">
        <div className="pointer-events-none select-none opacity-30 blur-[2px]">
          {children}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="glass-card rounded-2xl p-8 max-w-md text-center border border-destructive/20">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h3 className="text-lg font-bold mb-2">Atendimento Pausado</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {isWebhook
                ? "Você atingiu o limite de Webhooks deste ciclo. Recarregue tokens para liberar webhooks adicionais."
                : "Seus tokens acabaram neste ciclo. Recarregue para continuar o atendimento."}
            </p>
            <Button onClick={() => navigate("/subscription")} className="rounded-xl px-6" variant="destructive">
              <CreditCard className="h-4 w-4 mr-2" />
              Recarregar Tokens <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
