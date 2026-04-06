import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MessageSquare, Zap, Bot, Users, TrendingUp, Shield, Clock, 
  CheckCircle, ArrowRight, Star, Sparkles, Send, BarChart3,
  Phone, Globe, Target, RefreshCw, Lock, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const stats = [
  { value: "+500", label: "empresas", icon: Users },
  { value: "R$2M", label: "em vendas recuperadas", icon: TrendingUp },
  { value: "24/7", label: "ativo", icon: Clock },
];

const steps = [
  {
    num: "01",
    title: "Conecte sua API",
    desc: "Integre seu WhatsApp Business em minutos com nossa API segura e estável.",
    icon: Phone,
  },
  {
    num: "02",
    title: "Treine a IA",
    desc: "Configure o nome da empresa, instruções e tom de voz. A IA aprende e se adapta ao seu negócio.",
    icon: Cpu,
  },
  {
    num: "03",
    title: "Recupere Vendas",
    desc: "A IA responde leads, qualifica, faz follow-up e fecha vendas automaticamente — 24h por dia.",
    icon: Target,
  },
];

const features = [
  { icon: Bot, title: "IA Vendedora 24/7", desc: "Responde, qualifica e fecha vendas sem parar." },
  { icon: BarChart3, title: "Dashboard Completo", desc: "Métricas de leads, conversões e receita em tempo real." },
  { icon: Send, title: "Follow-up Automático", desc: "Nunca mais perca um lead por falta de retorno." },
  { icon: Shield, title: "Anti-Bloqueio", desc: "Tecnologia que protege seu WhatsApp de banimentos." },
  { icon: Globe, title: "Lead Tracker", desc: "Acompanhe cada lead do primeiro contato à conversão." },
  { icon: RefreshCw, title: "Integração Webhook", desc: "Conecte com Make, Zapier e qualquer plataforma." },
];

const plans = [
  {
    name: "Básico",
    price: "R$ 79,90",
    period: "/mês",
    detail: "1 Número • 1M Tokens • 3.000 Webhooks",
    afterNote: null,
    note: "Ideal para começar",
    noteStyle: "warning" as const,
    popular: false,
  },
  {
    name: "Profissional",
    price: "R$ 149,90",
    period: "/mês",
    detail: "Múltiplos Números • 5M Tokens • 10.000 Webhooks",
    afterNote: null,
    note: "Mais popular",
    noteStyle: "success" as const,
    popular: true,
  },
  {
    name: "Avançado",
    price: "R$ 249,90",
    period: "/mês",
    detail: "Ilimitado • 10M Tokens • 20.000 Webhooks",
    afterNote: null,
    note: "Para empresas em escala",
    noteStyle: "success" as const,
    popular: false,
  },
];

