import { useState } from "react";
import { Bell, Zap, Wallet, ArrowRight, Rocket, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeToPush } from "@/lib/push";
import { toast } from "sonner";

interface OnboardingSlideProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const OnboardingSlide = ({ icon, title, children }: OnboardingSlideProps) => (
  <div className="flex flex-col items-center text-center px-2 animate-fade-in">
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
      {icon}
    </div>
    <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed max-w-sm space-y-3">
      {children}
    </div>
  </div>
);

interface MontadorOnboardingProps {
  onComplete: () => void;
}

const MontadorOnboarding = ({ onComplete }: MontadorOnboardingProps) => {
  const [step, setStep] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [enabling, setEnabling] = useState(false);

  const handleEnablePush = async () => {
    setEnabling(true);
    const ok = await subscribeToPush();
    setEnabling(false);
    if (ok) {
      setPushEnabled(true);
      toast.success("Notificações ativadas!");
    } else {
      toast.error("Não foi possível ativar. Tente nas configurações do navegador.");
    }
  };

  const handleFinish = () => {
    localStorage.setItem("montador-onboarding-done", "true");
    onComplete();
  };

  const slides = [
    // Slide 1
    <OnboardingSlide
      key="1"
      icon={<Rocket className="h-10 w-10 text-primary" />}
      title="Bem-vindo à Clickmont! 🚀"
    >
      <p>
        Você agora faz parte da rede de montadores profissionais da Clickmont.
        Pedidos da sua região vão aparecer aqui para você dar seu lance.
      </p>
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-left">
        <p className="text-xs font-semibold text-foreground flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Ative as notificações
        </p>
        <p className="text-xs">
          Para receber lances e atualizações em tempo real, ative as notificações push no seu celular.
        </p>
        <Button
          size="sm"
          className="w-full"
          onClick={handleEnablePush}
          disabled={pushEnabled || enabling}
          variant={pushEnabled ? "outline" : "default"}
        >
          {pushEnabled ? (
            <><Check className="h-4 w-4 mr-1" /> Notificações ativadas</>
          ) : enabling ? (
            "Ativando..."
          ) : (
            <><Bell className="h-4 w-4 mr-1" /> Ativar notificações</>
          )}
        </Button>
      </div>
    </OnboardingSlide>,

    // Slide 2
    <OnboardingSlide
      key="2"
      icon={<Zap className="h-10 w-10 text-primary" />}
      title="Ganhe Mais com Velocidade ⚡"
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-left">
          <p className="text-xs font-bold text-foreground">🏆 Bônus de Velocidade +10%</p>
          <p className="text-xs mt-1">
            Concluiu o serviço <strong>no mesmo dia</strong> do aceite? A Clickmont adiciona
            um bônus de <strong>10%</strong> sobre o valor da montagem, pago pela plataforma!
          </p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left">
          <p className="text-xs font-bold text-foreground">🔥 Taxa Zero em Urgências</p>
          <p className="text-xs mt-1">
            Pedidos marcados como <strong>URGENTE</strong> não têm taxa da plataforma.
            Você recebe <strong>100%</strong> do valor do seu lance!
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Nos demais serviços, a taxa é de apenas 10%.
        </p>
      </div>
    </OnboardingSlide>,

    // Slide 3
    <OnboardingSlide
      key="3"
      icon={<Wallet className="h-10 w-10 text-primary" />}
      title="Sua Carteira 💰"
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-left space-y-2">
          <p className="text-xs font-bold text-foreground">Montagem ou Desmontagem</p>
          <p className="text-xs">100% do valor líquido liberado após confirmação do cliente.</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-left space-y-2">
          <p className="text-xs font-bold text-foreground">Mudança (Des + Mont)</p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg bg-primary/10 p-2 text-center">
              <p className="text-lg font-bold text-primary">40%</p>
              <p className="text-[10px]">após desmontagem</p>
            </div>
            <div className="flex-1 rounded-lg bg-primary/10 p-2 text-center">
              <p className="text-lg font-bold text-primary">60%</p>
              <p className="text-[10px]">após montagem</p>
            </div>
          </div>
        </div>
        <p className="text-xs">
          Cadastre sua <strong>Chave PIX</strong> na Carteira para receber saques diretamente na sua conta.
        </p>
      </div>
    </OnboardingSlide>,
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div className="p-6 min-h-[380px] flex items-center justify-center">
          {slides[step]}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 pt-0">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < slides.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Próximo <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinish} className="gradient-primary text-primary-foreground px-6">
              Começar a Trabalhar 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MontadorOnboarding;
