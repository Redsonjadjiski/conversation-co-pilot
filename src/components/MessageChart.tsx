import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { hour: "00h", messages: 12 },
  { hour: "02h", messages: 5 },
  { hour: "04h", messages: 3 },
  { hour: "06h", messages: 8 },
  { hour: "08h", messages: 45 },
  { hour: "10h", messages: 78 },
  { hour: "12h", messages: 95 },
  { hour: "14h", messages: 120 },
  { hour: "16h", messages: 88 },
  { hour: "18h", messages: 65 },
  { hour: "20h", messages: 42 },
  { hour: "22h", messages: 28 },
];

export function MessageChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="font-semibold mb-1">Volume de Mensagens</h3>
      <p className="text-sm text-muted-foreground mb-6">Últimas 24 horas</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(222, 47%, 7%)",
                border: "1px solid hsl(217, 33%, 17%)",
                borderRadius: "12px",
                color: "hsl(210, 40%, 98%)",
                fontSize: "13px",
              }}
            />
            <Area
              type="monotone"
              dataKey="messages"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#blueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
