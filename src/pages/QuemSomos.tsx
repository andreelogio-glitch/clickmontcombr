import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Target, Heart } from "lucide-react";
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
      </div>
    </AppLayout>
  );
};

export default QuemSomos;
