import { HelpCircle, ExternalLink, PlayCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como pego minha chave da OpenAI?",
    answer:
      'Acesse platform.openai.com, faça login, vá em "API Keys" no menu lateral e clique em "Create new secret key". Copie a chave gerada (ela começa com "sk-") e cole no Passo 1 da configuração. Importante: a chave só aparece uma vez, então salve em um local seguro.',
  },
  {
    question: "O robô não está respondendo no WhatsApp, o que faço?",
    answer:
      "Verifique 3 coisas: 1) Se a chave da OpenAI ainda é válida (pode ter expirado ou atingido o limite de crédito). 2) Se o webhook está ativo e a URL está correta. 3) Na aba de Logs, veja se há erros recentes de envio. Se tudo estiver correto, desative e reative o agente.",
  },
  {
    question: "Como conecto meu WhatsApp à Evolution API?",
    answer:
      "Você precisa ter uma instância da Evolution API rodando. Após configurar, copie a URL do webhook (geralmente algo como https://sua-api.com/webhook/nome-da-instancia) e cole no Passo 3. A Evolution API vai encaminhar as mensagens do WhatsApp para o nosso agente.",
  },
  {
    question: "Posso treinar o robô com mais informações depois?",
    answer:
      "Sim! Você pode voltar ao Passo 2 a qualquer momento e adicionar mais conteúdo sobre seu negócio. Quanto mais contexto você fornecer (produtos, preços, FAQ, tom de voz), melhor o robô responde aos seus clientes.",
  },
  {
    question: "A chave da OpenAI tem custo?",
    answer:
      "Sim, a OpenAI cobra por uso. Cada mensagem processada consome tokens. Recomendamos acompanhar seu consumo em platform.openai.com/usage. Para a maioria dos negócios, o custo é bem baixo (menos de R$50/mês para até 1.000 conversas).",
  },
];

export default function HelpFAQ() {
  return (
    <div className="space-y-6">
      {/* Video tutorial placeholder */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <PlayCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Tutorial Rápido</h3>
            <p className="text-sm text-muted-foreground">Aprenda a configurar tudo em 3 minutos</p>
          </div>
        </div>
        <div className="relative aspect-video rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
          <div className="relative flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlayCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Clique para assistir o tutorial</p>
          </div>
        </div>
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Acessar painel da OpenAI
        </a>
      </div>

      {/* FAQ */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Perguntas Frequentes</h3>
            <p className="text-sm text-muted-foreground">As 5 dúvidas mais comuns dos nossos clientes</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
              <AccordionTrigger className="text-sm text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
