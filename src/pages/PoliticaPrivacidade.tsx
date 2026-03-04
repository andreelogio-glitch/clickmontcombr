import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, FileText, Database, UserCheck, Building2 } from "lucide-react";
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

const PoliticaPrivacidade = () => {
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
            <h1 className="text-lg font-bold text-foreground">Política de Privacidade</h1>
            <p className="text-xs text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-10 space-y-10">
        {/* Introdução */}
        <Section icon={Building2} title="1. Controlador dos Dados">
          <p>
            A <strong className="text-foreground">ClickMont</strong> (CNPJ 61.774.392/0001-30), operada por André Ramos dos Santos, com sede em
            São Paulo – SP, é a controladora dos dados pessoais coletados através da plataforma, nos termos da
            <strong className="text-foreground"> Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018)</strong>.
          </p>
          <p>
            Esta Política de Privacidade descreve quais dados coletamos, como os utilizamos, como os protegemos e
            quais são os seus direitos como titular dos dados.
          </p>
        </Section>

        {/* Dados coletados */}
        <Section icon={Database} title="2. Dados Coletados e Finalidade">
          <p>Coletamos apenas os dados estritamente necessários para a prestação do serviço de intermediação:</p>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground font-semibold">Dado</th>
                  <th className="text-left py-2 text-foreground font-semibold">Finalidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="py-2">Nome completo</td><td className="py-2">Identificação do usuário na plataforma</td></tr>
                <tr><td className="py-2">E-mail</td><td className="py-2">Autenticação, comunicação e recuperação de conta</td></tr>
                <tr><td className="py-2">Telefone</td><td className="py-2">Comunicação essencial sobre serviços</td></tr>
                <tr><td className="py-2">Endereço</td><td className="py-2">Localização do serviço (revelado ao montador apenas após pagamento)</td></tr>
                <tr><td className="py-2">Documento (RG/CNH)</td><td className="py-2">Verificação de identidade de montadores</td></tr>
                <tr><td className="py-2">Selfie</td><td className="py-2">Confirmação de identidade e prevenção de fraudes</td></tr>
                <tr><td className="py-2">Chave PIX</td><td className="py-2">Processamento exclusivo de pagamentos aos montadores</td></tr>
                <tr><td className="py-2">CNPJ (opcional)</td><td className="py-2">Identificação fiscal do prestador, quando aplicável</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Pagamento */}
        <Section icon={Lock} title="3. Confidencialidade de Informações de Pagamento">
          <p>
            As informações financeiras dos usuários são tratadas com o mais alto nível de sigilo. Os pagamentos são processados
            integralmente por <strong className="text-foreground">gateway de pagamento seguro</strong> (Mercado Pago), certificado com padrão PCI DSS.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>A ClickMont <strong className="text-foreground">não armazena</strong> dados de cartão de crédito ou débito.</li>
            <li>As transações são processadas em ambiente criptografado diretamente pelo gateway.</li>
            <li>Chaves PIX dos montadores são armazenadas de forma protegida e utilizadas exclusivamente para transferências de remuneração.</li>
          </ul>
        </Section>

        {/* Armazenamento */}
        <Section icon={Shield} title="4. Armazenamento e Segurança dos Dados">
          <p>
            Os dados pessoais são armazenados em servidores seguros com criptografia em trânsito e em repouso.
            Adotamos as seguintes medidas de proteção:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Controle de acesso restrito por função (Role-Based Access Control).</li>
            <li>Autenticação segura com verificação de e-mail.</li>
            <li>Políticas de segurança em nível de banco de dados (Row Level Security).</li>
            <li>Documentos sensíveis armazenados em buckets privados, sem acesso público.</li>
          </ul>
        </Section>

        {/* Compartilhamento */}
        <Section icon={Eye} title="5. Compartilhamento de Dados">
          <p>
            A ClickMont <strong className="text-foreground">não vende, aluga ou compartilha</strong> dados pessoais de seus usuários com
            terceiros para fins comerciais ou publicitários.
          </p>
          <p>Os dados podem ser compartilhados apenas nas seguintes situações:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Entre as partes de um serviço:</strong> Dados limitados do cliente e do montador são compartilhados exclusivamente entre si após a formalização do serviço.</li>
            <li><strong className="text-foreground">Gateway de pagamento:</strong> Dados necessários para o processamento seguro da transação financeira.</li>
            <li><strong className="text-foreground">Obrigação legal:</strong> Em resposta a ordens judiciais ou determinações de autoridades competentes.</li>
          </ul>
        </Section>

        {/* Direitos do titular */}
        <Section icon={UserCheck} title="6. Direitos do Titular dos Dados">
          <p>
            Em conformidade com a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Acesso:</strong> Solicitar informações sobre quais dados possuímos.</li>
            <li><strong className="text-foreground">Correção:</strong> Solicitar a retificação de dados incorretos ou desatualizados.</li>
            <li><strong className="text-foreground">Exclusão:</strong> Solicitar a remoção de seus dados pessoais da plataforma.</li>
            <li><strong className="text-foreground">Portabilidade:</strong> Solicitar a transferência de seus dados a outro serviço.</li>
            <li><strong className="text-foreground">Revogação:</strong> Revogar o consentimento para tratamento de dados a qualquer momento.</li>
          </ul>
          <p>
            Para exercer qualquer um destes direitos, entre em contato através da seção de Assistência na plataforma
            ou pelo e-mail <strong className="text-foreground">contato@clickmont.com.br</strong>.
          </p>
        </Section>

        {/* Cookies */}
        <Section icon={FileText} title="7. Cookies e Dados de Navegação">
          <p>
            A plataforma utiliza cookies e tecnologias semelhantes estritamente necessários para:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Manter a sessão do usuário autenticado.</li>
            <li>Garantir o funcionamento correto das funcionalidades da plataforma.</li>
            <li>Notificações push (quando autorizadas pelo usuário).</li>
          </ul>
          <p>
            Não utilizamos cookies de rastreamento publicitário ou de terceiros para fins de marketing.
          </p>
        </Section>

        {/* Disposições finais */}
        <Section icon={Shield} title="8. Disposições Finais">
          <p>
            Esta Política de Privacidade pode ser atualizada a qualquer momento. Alterações relevantes serão
            comunicadas através da plataforma ou por e-mail cadastrado.
          </p>
          <p>
            O uso continuado da plataforma após a publicação de alterações constitui aceite das novas condições.
          </p>
        </Section>

        {/* Footer */}
        <div className="pt-6 border-t border-border space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Encarregado de Dados (DPO):</strong> Para questões relacionadas à proteção de dados,
              entre em contato pelo e-mail contato@clickmont.com.br.
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

export default PoliticaPrivacidade;
