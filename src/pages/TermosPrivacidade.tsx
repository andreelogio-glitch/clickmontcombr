import { Link } from "react-router-dom";
import { ArrowLeft, Shield, CreditCard, FileText, Lock, AlertTriangle, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoClickmont from "@/assets/logo-clickmont.png";

const Section = ({ icon: Icon, title, children }: { icon: typeof Shield; title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
      <Icon className="h-5 w-5 text-primary" />
      {title}
    </h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
      {children}
    </div>
  </section>
);

const TermosPrivacidade = () => {
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
            <h1 className="text-lg font-bold text-foreground">Termos de Uso e Política de Privacidade</h1>
            <p className="text-xs text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-10 space-y-10">
        {/* 1. Natureza do Serviço */}
        <Section icon={FileText} title="1. Natureza do Serviço">
          <p>
            A <strong>Clickmont</strong> é uma plataforma digital de intermediação que conecta clientes que necessitam de serviços de montagem, desmontagem e mudança de móveis a montadores autônomos previamente cadastrados e verificados.
          </p>
          <p>
            A Clickmont <strong>não é</strong> uma empresa de montagem de móveis. Os montadores são profissionais independentes e autônomos, responsáveis pela execução dos serviços contratados. A plataforma atua exclusivamente como facilitadora da conexão entre as partes.
          </p>
          <p>
            Ao utilizar a plataforma, o usuário declara estar ciente de que a Clickmont não se responsabiliza diretamente pela qualidade ou resultado final dos serviços prestados pelos montadores, embora ofereça mecanismos de mediação e suporte para resolução de conflitos.
          </p>
        </Section>

        {/* 2. Pagamentos e Custódia */}
        <Section icon={CreditCard} title="2. Pagamentos e Custódia">
          <p>
            Todos os pagamentos são processados de forma segura através do <strong>Mercado Pago</strong>. O valor pago pelo cliente fica <strong>retido em custódia</strong> pela plataforma até que o serviço seja concluído e confirmado.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">Regras de liberação:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Montagem ou Desmontagem:</strong> 100% do valor líquido é liberado ao montador após a confirmação do cliente de que o serviço foi concluído satisfatoriamente.
              </li>
              <li>
                <strong>Mudança (Desmontagem + Montagem):</strong> O pagamento é fracionado — <strong>40%</strong> do valor é liberado após a conclusão da desmontagem e <strong>60%</strong> após a montagem final, ambos mediante confirmação do cliente.
              </li>
            </ul>
          </div>
          <p>
            Após a confirmação do cliente, o valor entra em estado de <strong>auditoria administrativa</strong>. A liberação definitiva para o saldo disponível do montador depende de revisão e autorização pela equipe da Clickmont, garantindo a integridade de todas as transações.
          </p>
        </Section>

        {/* 3. Taxas e Bônus */}
        <Section icon={Percent} title="3. Taxas de Intermediação e Bônus">
          <p>
            A Clickmont aplica as seguintes taxas sobre cada transação para manutenção e operação da plataforma:
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Taxa do cliente:</strong> 20% sobre o valor do lance aceito, somada ao valor total do pedido.
              </li>
              <li>
                <strong>Taxa do montador:</strong> 10% do valor do lance é deduzido como taxa de intermediação.
              </li>
              <li>
                <strong>Serviços urgentes:</strong> Pedidos marcados como "Urgente" possuem <strong>taxa zero</strong> para o montador — o profissional recebe 100% do seu lance.
              </li>
              <li>
                <strong>Bônus de velocidade:</strong> Serviços concluídos no mesmo dia do aceite recebem um bônus adicional de <strong>+10%</strong> sobre o valor da montagem, pago pela plataforma ao montador.
              </li>
            </ul>
          </div>
        </Section>

        {/* 4. Privacidade e Proteção de Dados */}
        <Section icon={Lock} title="4. Privacidade e Proteção de Dados">
          <p>
            A Clickmont está comprometida com a proteção dos dados pessoais de seus usuários, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018)</strong>.
          </p>
          <p>
            <strong>Dados coletados e sua finalidade:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Documentos de identidade (RG/CPF):</strong> Utilizados exclusivamente para verificação de identidade dos montadores.</li>
            <li><strong>Selfie com documento:</strong> Utilizada para confirmação de identidade e prevenção de fraudes.</li>
            <li><strong>Chave PIX:</strong> Utilizada exclusivamente para o processamento de pagamentos aos montadores.</li>
            <li><strong>Endereço:</strong> O endereço completo do cliente só é revelado ao montador após a confirmação do pagamento.</li>
            <li><strong>Telefone:</strong> Utilizado para comunicação essencial entre as partes envolvidas no serviço.</li>
          </ul>
          <p>
            Dados sensíveis são armazenados de forma criptografada e <strong>nunca são compartilhados com terceiros</strong> para fins comerciais ou publicitários. O usuário pode solicitar a exclusão de seus dados a qualquer momento entrando em contato com o suporte.
          </p>
        </Section>

        {/* 5. Cancelamento e Estorno */}
        <Section icon={AlertTriangle} title="5. Cancelamento e Estorno">
          <p>
            A Clickmont oferece as seguintes garantias em caso de problemas com o serviço:
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Não comparecimento do montador:</strong> Caso o montador aceite o serviço e não compareça no horário combinado, o cliente tem direito ao <strong>estorno integral</strong> do valor pago.
              </li>
              <li>
                <strong>Cancelamento pelo cliente:</strong> Cancelamentos realizados antes do aceite de um lance são gratuitos. Após o aceite, pode haver retenção de taxa administrativa.
              </li>
              <li>
                <strong>Serviço incompleto ou insatisfatório:</strong> O cliente pode abrir um ticket de assistência para mediação. A equipe da Clickmont analisará o caso e poderá autorizar estorno parcial ou total.
              </li>
            </ul>
          </div>
          <p>
            Estornos são processados pelo mesmo meio de pagamento utilizado na transação original (Mercado Pago) em até <strong>10 dias úteis</strong>.
          </p>
        </Section>

        {/* 6. Disposições Gerais */}
        <Section icon={Shield} title="6. Disposições Gerais">
          <p>
            Ao se cadastrar e utilizar a plataforma Clickmont, o usuário declara ter lido, compreendido e aceito integralmente estes Termos de Uso e Política de Privacidade.
          </p>
          <p>
            A Clickmont reserva-se o direito de atualizar estes termos a qualquer momento, notificando os usuários sobre alterações relevantes por meio da plataforma ou e-mail cadastrado.
          </p>
          <p>
            Para dúvidas, reclamações ou solicitações relacionadas à privacidade, entre em contato através da seção de <strong>Assistência</strong> dentro da plataforma.
          </p>
        </Section>

        {/* Cláusula Legal */}
        <div className="pt-6 border-t border-border space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Cláusula de Natureza Jurídica:</strong> A Clickmont é uma ferramenta tecnológica de autogestão. O pagamento processado via plataforma constitui um <strong>mandato de pagamento</strong>, onde a plataforma recebe do cliente e repassa ao profissional, agindo exclusivamente como <strong>agente de cobrança e custódia temporária</strong> dos valores, nos termos do art. 653 e seguintes do Código Civil Brasileiro. A Clickmont não mantém vínculo empregatício com os montadores cadastrados, tampouco se configura como instituição financeira ou de pagamento, atuando apenas como intermediária tecnológica na facilitação das transações entre as partes.
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Clickmont — Todos os direitos reservados
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              🔒 Plataforma protegida com criptografia de ponta a ponta
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermosPrivacidade;
