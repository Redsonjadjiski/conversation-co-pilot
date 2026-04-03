import { CreditCard, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export function UpgradeBanner() {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  if (subscription.subscribed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border border-primary/30 glow-border"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-semibold text-sm">Você está no modo visualização</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assine para desbloquear Conexão, Treinamento de IA, Manual e todas as funcionalidades.
          </p>
        </div>
        <Button onClick={() => navigate("/subscription")} className="neon-cta rounded-xl px-5 shrink-0">
          <CreditCard className="h-4 w-4 mr-2" />
          Assinar Agora <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
