import { useState, useEffect, useCallback } from "react";
import { Plug, Settings, HelpCircle, ScrollText, Plus, Smartphone, Loader2, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConnectionSteps from "@/components/connection/ConnectionSteps";
import HelpFAQ from "@/components/connection/HelpFAQ";
import ErrorLogs from "@/components/connection/ErrorLogs";
import WhatsAppConnect from "@/components/connection/WhatsAppConnect";
import { SubscriptionLock } from "@/components/SubscriptionLock";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { LogEntry } from "@/components/connection/ConnectionSteps";

const DEFAULT_SERVER = "https://evolution-api-production-c130.up.railway.app";
const DEFAULT_API_KEY = "atendeai2026";

function getUserInstanceName(userId: string) {
  return `atendeai_${userId.slice(0, 8)}`;
}

interface EvolutionInstance {
  id: string;
  server_url: string;
  api_key: string;
  instance_name: string;
  status?: "connected" | "disconnected" | "connecting";
}

export default function Connection() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [instances, setInstances] = useState<EvolutionInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoInstanceReady, setAutoInstanceReady] = useState(false);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "timestamp">) => {
    setLogs(prev => [{ ...entry, id: crypto.randomUUID(), timestamp: new Date() }, ...prev]);
  }, []);

  // Auto-create unique instance per user
  useEffect(() => {
    if (!user) return;
    async function ensureInstance() {
      const instanceName = getUserInstanceName(user!.id);
      const { data } = await supabase.from("evolution_settings").select("*").eq("user_id", user!.id).maybeSingle();
      if (!data) {
        await supabase.from("evolution_settings").insert({
          user_id: user!.id,
          server_url: DEFAULT_SERVER,
          api_key: DEFAULT_API_KEY,
          instance_name: instanceName,
        });
        addLog({ type: "info", message: `Instância '${instanceName}' criada automaticamente.` });
      }
      setAutoInstanceReady(true);
    }
    ensureInstance();
  }, [user, addLog]);

  // Load instances
  useEffect(() => {
    if (!user || !autoInstanceReady) return;
    async function load() {
      setLoading(true);
      const { data } = await supabase.from("evolution_settings").select("*").eq("user_id", user!.id);
      if (data && data.length > 0) {
        setInstances(data.map((d: any) => ({
          id: d.id, server_url: d.server_url, api_key: d.api_key, instance_name: d.instance_name, status: "disconnected" as const,
        })));
      }
      setLoading(false);
    }
    load();
  }, [user, autoInstanceReady]);

  // Check status
  useEffect(() => {
    if (instances.length === 0) return;
    instances.forEach(async inst => {
      try {
        const baseUrl = inst.server_url.replace(/\/+$/, "");
        const res = await fetch(`${baseUrl}/instance/connectionState/${inst.instance_name}`, { headers: { apikey: inst.api_key } });
        if (res.ok) {
          const data = await res.json();
          const state = data?.instance?.state ?? data?.state;
          if (state === "open" || state === "connected") {
            setInstances(prev => prev.map(i => i.id === inst.id ? { ...i, status: "connected" } : i));
          }
        }
      } catch {}
    });
  }, [instances.length]);

  const handleDeleteInstance = async (id: string) => {
    await supabase.from("evolution_settings").delete().eq("id", id);
    setInstances(prev => prev.filter(i => i.id !== id));
  };

  const handleInstanceCreated = () => {
    if (!user) return;
    supabase.from("evolution_settings").select("*").eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setInstances(data.map((d: any) => ({
          id: d.id, server_url: d.server_url, api_key: d.api_key, instance_name: d.instance_name, status: "disconnected" as const,
        })));
      });
  };

  const defaultInstance = instances[0];

  return (
    <SubscriptionLock featureName="Conexão e Configuração">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2 text-foreground">
            <Plug className="h-6 w-6 text-primary" /> Configuração
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure, monitore e tire dúvidas sobre seu agente</p>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-xl bg-muted/50">
            <TabsTrigger value="setup" className="rounded-lg gap-1.5 text-xs sm:text-sm"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Configuração</span><span className="sm:hidden">Config</span></TabsTrigger>
            <TabsTrigger value="help" className="rounded-lg gap-1.5 text-xs sm:text-sm"><HelpCircle className="h-4 w-4" />Ajuda</TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg gap-1.5 text-xs sm:text-sm relative"><ScrollText className="h-4 w-4" />Logs{logs.some(l => l.type === "error") && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />}</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <ConnectionSteps onLog={addLog} onInstanceCreated={handleInstanceCreated} />

            {defaultInstance && (
              <WhatsAppConnect
                serverUrl={defaultInstance.server_url}
                evolutionApiKey={defaultInstance.api_key}
                instanceName={defaultInstance.instance_name}
                onLog={addLog}
              />
            )}

            {/* Instances */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Instâncias</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {instances.map(inst => (
                    <motion.div key={inst.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-card border border-border p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${inst.status === "connected" ? "bg-green-500/10" : "bg-muted"}`}>
                            <Smartphone className={`h-5 w-5 ${inst.status === "connected" ? "text-green-500" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{inst.instance_name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{inst.server_url}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteInstance(inst.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {inst.status === "connected" ? (
                          <><div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" /><span className="text-xs font-medium text-green-500">Conectado</span></>
                        ) : (
                          <><div className="h-2.5 w-2.5 rounded-full bg-orange-400" /><span className="text-xs font-medium text-orange-400">Desconectado</span></>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2">API Key: ••••••{inst.api_key.slice(-4)}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="help"><HelpFAQ /></TabsContent>
          <TabsContent value="logs"><ErrorLogs logs={logs} onClear={() => setLogs([])} /></TabsContent>
        </Tabs>
      </div>
    </SubscriptionLock>
  );
}
