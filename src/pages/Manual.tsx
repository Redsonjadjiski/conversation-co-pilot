import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lock } from "lucide-react";

const chapters = [
  {
    title: "1. Primeiros Passos",
    desc: "Como configurar o Atende AI do zero.",
    content: `**Bem-vindo ao Atende AI!**

Para começar a usar a plataforma, siga estes passos:

1. **Crie sua conta** em /auth com e-mail e senha
2. **Escolha um plano** na aba Assinatura (Básico, Profissional ou Avançado)
3. **Configure a conexão** na aba Configuração:
   - Insira sua chave Claude (Anthropic Console)
   - Treine a IA com informações do seu negócio
   - Configure o webhook da Evolution API
4. **Conecte seu WhatsApp** escaneando o QR Code
5. **Pronto!** Sua IA já está respondendo seus clientes.`,
  },
  {
    title: "2. Conectando o WhatsApp",
    desc: "Passo a passo para conectar via Evolution API.",
    content: `**Requisitos:**
- Conta ativa no Atende AI
- Servidor Evolution API configurado (Railway recomendado)
- Número de WhatsApp dedicado

**Passo a passo:**
1. Acesse **Configuração** no menu lateral
2. Complete os 3 passos (Claude Key, Treinamento, Webhook)
3. Clique em **"Ativar Agente no WhatsApp"**
4. Escaneie o **QR Code** com seu WhatsApp
5. Aguarde a confirmação de conexão

**Dica:** Use um número exclusivo para o bot. Não use seu número pessoal.`,
  },
  {
    title: "3. Treinando a IA",
    desc: "Boas práticas para treinar seu agente.",
    content: `**Como treinar bem:**

1. Acesse **Cérebro da IA** no menu
2. Preencha o **nome da empresa**
3. No campo de conhecimento, inclua:
   - Descrição da empresa
   - Produtos e preços
   - Perguntas frequentes (FAQ)
   - Tom de voz desejado
   - Regras de atendimento

**Exemplo de instrução:**
"Você é a assistente virtual da Loja X. Responda de forma amigável. Nossos produtos: Produto A (R$ 97), Produto B (R$ 197). Link de pagamento: exemplo.com/pagar"

**Dica:** Quanto mais detalhes, melhor a IA atende. Use até 60.000 caracteres.`,
  },
  {
    title: "4. Usando o CRM",
    desc: "Como gerenciar leads no Kanban.",
    content: `**O CRM Kanban tem 4 colunas:**
- 🔵 **Novo** — Lead recém-chegado
- 🟡 **Em Atendimento** — IA está atendendo
- 🟢 **Convertido** — Venda realizada
- 🔴 **Perdido** — Lead descartado

**Como usar:**
- **Arraste** cards entre colunas para atualizar o status
- Clique **"+"** em qualquer coluna para adicionar um lead
- Clique no **lixo** para remover um lead
- Cada card mostra nome, telefone e valor`,
  },
  {
    title: "5. Fazendo Disparos",
    desc: "Como criar e enviar mensagens em massa.",
    content: `**Disparos em massa via WhatsApp:**

1. Acesse **Disparos** no menu
2. **Selecione um grupo** de leads (por status)
3. **Compose a mensagem** usando variáveis:
   - {nome} — Nome do lead
   - {telefone} — Telefone do lead
4. Clique em **"Enviar Disparo"**
5. Acompanhe o progresso em tempo real

**Boas práticas anti-bloqueio:**
- Máximo 200 mensagens por vez
- Intervalo automático de 1 segundo entre envios
- Use linguagem natural, evite spam
- Sempre dê opção de opt-out`,
  },
  {
    title: "6. Entendendo os Planos",
    desc: "Tokens, webhooks e limites.",
    content: `**Planos disponíveis:**

| Plano | Preço | Tokens | Webhooks |
|-------|-------|--------|----------|
| Básico | R$ 79,90/mês | 1M | 3.000 |
| Profissional | R$ 149,90/mês | 5M | 10.000 |
| Avançado | R$ 249,90/mês | 10M | 20.000 |

**O que são Tokens?**
Tokens medem o uso da IA. 1M tokens ≈ 2.500 mensagens completas.

**O que são Webhooks?**
Webhooks contam cada mensagem recebida do WhatsApp.

**Tokens extras:** Compre pacotes adicionais na aba Assinatura.`,
  },
  {
    title: "7. FAQ",
    desc: "Perguntas frequentes.",
    content: `**Minha IA não está respondendo:**
Verifique se a chave Claude está válida e se o webhook está online na aba Conexão.

**Os leads não aparecem:**
Confirme que o webhook está enviando dados com o user_id correto.

**Quero trocar de plano:**
Acesse Assinatura → Gerenciar Assinatura → Portal Stripe.

**Como cancelar?**
Assinatura → Gerenciar Assinatura → Cancelar.

**Tokens esgotados:**
Compre tokens extras na aba Assinatura ou aguarde o reset mensal.

**Preciso de ajuda?**
E-mail: suporte@atendeai.com`,
  },
];

export default function ManualPage() {
  const { subscription, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const hasAccess = isAdmin || subscription.subscribed;

  const filtered = chapters.filter(ch => {
    if (!search) return true;
    const q = search.toLowerCase();
    return ch.title.toLowerCase().includes(q) || ch.desc.toLowerCase().includes(q) || ch.content.toLowerCase().includes(q);
  });

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Manual de Configuração
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Guia completo para configurar e usar o Atende AI</p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-10 text-center border border-primary/20 glow-border">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Manual Bloqueado</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            O Manual é liberado automaticamente para assinantes.
          </p>
          <Button onClick={() => navigate("/subscription")} className="neon-cta rounded-xl px-8">Assinar para Liberar</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Manual de Configuração
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Guia completo do Atende AI</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => toast("Em breve: download do PDF!")}>
          <Download className="h-4 w-4 mr-2" /> Baixar PDF
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar no manual..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
      </div>

      <Accordion type="multiple" className="space-y-3">
        {filtered.map((ch, i) => (
          <motion.div key={ch.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <AccordionItem value={ch.title} className="glass-card rounded-xl border border-border/40 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div><h3 className="text-sm font-semibold">{ch.title}</h3><p className="text-xs text-muted-foreground">{ch.desc}</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="bg-background/30 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line text-muted-foreground border border-border/20">
                  {ch.content}
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
}
