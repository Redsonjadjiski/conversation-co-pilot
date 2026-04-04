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
}

type ConnectionStatus = "disconnected" | "connecting" | "qr_ready" | "connected";

const DEFAULT_INSTANCE = "atendeai";
const DEFAULT_SERVER = "https://evolution-api-production-21a8.up.railway.app";
const DEFAULT_API_KEY = "atendeai2026";

export default function WhatsAppConnect({ serverUrl, evolutionApiKey, instanceName, onLog }: WhatsAppConnectProps) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const baseUrl = (serverUrl || DEFAULT_SERVER).replace(/\/+$/, "");
  const apiKey = evolutionApiKey || DEFAULT_API_KEY;
  const instName = instanceName || DEFAULT_INSTANCE;

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const checkConnectionState = useCallback(async () => {
    if (!baseUrl || !apiKey) return;
    try {
      const res = await fetch(`${baseUrl}/instance/connectionState/${INSTANCE_NAME}`, {
        headers: { apikey: apiKey },
      });
      if (!res.ok) return;
      const data = await res.json();
      const state = data?.instance?.state ?? data?.state;
      if (state === "open" || state === "connected") {
        setStatus("connected");
        setQrCode(null);
        stopPolling();
        onLog({ type: "success", message: "WhatsApp conectado com sucesso!" });
        toast({ title: "✅ WhatsApp Conectado", description: "Seu aparelho foi pareado." });
      }
    } catch {
      // silently ignore polling errors
    }
  }, [baseUrl, apiKey, stopPolling, onLog, toast]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleConnect = async () => {
    const finalUrl = (serverUrl || DEFAULT_SERVER).replace(/\/+$/, "");
    const finalKey = "atendeai2026";
    const instanceName = "atendeia";

    if (!finalUrl) {
      toast({ title: "Configuração incompleta", description: "Salve a URL primeiro.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setQrCode(null);
    setStatus("connecting");

    try {
      // Step 0: Validate authentication against fetchInstances with both possible header keys
      onLog({ type: "info", message: `Validando autenticação em ${finalUrl}/instance/fetchInstances...` });

      let authValidated = false;
      const authHeaders = [
        { headerName: "AUTHENTICATION_API_KEY", headers: { "Content-Type": "application/json", "AUTHENTICATION_API_KEY": finalKey, apikey: finalKey } },
        { headerName: "CHAVE_API_DE_AUTENTICAÇÃO", headers: { "Content-Type": "application/json", "CHAVE_API_DE_AUTENTICAÇÃO": finalKey, apikey: finalKey } },
      ];

      for (const { headerName, headers } of authHeaders) {
        try {
          const validateRes = await fetch(`${finalUrl}/instance/fetchInstances`, { headers });
          if (validateRes.ok || validateRes.status === 200) {
            onLog({ type: "success", message: `Autenticação validada via ${headerName}.` });
            authValidated = true;
            break;
          }
        } catch {
          // try next header
        }
      }

      if (!authValidated) {
        onLog({ type: "warning", message: "Nenhuma das chaves de autenticação foi aceita em /instance/fetchInstances. Tentando continuar..." });
      }

      // Step 1: Create the instance
      onLog({ type: "info", message: `POST ${finalUrl}/instance/create — criando "${instanceName}"...` });
      const createRes = await fetch(`${finalUrl}/instance/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: finalKey },
        body: JSON.stringify({ instanceName, token: finalKey, qrcode: true }),
      });

      const createData = await createRes.json().catch(() => null);

      if (createRes.ok || createRes.status === 201) {
        onLog({ type: "success", message: "Instância criada com sucesso!" });
      } else if (createRes.status === 403 || createRes.status === 409) {
        onLog({ type: "info", message: "Instância já existe, seguindo para QR Code..." });
      } else {
        const msg = createData?.message || createData?.error || `HTTP ${createRes.status}`;
        onLog({ type: "warning", message: `Criar instância: ${msg} — tentando buscar QR mesmo assim...` });
      }

      // Wait for server to register
      await new Promise((r) => setTimeout(r, 2500));

      // Step 2: Get QR code
      onLog({ type: "info", message: `GET ${finalUrl}/instance/connect/${instanceName}...` });
      const res = await fetch(`${finalUrl}/instance/connect/${instanceName}`, {
        headers: { apikey: finalKey },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || errData?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const base64 = data?.base64 ?? data?.qrcode?.base64 ?? data?.qrcode;

      if (base64) {
        const src = base64.startsWith("data:image") ? base64 : `data:image/png;base64,${base64}`;
        setQrCode(src);
        setStatus("qr_ready");
        onLog({ type: "success", message: "QR Code gerado! Escaneie com seu WhatsApp." });

        stopPolling();
        pollingRef.current = setInterval(checkConnectionState, 4000);
      } else {
        await checkConnectionState();
        if (status !== "connected") {
          throw new Error("QR Code não retornado pela API.");
        }
      }
    } catch (err: any) {
      setStatus("disconnected");
      const msg = err?.message || "Erro ao conectar.";
      onLog({ type: "error", message: `Erro: ${msg}` });
      toast({ title: "❌ Erro na conexão", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    onLog({ type: "info", message: "Desconectando WhatsApp..." });
    stopPolling();

    try {
      await fetch(`${baseUrl}/instance/logout/${INSTANCE_NAME}`, {
        method: "DELETE",
        headers: { apikey: apiKey },
      });
      setStatus("disconnected");
      setQrCode(null);
      onLog({ type: "success", message: "WhatsApp desconectado." });
      toast({ title: "Desconectado", description: "WhatsApp foi desconectado." });
    } catch {
      onLog({ type: "error", message: "Falha ao desconectar." });
      toast({ title: "Erro", description: "Não foi possível desconectar.", variant: "destructive" });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Conectar WhatsApp</h3>
          <p className="text-sm text-muted-foreground">Escaneie o QR Code para parear seu aparelho</p>
        </div>
        {status === "connected" && (
          <div className="ml-auto flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-500">Conectado</span>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-xl p-3">
        <p><span className="font-medium text-foreground">Instância:</span> {INSTANCE_NAME}</p>
        <p><span className="font-medium text-foreground">Servidor:</span> {baseUrl || "—"}</p>
        <p><span className="font-medium text-foreground">API Key:</span> {apiKey ? "••••••" + apiKey.slice(-4) : "—"}</p>
      </div>

      {/* QR Code display */}
      <AnimatePresence mode="wait">
        {status === "qr_ready" && qrCode && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <div className="relative p-4 bg-white rounded-2xl shadow-lg">
              <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64 rounded-lg" />
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <QrCode className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aguardando leitura do QR Code...
            </div>
            <Button variant="outline" size="sm" onClick={handleConnect} className="rounded-xl gap-2">
              <RefreshCw className="h-4 w-4" />
              Gerar novo QR Code
            </Button>
          </motion.div>
        )}

        {status === "connected" && (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <Wifi className="h-8 w-8 text-green-500" />
            </motion.div>
            <p className="font-semibold text-foreground">WhatsApp Conectado ✅</p>
            <p className="text-sm text-muted-foreground">Instância: {INSTANCE_NAME}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        {status !== "connected" ? (
          <Button
            onClick={handleConnect}
            disabled={!baseUrl || !apiKey || loading}
            className="rounded-xl w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando QR Code...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                Gerar QR Code
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            disabled={disconnecting}
            variant="destructive"
            className="rounded-xl w-full gap-2"
          >
            {disconnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Desconectando...
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                Desconectar WhatsApp
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
