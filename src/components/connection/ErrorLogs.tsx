import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LogEntry } from "./ConnectionSteps";

const iconMap = {
  info: <Info className="h-3.5 w-3.5 text-primary shrink-0" />,
  success: <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />,
  error: <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />,
};

const bgMap = {
  info: "bg-primary/5",
  success: "bg-success/5",
  error: "bg-destructive/5",
  warning: "bg-amber-500/5",
};

interface ErrorLogsProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function ErrorLogs({ logs, onClear }: ErrorLogsProps) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Logs de Atividade</h3>
            <p className="text-sm text-muted-foreground">Histórico de conexões e erros</p>
          </div>
        </div>
        {logs.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-foreground">
            <Trash2 className="h-4 w-4 mr-1" /> Limpar
          </Button>
        )}
      </div>

      <ScrollArea className="h-[320px] rounded-xl border border-border/50 bg-background/50">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground">
            <Info className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Nenhum log ainda</p>
            <p className="text-xs mt-1">Os eventos aparecerão aqui conforme você configura</p>
          </div>
        ) : (
          <div className="p-3 space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm ${bgMap[log.type]}`}>
                <span className="mt-0.5">{iconMap[log.type]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground leading-snug">{log.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.timestamp.toLocaleTimeString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
