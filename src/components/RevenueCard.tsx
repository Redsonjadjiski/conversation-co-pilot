import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

interface RevenueCardProps {
  totalRecuperado?: number;
}

export function RevenueCard({ totalRecuperado = 0 }: RevenueCardProps) {
interface RevenueCardProps {
  totalRecuperado?: number;
  isDemo?: boolean;
}

export function RevenueCard({ totalRecuperado = 0, isDemo = false }: RevenueCardProps) {
  const [count, setCount] = useState(0);
  const target = isDemo ? (totalRecuperado > 0 ? totalRecuperado : 184750) : totalRecuperado;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    setCount(0);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 glow-border"
    >
      {/* Glow orb */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dinheiro Recuperado</p>
            <p className="text-[11px] text-muted-foreground">Estimado com base nos leads quentes</p>
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight gradient-text">
          R$ {count.toLocaleString("pt-BR")}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Baseado em 42 leads quentes × ticket médio de R$4.398
        </p>
      </div>
    </motion.div>
  );
}
