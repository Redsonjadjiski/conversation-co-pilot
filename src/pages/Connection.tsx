import { useState, useCallback } from "react";
import { Plug, Settings, HelpCircle, ScrollText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConnectionSteps from "@/components/connection/ConnectionSteps";
import HelpFAQ from "@/components/connection/HelpFAQ";
import ErrorLogs from "@/components/connection/ErrorLogs";
import type { LogEntry } from "@/components/connection/ConnectionSteps";

export default function Connection() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "timestamp">) => {
    setLogs((prev) => [
      { ...entry, id: crypto.randomUUID(), timestamp: new Date() },
      ...prev,
    ]);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Plug className="h-6 w-6 text-primary" />
          Configuração
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure, monitore e tire dúvidas sobre seu agente</p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-xl bg-muted/50">
          <TabsTrigger value="setup" className="rounded-lg gap-1.5 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuração</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="rounded-lg gap-1.5 text-xs sm:text-sm">
            <HelpCircle className="h-4 w-4" />
            Ajuda
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg gap-1.5 text-xs sm:text-sm relative">
            <ScrollText className="h-4 w-4" />
            Logs
            {logs.some((l) => l.type === "error") && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <ConnectionSteps onLog={addLog} />
        </TabsContent>

        <TabsContent value="help">
          <HelpFAQ />
        </TabsContent>

        <TabsContent value="logs">
          <ErrorLogs logs={logs} onClear={() => setLogs([])} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
