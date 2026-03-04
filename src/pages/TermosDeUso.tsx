import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, CreditCard, FileText, Lock, MessageCircle, AlertTriangle, Scale, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoClickmont from "@/assets/logo-clickmont.png";

const Section = ({ icon: Icon, title, children }: { icon: typeof Shield; title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
      <Icon className="h-5 w-5 text-primary" />
      {title}
    </h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

const TermosDeUso = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex items-center gap-3 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logoClickmont} alt="ClickMont" className="h-8 w-8 rounded-lg object-contain" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Termos de Uso</h1>
            <p className="text-xs text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-10 space-y-10">
        {/* 1. Papel da Plataforma */}
        <Section icon={Building2} title="1. A Plataforma ClickMont">
          <p>
            A <strong className="text-foreground">ClickMont</strong> (CNPJ 61.774.392/0001-30), operada por André Ramos dos Santos, com sede em São Paulo – SP, é uma
            plataforma digital de intermediação tecnológica que conecta clientes que necessitam de serviços de montagem e desmontagem de
            móveis a montadores profissionais independentes previamente cadastrados e verificados.
          </p>
          <p>
            A ClickMont <strong className="text-foreground">não é</strong> uma empresa de montagem de móveis e não atua como prestadora direta de serviços.
            Os montadores são profissionais autônomos, responsáveis pela execução dos serviços contratados. A plataforma funciona
            exclusivamente como <strong className="text-foreground">intermediadora tecnológica</strong>, facilitando a conexão segura entre as partes.
          </p>
          <p>
            A plataforma não oferece empregos, não garante renda, não promete volume de serviços e não constitui
            oferta de vínculo empregatício de qualquer natureza.
          </p>
        </Section>

        {/* 2. Garantia ClickMont — Custódia Segura */}
        <Section icon={CreditCard} title="2. Garantia ClickMont — Custódia Segura">
          <p>
            Para garantir a segurança de ambas as partes, o pagamento é realizado pelo cliente no ato da contratação e mantido em
            <strong className="text-foreground"> custódia segura</strong> pela plataforma durante toda a execução do serviço.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">Este modelo assegura que:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>O <strong>Cliente</strong> tem a garantia de que seu dinheiro só será liberado após a confirmação da conclusão satisfatória do serviço.</li>
              <li>O <strong>Montador</strong> tem a garantia de que receberá a remuneração pelo trabalho realizado, uma vez confirmado pelo cliente.</li>
            </ul>
          </div>
          <p>
            O pagamento processado via plataforma constitui um <strong className="text-foreground">mandato de pagamento</strong>, onde a ClickMont recebe do
            cliente e repassa ao profissional, agindo exclusivamente como agente de cobrança e custódia temporária.
          </p>
        </Section>

        {/* 3. Liberação de Crédito */}
        <Section icon={Scale} title="3. Liberação de Crédito ao Prestador">
          <p>
            O valor acordado no orçamento só é transferido ao prestador de serviço após:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>A <strong className="text-foreground">confirmação mútua</strong> da conclusão do serviço por ambas as partes (cliente e montador).</li>
            <li>Ou, em caso de disputa, por <strong className="text-foreground">decisão da mediação</strong> conduzida pela equipe ClickMont.</li>
          </ul>
          <p>
            Após a confirmação do cliente, o valor entra em estado de <strong className="text-foreground">auditoria administrativa</strong>.
            A liberação definitiva para o saldo disponível do montador depende de revisão e autorização pela equipe da ClickMont,
            garantindo a integridade de todas as transações.
          </p>
        </Section>

        {/* 4. Taxas de Serviço */}
        <Section icon={FileText} title="4. Taxas de Serviço">
          <p>
            A plataforma pode aplicar <strong className="text-foreground">taxas de serviço aplicáveis</strong> relacionadas à intermediação tecnológica,
            manutenção do ambiente digital, segurança da transação e facilitação da conexão entre as partes.
          </p>
          <p>
            Todos os valores, incluindo a remuneração do prestador e eventuais taxas operacionais, são apresentados de forma
            transparente antes da confirmação do serviço. A aceitação do orçamento pelo cliente implica concordância com os valores
            apresentados.
          </p>
        </Section>

        {/* 5. Chat Blindado e Conduta */}
        <Section icon={MessageCircle} title="5. Chat Blindado e Regras de Conduta">
          <p>
            A ClickMont disponibiliza um <strong className="text-foreground">chat interno protegido</strong> para comunicação entre cliente e montador
            durante o processo de contratação e execução do serviço. Este canal é o meio oficial e exclusivo de comunicação entre as partes.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">Regras de conduta no chat:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>É <strong>proibida</strong> a troca de números de telefone, e-mails ou quaisquer contatos pessoais antes da contratação formal pela plataforma.</li>
              <li>É <strong>proibido</strong> o compartilhamento de links externos, propostas de pagamento fora da plataforma ou conteúdo ofensivo.</li>
              <li>Tentativas de burlar a intermediação da plataforma podem resultar em <strong>suspensão ou banimento</strong> da conta.</li>
              <li>O endereço completo do cliente só é revelado ao montador após a confirmação do pagamento.</li>
            </ul>
          </div>
        </Section>

        {/* 6. Verificação de Identidade */}
        <Section icon={Lock} title="6. Verificação de Identidade e Segurança">
          <p>
            Montadores cadastrados passam por um processo de verificação que inclui:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Selfie para confirmação de identidade.</li>
            <li>Documento oficial (RG ou CNH).</li>
            <li>Comprovação de experiência profissional (mínimo de 6 meses).</li>
            <li>Aprovação manual pela equipe ClickMont.</li>
          </ul>
          <p>
            Adicionalmente, cada serviço contratado utiliza um <strong className="text-foreground">código de segurança de 4 dígitos</strong>,
            gerado automaticamente pela plataforma e fornecido pelo cliente ao montador apenas no local do serviço,
            validando a identidade de ambas as partes.
          </p>
        </Section>

        {/* 7. Cancelamento */}
        <Section icon={AlertTriangle} title="7. Cancelamento e Estorno">
          <p>
            A ClickMont oferece as seguintes garantias em caso de problemas:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Não comparecimento do montador:</strong> O cliente tem direito ao estorno integral do valor pago.</li>
            <li><strong className="text-foreground">Cancelamento antes do aceite:</strong> Cancelamentos realizados antes do aceite de um lance são gratuitos.</li>
            <li><strong className="text-foreground">Serviço insatisfatório:</strong> O cliente pode abrir um ticket de assistência para mediação pela equipe ClickMont.</li>
          </ul>
        </Section>

        {/* 8. Disposições Gerais */}
        <Section icon={Shield} title="8. Disposições Gerais">
          <p>
            Ao se cadastrar e utilizar a plataforma ClickMont, o usuário declara ter lido, compreendido e aceito
            integralmente estes Termos de Uso.
          </p>
          <p>
            A ClickMont reserva-se o direito de atualizar estes termos a qualquer momento, notificando os usuários
            sobre alterações relevantes por meio da plataforma ou e-mail cadastrado.
          </p>
          <p>
            Para dúvidas ou reclamações, entre em contato através da seção de Assistência na plataforma
            ou pelo e-mail <strong className="text-foreground">contato@clickmont.com.br</strong>.
          </p>
        </Section>

        {/* Footer legal */}
        <div className="pt-6 border-t border-border space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Cláusula Legal:</strong> A ClickMont é uma ferramenta tecnológica de autogestão.
              O pagamento processado via plataforma é um mandato de pagamento, onde a plataforma recebe do cliente e repassa ao
              profissional, agindo apenas como agente de cobrança e custódia temporária.
            </p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ClickMont — Todos os direitos reservados</p>
            <p className="text-xs text-muted-foreground">CNPJ: 61.774.392/0001-30 · contato@clickmont.com.br</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermosDeUso;
