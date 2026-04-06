import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, QrCode, Check, Loader2, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppConnectProps {
  serverUrl: string;
  evolutionApiKey: string;
  instanceName?: string;
  onLog: (entry: { type: "info" | "success" | "error" | "warning"; message: string }) => void;
  autoConnect?: boolean;
}

type ConnectionStatus = "disconnected" | "connecting" | "qr_ready" | "connected";

const DEFAULT_SERVER = "https://evolution-api-production-c130.up.railway.app";
const DEFAULT_API_KEY = "atendeai2026";

export default function WhatsAppConnect({ serverUrl, evolutionApiKey, instanceName, onLog, autoConnect }: WhatsAppConnectProps) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const baseUrl = (serverUrl || DEFAULT_SERVER).replace(/\/+$/, "");
  const apiKey = evolutionApiKey || DEFAULT_API_KEY;
  const instName = instanceName || "atendeai";

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

  const checkConnectionState = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/instance/connectionState/${instName}`, { headers: { apikey: apiKey } });
      if (!res.ok) return;
      const data = await res.json();
      const state = data?.instance?.state ?? data?.state;
      if (state === "open" || state === "connected") {
        setStatus("connected"); setQrCode(null); stopPolling();
        onLog({ type: "success", message: "WhatsApp conectado!" });
        toast({ title: "✅ WhatsApp Conectado", description: "Seu aparelho foi pareado." });
      }
    } catch {}
  }, [baseUrl, apiKey, instName, stopPolling, onLog, toast]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleConnect = useCallback(async () => {
    const finalUrl = baseUrl;
    const finalKey = "atendeai2026";
    setLoading(true); setQrCode(null); setStatus("connecting");

    try {
      // Create instance
      onLog({ type: "info", message: `Criando instância "${instName}"...` });
      const createRes = await fetch(`${finalUrl}/instance/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: finalKey },
        body: JSON.stringify({ instanceName: instName, token: finalKey, qrcode: true }),
      });
      const createData = await createRes.json().catch(() => null);
      if (createRes.ok || createRes.status === 201) onLog({ type: "success", message: "Instância criada!" });
      else if (createRes.status === 403 || createRes.status === 409) onLog({ type: "info", message: "Instância já existe." });
      else onLog({ type: "warning", message: `Criar instância: ${createData?.message || `HTTP ${createRes.status}`}` });

      await new Promise(r => setTimeout(r, 2500));

      // Get QR
      for (let attempt = 0; attempt < 3; attempt++) {
        onLog({ type: "info", message: `Buscando QR Code (tentativa ${attempt + 1})...` });
        try {
          const res = await fetch(`${finalUrl}/instance/connect/${instName}`, { headers: { apikey: finalKey } });
          if (res.status === 404 && attempt < 2) { await new Promise(r => setTimeout(r, 3000)); continue; }
          if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.message || `HTTP ${res.status}`); }
          const data = await res.json();
          const base64 = data?.base64 ?? data?.qrcode?.base64 ?? data?.qrcode;
          if (base64) {
            const src = base64.startsWith("data:image") ? base64 : `data:image/png;base64,${base64}`;
            setQrCode(src); setStatus("qr_ready");
            onLog({ type: "success", message: "QR Code gerado!" });
            stopPolling();
            pollingRef.current = setInterval(checkConnectionState, 4000);
            break;
          } else { await checkConnectionState(); break; }
        } catch (err: any) { if (attempt < 2) { await new Promise(r => setTimeout(r, 3000)); continue; } throw err; }
      }
    } catch (err: any) {
      setStatus("disconnected");
      onLog({ type: "error", message: `Erro: ${err?.message || "Erro ao conectar."}` });
      toast({ title: "❌ Erro", description: err?.message, variant: "destructive" });
    } finally { setLoading(false); }
  }, [baseUrl, instName, stopPolling, checkConnectionState, onLog, toast]);

  const handleDisconnect = async () => {
    setDisconnecting(true); stopPolling();
    try {
      await fetch(`${baseUrl}/instance/logout/${instName}`, { method: "DELETE", headers: { apikey: apiKey } });
      setStatus("disconnected"); setQrCode(null);
      onLog({ type: "success", message: "WhatsApp desconectado." });
    } catch { onLog({ type: "error", message: "Falha ao desconectar." }); }
    finally { setDisconnecting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"><Smartphone className="h-5 w-5 text-green-500" /></div>
        <div>
          <h3 className="font-semibold text-foreground">Conectar WhatsApp</h3>
          <p className="text-sm text-muted-foreground">Escaneie o QR Code para parear</p>
        </div>
        {status === "connected" && <div className="ml-auto flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" /><span className="text-sm font-medium text-green-500">Conectado</span></div>}
      </div>

      <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-xl p-3">
        <p><span className="font-medium text-foreground">Instância:</span> {instName}</p>
        <p><span className="font-medium text-foreground">Servidor:</span> {baseUrl || "—"}</p>
      </div>

      <AnimatePresence mode="wait">
        {status === "qr_ready" && qrCode && (
          <motion.div key="qr" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-4 py-4">
            <div className="relative p-4 bg-white rounded-2xl shadow-lg">
              <img src={qrCode} alt="QR Code" className="w-64 h-64 rounded-lg" />
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center"><QrCode className="h-3.5 w-3.5 text-primary-foreground" /></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Aguardando leitura...</div>
            <Button variant="outline" size="sm" onClick={handleConnect} className="rounded-xl gap-2"><RefreshCw className="h-4 w-4" />Novo QR Code</Button>
          </motion.div>
        )}
        {status === "connected" && (
          <motion.div key="connected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-6">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center"><Wifi className="h-8 w-8 text-green-500" /></div>
            <p className="font-semibold text-foreground">WhatsApp Conectado ✅</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        {status !== "connected" ? (
          <Button onClick={handleConnect} disabled={loading} className="rounded-xl w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Gerando QR...</> : <><QrCode className="h-4 w-4" />Gerar QR Code</>}
          </Button>
        ) : (
          <Button onClick={handleDisconnect} disabled={disconnecting} variant="destructive" className="rounded-xl w-full gap-2">
            {disconnecting ? <><Loader2 className="h-4 w-4 animate-spin" />Desconectando...</> : <><WifiOff className="h-4 w-4" />Desconectar</>}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
