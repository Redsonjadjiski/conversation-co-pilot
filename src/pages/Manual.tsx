import { motion } from "framer-motion";
import { BookOpen, Lock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const chapters = [
  {
    title: "1. Introdução ao Atende AI",
    desc: "Visão geral da plataforma e primeiros passos.",
    content:
      "O Atende AI é uma plataforma de atendimento automatizado via WhatsApp. Ele utiliza inteligência artificial para responder, qualificar e recuperar leads de forma autônoma, 24 horas por dia.\n\n**Principais funcionalidades:**\n- Atendimento automático via WhatsApp\n- Qualificação de leads com IA\n- CRM Kanban integrado\n- Disparos em massa\n- Flow Builder para fluxos personalizados\n\nPara começar, siga os próximos capítulos na ordem indicada.",
  },
  {
    title: "2. Configuração da API",
    desc: "Como conectar sua chave OpenAI e webhook da Evolution API.",
    content:
      "**Passo 1:** Acesse a aba 'Conexão' no menu lateral.\n\n**Passo 2:** Insira sua chave da OpenAI (começa com sk-...). Você pode gerar uma em platform.openai.com.\n\n**Passo 3:** Insira o webhook da Evolution API. Este é o endereço que conecta seu WhatsApp ao sistema.\n\n**Passo 4:** Clique em 'Salvar Configuração'. O sistema validará automaticamente as credenciais.\n\n**Dica:** Mantenha suas chaves em local seguro e nunca compartilhe com terceiros.",
  },
  {
    title: "3. Treinamento da IA",
    desc: "Inserindo conhecimento, FAQs e instruções personalizadas.",
    content:
      "Acesse a aba 'Cérebro da IA' e preencha:\n\n**Nome da Empresa:** O nome que a IA usará para se identificar.\n\n**Instruções do Sistema:** Descreva o tom de voz, regras de atendimento, informações sobre produtos/serviços e respostas para perguntas frequentes.\n\n**Exemplo de instrução:**\n\"Você é a assistente virtual da Loja X. Responda sempre de forma amigável. Nossos produtos principais são: Produto A (R$ 97), Produto B (R$ 197). Para pagamento, envie o link: exemplo.com/pagar\"\n\nQuanto mais detalhadas as instruções, melhor será o atendimento da IA.",
  },
  {
    title: "4. Lead Tracker",
    desc: "Monitorando leads, status e valor recuperado.",
    content:
      "O Lead Tracker exibe todos os contatos que interagiram com sua IA.\n\n**Status disponíveis:**\n- 🟢 Novo: Lead recém-chegado\n- 🟡 Em andamento: IA está atendendo\n- 🔵 Qualificado: Lead demonstrou interesse\n- ✅ Convertido: Venda realizada\n\n**Valor Recuperado:** Mostra o valor estimado das vendas recuperadas pela IA.\n\nUse os filtros para segmentar por status, data ou valor.",
  },
  {
    title: "5. Disparos em Massa",
    desc: "Como criar e enviar campanhas pelo WhatsApp.",
    content:
      "**1. Selecione uma lista** de contatos na aba Disparos.\n\n**2. Componha a mensagem** usando variáveis personalizadas como {nome}, {empresa}, {produto} e {valor}.\n\n**3. Anexe mídia** (imagem ou PDF) se necessário.\n\n**4. Envie ou Agende** o disparo.\n\n**Boas práticas:**\n- Envie para no máximo 200 contatos por vez\n- Espaçe os envios em intervalos de 30-60 segundos\n- Use linguagem natural, evite parecer spam\n- Sempre dê opção de opt-out",
  },
  {
    title: "6. CRM Kanban",
    desc: "Gerenciando seu funil de vendas com drag & drop.",
    content:
      "O CRM permite organizar leads em colunas:\n\n**Leads →** Contatos iniciais\n**Prospectos →** Demonstraram interesse\n**Negociação →** Em fase de fechamento\n**Clientes →** Venda concluída\n\n**Como usar:**\n- Arraste cards entre colunas para atualizar o status\n- Clique em 'Novo Lead' para cadastrar manualmente\n- Use o ícone de lixeira para remover leads\n- Cada card mostra nome, telefone, valor e tag",
  },
  {
    title: "7. Flow Builder",
    desc: "Montando fluxos de conversa automatizados.",
    content:
      "O Flow Builder permite criar sequências de conversa:\n\n**Tipos de blocos:**\n- 💬 Mensagem: Envie texto ao lead\n- ⏱ Aguardar: Pause por um tempo definido\n- ❓ Condição: Crie bifurcações baseadas em respostas\n- ⚡ Ação: Execute comandos (marcar lead, enviar link)\n\n**Como montar:**\n1. Clique nos blocos à esquerda para adicioná-los\n2. Clique em um bloco no fluxo para editá-lo\n3. Configure o conteúdo no painel direito\n4. Salve o fluxo quando estiver pronto",
  },
  {
    title: "8. Boas Práticas Anti-Bloqueio",
    desc: "Dicas para manter seu WhatsApp seguro.",
    content:
      "**Regras essenciais:**\n\n1. **Nunca envie spam** — apenas para contatos que consentiram\n2. **Limite disparos** a 200 mensagens por sessão\n3. **Intervalo mínimo** de 30 segundos entre mensagens\n4. **Evite links encurtados** em excesso\n5. **Use um número dedicado** para o bot\n6. **Aqueça o número** gradualmente (10 msg/dia na 1ª semana)\n7. **Responda mensagens** recebidas manualmente de vez em quando\n8. **Não mude de dispositivo** frequentemente\n\nSeguindo essas práticas, o risco de bloqueio é mínimo.",
  },
  {
    title: "9. Suporte e FAQ",
    desc: "Respostas para as dúvidas mais comuns.",
    content:
      "**Minha IA não está respondendo:**\nVerifique se a chave OpenAI está válida e se o webhook está online.\n\n**Os leads não aparecem:**\nConfirme que o webhook está enviando dados com o user_id correto.\n\n**Quero trocar de plano:**\nAcesse 'Assinatura' no menu e gerencie pelo portal Stripe.\n\n**Como cancelar?**\nVá em Assinatura → Portal do Cliente → Cancelar.\n\n**Preciso de ajuda extra?**\nEnvie um e-mail para suporte@atendeai.com ou entre no grupo do WhatsApp de suporte.",
  },
];

export default function ManualPage() {
  const { subscription, isAdmin } = useAuth();
  const navigate = useNavigate();

  const hasAccess = isAdmin || subscription.subscribed;

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Manual de Configuração
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Guia completo para configurar e usar o Atende AI
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-10 text-center border border-primary/20 glow-border"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Manual Bloqueado</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            O Manual de Configuração é liberado automaticamente para assinantes do{" "}
            <strong className="text-foreground">Plano Anual</strong> ou após o pagamento da taxa de setup do{" "}
            <strong className="text-foreground">Plano Mensal (R$ 499)</strong>.
          </p>
          <Button onClick={() => navigate("/subscription")} className="neon-cta rounded-xl px-8">
            Assinar para Liberar
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Manual de Configuração
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Guia completo para configurar e usar o Atende AI
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => toast("Em breve: download do PDF!")}>
          <Download className="h-4 w-4 mr-2" /> Baixar PDF
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {chapters.map((ch, i) => (
          <motion.div
            key={ch.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <AccordionItem value={ch.title} className="glass-card rounded-xl border border-border/40 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{ch.title}</h3>
                    <p className="text-xs text-muted-foreground">{ch.desc}</p>
                  </div>
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

// Need toast import
import { toast } from "sonner";
