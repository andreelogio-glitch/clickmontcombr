import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, Truck, Shield, Wrench, ArrowRight, DollarSign, Star } from "lucide-react";
import logoClickmont from "@/assets/logo-clickmont.png";

const benefits = [
  {
    icon: Zap,
    title: "Bônus de Urgência – Taxa Zero!",
    desc: "Serviços marcados como Urgentes não têm taxa da plataforma! Você recebe 100% do valor do seu lance.",
    highlight: true,
  },
  {
    icon: Clock,
    title: "Bônus de Velocidade +10%",
    desc: "Concluiu o serviço no mesmo dia do aceite? Nós adicionamos um bônus de 10% sobre o valor da montagem.",
    highlight: true,
  },
  {
    icon: Truck,
    title: "Pagamento Antecipado (Mudanças)",
    desc: "Em serviços de mudança, receba 40% do valor assim que terminar a desmontagem. Os 60% restantes vêm na montagem.",
    highlight: false,
  },
  {
    icon: Shield,
    title: "Segurança PIX",
    desc: "Saques rápidos e auditoria transparente via Admin. Cadastre sua chave PIX e receba diretamente na sua conta.",
    highlight: false,
  },
];

const SouMontador = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="container relative py-20 text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logoClickmont} alt="Clickmont" className="h-12 w-12 rounded-xl" />
            <span className="text-3xl font-black text-gradient">Clickmont</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Ganhe dinheiro com{" "}
            <span className="text-gradient">montagens e mudanças</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Na Clickmont, seu esforço vale mais. Receba pedidos na sua região, 
            defina seus valores e ganhe bônus por agilidade.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground text-lg px-8 py-6"
              onClick={() => navigate("/cadastro-montador")}
            >
              <Wrench className="h-5 w-5 mr-2" /> Cadastrar-me como Montador
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning" /> Cadastro gratuito</span>
            <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-success" /> Receba via PIX</span>
            <span className="flex items-center gap-1"><Shield className="h-4 w-4 text-primary" /> Sem mensalidade</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-center mb-10">
          Por que ser montador na <span className="text-gradient">Clickmont</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {benefits.map((b, i) => (
            <Card
              key={i}
              className={`transition-all hover:scale-[1.02] ${
                b.highlight
                  ? "border-primary/50 bg-accent/30 shadow-lg shadow-primary/5"
                  : ""
              }`}
            >
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${b.highlight ? "gradient-primary" : "bg-muted"}`}>
                    <b.icon className={`h-6 w-6 ${b.highlight ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="font-bold text-lg">{b.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-16">
        <div className="container max-w-3xl text-center space-y-10">
          <h2 className="text-2xl font-bold">Como funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Cadastre-se", desc: "Envie seus documentos e chave PIX" },
              { step: "2", title: "Receba pedidos", desc: "Veja os pedidos na sua região e dê seu lance" },
              { step: "3", title: "Receba via PIX", desc: "Após a confirmação do cliente, o valor cai na sua conta" },
            ].map((s) => (
              <div key={s.step} className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {s.step}
                </div>
                <h3 className="font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground"
            onClick={() => navigate("/cadastro-montador")}
          >
            Começar agora <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container text-center text-xs text-muted-foreground space-y-2">
          <p>© {new Date().getFullYear()} ClickMont — Todos os direitos reservados</p>
          <p>CNPJ: 61.774.392/0001-30 · contato@clickmont.com.br</p>
          <p>🔒 Pagamentos seguros via Mercado Pago</p>
          <Link to="/termos-e-privacidade" className="text-primary hover:underline inline-block mt-1">
            📄 Termos de Uso e Política de Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default SouMontador;
