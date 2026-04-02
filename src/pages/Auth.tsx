import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Zap, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "✅ E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });
      setForgotMode(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "✅ Login realizado!", description: "Bem-vindo de volta ao Atende AI." });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "✅ Cadastro realizado!",
          description: "Verifique seu e-mail para confirmar a conta.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
            <div className="relative">
              <MessageSquare className="h-8 w-8 text-primary" />
              <Zap className="h-4 w-4 text-primary absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Atende AI</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seu braço direito nas vendas via WhatsApp
          </p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {forgotMode ? "Recuperar senha" : isLogin ? "Entrar na sua conta" : "Criar conta gratuita"}
            </h2>
          </div>

          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 rounded-xl"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Nome</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="pl-10 rounded-xl"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1.5 block">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10 pr-10 rounded-xl"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  {loading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
                </Button>
              </form>

              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}
            </>
          )}

          <div className="text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setForgotMode(false); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