const featureList = [
  "Agente de IA personalizado",
  "Lead Tracker avançado",
  "Dashboard completo",
  "Suporte prioritário",
  "Tokens extras disponíveis",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/20 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-foreground">Atende AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#funcionalidades" className="hover:text-foreground transition-colors">Recursos</a>
            <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="neon-cta rounded-xl">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" className="space-y-8">
              {/* Badges */}
              <motion.div variants={fadeUp} custom={0} className="flex flex-wrap gap-3">
                {["IA Vendedora", "CRM Automático", "Anti-Bloqueio"].map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 border border-primary/20 text-primary">
                    <Sparkles className="h-3 w-3" />
                    {badge}
                  </span>
                ))}
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Recupere{" "}
                <span className="gradient-text-neon">vendas perdidas</span>{" "}
                no WhatsApp sem contratar{" "}
                <span className="gradient-text">mais funcionários</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-xl">
                Sua IA treinada com os seus dados, pronta para fechar boletos e tirar dúvidas{" "}
                <strong className="text-foreground">24h por dia</strong>
              </motion.p>

              {/* Mini stats */}
              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-6">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm">
                    <s.icon className="h-4 w-4 text-primary" />
                    <span className="font-bold text-foreground">{s.value}</span>
                    <span className="text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-4">
                <a href="#precos">
                  <Button size="lg" className="neon-cta rounded-xl text-base px-8">
                    Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="#como-funciona">
                  <Button variant="outline" size="lg" className="rounded-xl text-base px-8 border-border/40 bg-card/20 backdrop-blur-sm hover:bg-card/40">
                    Ver Como Funciona
                  </Button>
                </a>
              </motion.div>

              <motion.p variants={fadeUp} custom={5} className="text-xs text-muted-foreground">
                ✅ Cadastro gratuito · Garantia de 7 dias · Cancele quando quiser
              </motion.p>
            </motion.div>

            {/* Chat mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hidden lg:block"
            >
              <div className="glass-card rounded-2xl p-1 glow-border">
                <div className="rounded-xl bg-[#0a1628] p-4 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/20">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">IA Vendedora · Atende AI</p>
                      <p className="text-xs text-primary">● Online agora</p>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-sm">Oi, vi o anúncio de vocês. Quanto custa?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-card/60 border border-border/30 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-sm">Olá! 😊 Que bom que entrou em contato! Nosso plano custa R$149/mês. Posso te explicar os benefícios?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-sm">Sim, me conta mais!</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-card/60 border border-border/30 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-sm">Perfeito! ✨ Inclui IA 24/7, Lead Tracker, follow-up automático e suporte. Posso gerar seu boleto agora?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-sm">Quero sim!</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/20 text-center">
                    <p className="text-xs text-primary">🤖 100% respondido pela IA · Venda fechada em 2 minutos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 md:py-28 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">
              Simples e Rápido
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">
              Como o <span className="gradient-text">Atende AI</span> funciona
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-xl mx-auto">
              3 passos para transformar seu WhatsApp em uma máquina de vendas
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="glass-card rounded-2xl p-8 gradient-border group hover:glow-border transition-all duration-500"
              >
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-4xl font-black gradient-text-neon opacity-60">{step.num}</span>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-20 md:py-28 px-6 relative">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[hsl(217,91%,60%)]/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">
              Plataforma Completa
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">
              Tudo que você precisa para <span className="gradient-text">vender no automático</span>
            </motion.h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="glass-card rounded-2xl p-6 gradient-border group hover:glow-border transition-all duration-500"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="py-20 md:py-28 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">
              Planos
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">
              Escolha o plano ideal
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3">
              Comece a vender no automático agora mesmo
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className={`glass-card rounded-2xl p-8 relative flex flex-col gradient-border ${
                  plan.popular ? "glow-border border-primary/40" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold px-4 py-1 rounded-full shadow-lg shadow-primary/30">
                    Mais Popular
                  </div>
                )}

                <h3 className="font-bold text-xl mb-1">{plan.name}</h3>

                <div className="mt-4 mb-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>

                <p className="text-xs text-muted-foreground mb-1">{plan.detail}</p>
                {plan.afterNote && (
                  <p className="text-xs text-muted-foreground mb-3">Meses seguintes: <strong className="text-foreground">R$ 149,00/mês</strong></p>
                )}

                <div className={`text-xs font-semibold mb-6 px-3 py-1.5 rounded-lg inline-block w-fit ${
                  plan.noteStyle === "success"
                    ? "bg-success/15 text-success border border-success/20"
                    : "bg-warning/15 text-warning border border-warning/20"
                }`}>
                  {plan.note}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {featureList.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button
                    className={`w-full rounded-xl text-base py-5 ${
                      plan.popular ? "neon-cta" : "bg-card/60 border border-border/40 hover:bg-card/80"
                    }`}
                  >
                    Começar Agora <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            ✅ Cadastro gratuito · Garantia de 7 dias · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para <span className="gradient-text">vender no automático</span>?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Junte-se a centenas de empresas que já transformaram seu WhatsApp em uma máquina de vendas com IA.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Link to="/auth">
                <Button size="lg" className="neon-cta rounded-xl text-base px-10 py-6">
                  Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Atende AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Atende AI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
