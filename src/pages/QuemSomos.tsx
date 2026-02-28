import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Target, Heart, Lock, ShieldCheck } from "lucide-react";
import logoClickmont from "@/assets/logo-clickmont.png";

const values = [
  { icon: Shield, title: "Transparência", desc: "Processos claros e visíveis em todas as etapas do serviço." },
  { icon: Target, title: "Pontualidade", desc: "Compromisso com prazos e agilidade no atendimento." },
  { icon: Heart, title: "Segurança nos Pagamentos", desc: "Custódia financeira que protege ambas as partes." },
  { icon: Eye, title: "Respeito à Autonomia", desc: "Valorização do profissional sem vínculo trabalhista." },
];

const QuemSomos = () => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-10 animate-fade-in">
        {/* Hero */}
        <div className="text-center space-y-4">
          <img src={logoClickmont} alt="Clickmont" className="mx-auto h-20 w-20 object-contain" />
          <h1 className="text-3xl font-bold">Quem Somos</h1>
          <p className="text-muted-foreground leading-relaxed text-lg">
            A <strong className="text-foreground">Clickmont</strong> nasceu da experiência prática de mais de 15 anos no setor de montagem de móveis em domicílio. Identificamos a necessidade de conectar, de forma ágil e segura, profissionais qualificados a clientes que buscam excelência. Somos uma plataforma tecnológica de intermediação, focada em facilitar o encontro entre a oferta e a demanda, garantindo transparência em todo o processo, sem qualquer vínculo trabalhista entre as partes.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/30">
            <CardContent className="pt-6 space-y-2">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Target className="h-5 w-5" /> Missão
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Democratizar o acesso a montadores profissionais, oferecendo uma ferramenta segura que valoriza o trabalho do prestador e garante a satisfação total do cliente final através da tecnologia.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/30">
            <CardContent className="pt-6 space-y-2">
              <h2 className="text-xl font-bold text-gold flex items-center gap-2">
                <Eye className="h-5 w-5" /> Visão
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Tornar-se a maior referência nacional em intermediação de serviços de montagem, sendo reconhecida pela segurança financeira, agilidade no atendimento e qualidade dos profissionais parceiros.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">Nossos Valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="flex items-start gap-3 pt-5">
                  <div className="rounded-full bg-primary/10 p-2 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security & Payment Partners */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">Segurança & Parceiros de Tecnologia</h2>
          <Card className="border-[hsl(210,60%,85%)] bg-[hsl(210,60%,97%)]">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[hsl(210,70%,50%)]/10 p-3 shrink-0">
                  <Lock className="h-6 w-6 text-[hsl(210,70%,50%)]" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Pagamento Protegido
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    O pagamento fica custodiado no ambiente seguro da plataforma e só é liberado ao montador após a confirmação da conclusão do serviço pelo cliente.
                  </p>
                </div>
              </div>
              <div className="border-t border-[hsl(210,60%,85%)] pt-3 text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 Pagamentos processados com segurança — aceitamos PIX, Cartão de Crédito/Débito e Boleto.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Identidade Institucional */}
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold">Identidade Institucional</h2>
          <p className="text-sm text-muted-foreground">Operado por <strong className="text-foreground">André Ramos dos Santos</strong></p>
          <p className="text-sm text-muted-foreground">CNPJ: 61.774.392/0001-30</p>
          <p className="text-sm text-muted-foreground">São Paulo – SP, Brasil</p>
          <p className="text-sm text-muted-foreground">contato@clickmont.com.br · <a href="https://wa.me/551151280116" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp</a></p>
          <Card className="border-primary/20 mt-4">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Missão</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Facilitar a conexão entre clientes e prestadores de serviços de montagem de móveis de forma segura, transparente e eficiente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default QuemSomos;
