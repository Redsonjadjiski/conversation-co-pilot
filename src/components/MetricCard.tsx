import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  delay?: number;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="metric-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}
