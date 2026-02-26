import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, MessageCircle, DollarSign, Shield, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import logoClickmont from "@/assets/logo-clickmont.png";

const faqs = [
  {
    icon: DollarSign,
    question: "Como faço meu primeiro saque?",
    answer:
      "Após a conclusão do serviço e confirmação do cliente, o valor entra em auditoria. Depois de aprovado pelo admin, o saldo fica disponível na sua Carteira. Vá em Carteira → Solicitar Saque, informe o valor e aguarde a transferência via PIX para a chave cadastrada.",
  },
  {
    icon: Clock,
    question: "Quanto tempo demora para o dinheiro cair na minha conta?",
    answer:
      "Após a aprovação do admin, o PIX é processado em até 24 horas úteis. Saques solicitados aos finais de semana serão processados na segunda-feira.",
  },
  {
    icon: Shield,
    question: "E se o cliente não confirmar o serviço?",
    answer:
      "Se o cliente não confirmar em até 48 horas após a conclusão, você pode abrir um ticket de Assistência com fotos do serviço. Nossa equipe analisará e poderá liberar o pagamento manualmente.",
  },
  {
    icon: DollarSign,
    question: "Qual a taxa da plataforma?",
    answer:
      "A Clickmont deduz 10% do valor do seu lance como taxa de intermediação. Porém, serviços marcados como URGENTES têm taxa ZERO — você recebe 100%. Além disso, serviços concluídos no mesmo dia ganham um bônus de +10%!",
  },
  {
    icon: FileText,
    question: "Como funciona o pagamento de mudanças?",
    answer:
      "Em mudanças (desmontagem + montagem), o pagamento é fracionado: 40% é liberado após a desmontagem e 60% após a montagem final. Ambos dependem da confirmação do cliente.",
  },
  {
    icon: Shield,
    question: "Minha chave PIX está segura?",
    answer:
      "Sim. Sua chave PIX é armazenada de forma criptografada e usada exclusivamente para transferências de pagamento. Nunca é compartilhada com terceiros.",
  },
  {
    icon: HelpCircle,
    question: "Posso alterar minha chave PIX?",
    answer:
      "Sim, acesse seu perfil e atualize a chave PIX a qualquer momento. A nova chave será usada nos próximos saques.",
  },
  {
    icon: Clock,
    question: "O que é o bônus de velocidade?",
    answer:
      "Se você concluir o serviço no mesmo dia em que o lance foi aceito, a Clickmont adiciona um bônus de 10% sobre o valor da montagem, pago pela plataforma.",
  },
];

const SuporteMontador = () => {
  const whatsappUrl = "https://wa.me/551151280116?text=" +
    encodeURIComponent("Olá! Sou montador na Clickmont e preciso de ajuda.");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex items-center gap-3 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <img src={logoClickmont} alt="Clickmont" className="h-8 w-8 rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Suporte ao Montador</h1>
            <p className="text-xs text-muted-foreground">Dúvidas frequentes e contato direto</p>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl py-8 space-y-8">
        {/* WhatsApp CTA */}
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,70%,45%)]/10">
            <MessageCircle className="h-7 w-7 text-[hsl(142,70%,45%)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Precisa de ajuda rápida?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fale direto com o suporte da Clickmont pelo WhatsApp.
              <br />
              Respondemos em até 30 minutos no horário comercial.
            </p>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,38%)] text-white text-base px-8"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar no WhatsApp
            </Button>
          </a>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Perguntas Frequentes
          </h2>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border border-border px-4">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline gap-2">
                  <span className="flex items-center gap-2 text-left">
                    <faq.icon className="h-4 w-4 text-primary shrink-0" />
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-sm text-muted-foreground">Não encontrou o que procura?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/assistencia">
              <Button variant="outline">Abrir Ticket de Assistência</Button>
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="text-[hsl(142,70%,45%)] border-[hsl(142,70%,45%)]/30">
                <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuporteMontador;
