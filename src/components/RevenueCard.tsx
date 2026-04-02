import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp } from "lucide-react";

interface RevenueCardProps {
  totalRecuperado?: number;
  isDemo?: boolean;
}

export function RevenueCard({ totalRecuperado = 0, isDemo = false }: RevenueCardProps) {
  const [count, setCount] = useState(0);
  const target = isDemo ? (totalRecuperado > 0 ? totalRecuperado : 184750) : totalRecuperado;

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
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
      className="relative overflow-hidden rounded-2xl p-6 gradient-border glow-border"
      style={{
        background: 'linear-gradient(135deg, hsl(152 76% 44% / 0.12), hsl(222 47% 7% / 0.8), hsl(217 91% 60% / 0.06))',
      }}
    >
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl animate-pulse-glow" style={{ background: 'hsl(152 76% 44% / 0.08)' }} />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full blur-3xl" style={{ background: 'hsl(217 91% 60% / 0.04)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-12 w-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Dinheiro Recuperado</p>
            <p className="text-[11px] text-muted-foreground">Estimado com base nos leads quentes</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <p className="text-4xl font-extrabold tracking-tight gradient-text">
          R$ {count.toLocaleString("pt-BR")}
        </p>
        {isDemo && (
          <p className="text-xs text-muted-foreground mt-2.5">
            Baseado em 42 leads quentes × ticket médio de R$4.398
          </p>
        )}
      </div>
    </motion.div>
  );
}
