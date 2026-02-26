import { useNavigate } from "react-router-dom";
import { Shield, Zap, Star, ArrowRight, Lock, UserCheck, Hash, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import logoClickmont from "@/assets/logo-clickmont.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar - Logo aumentada */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <img src={logoClickmont} alt="Clickmont" className="h-12 md:h-16 w-auto" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/quem-somos")}>
              Quem Somos
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/sou-montador")}>
              Sou Montador
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero - sem foco em Campinas, preparado para escala nacional */}
      <section className="relative overflow-hidden px-4 py-24 md:py-36 bg-cover bg-center"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1581244276891-83393a67d251?q=80&w=2000)` }}
      >
        {/* Overlay para deixar texto legível */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/70 via-background/80 to-background/95" />
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative mx-auto max-w-4xl text-center z-10"
        >
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
          >
            Montagem de móveis profissional,{" "}
            <span className="text-gradient text-orange-400">simples e segura.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Especialistas em guarda-roupas, painéis de TV e armários de cozinha. 
            Atendemos todo o Brasil, com lançamento piloto em Campinas/SP.
            Pagamento protegido e nosso código de segurança exclusivo de 4 dígitos.
          </motion.p>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="h-14 gap-2 px-10 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl animate-pulse"
              onClick={() => navigate("/auth?role=cliente")}
            >
              🚀 SOLICITAR MONTADOR AGORA
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 gap-2 px-8 text-base font-semibold"
              onClick={() => navigate("/sou-montador")}
            >
              Quero ser Parceiro
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* 🖼️ GALERIA DE SERVIÇOS */}
      <section className="px-4 py-16 bg-orange-50/50 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-center text-2xl font-bold mb-10">Serviços que realizamos</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <img 
              src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"
              alt="Montagem de Guarda-Roupa"
              className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 object-cover h-64 w-full"
            />
            <img 
              src="https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?q=80&w=800"
              alt="Instalação de Painel de TV"
              className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 object-cover h-64 w-full"
            />
            <img 
              src="https://images.unsplash.com/photo-1556912177-450034b7566d?q=80&w=800"
              alt="Montagem de Armário de Cozinha"
              className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 object-cover h-64 w-full"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-3xl font-bold md:text-4xl">
              Por que escolher a Clickmont?
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Tecnologia a favor da sua tranquilidade
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="mt-14 grid gap-8 md:grid-cols-3"
          >
            {[
              {
                icon: Shield,
                title: "Segurança Total",
                desc: "Pagamento garantido e sistema de código de segurança para autorizar o início do serviço.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: Zap,
                title: "Agilidade",
                desc: "Receba lances de profissionais verificados em poucos minutos.",
                color: "text-warning",
                bg: "bg-warning/10",
              },
              {
                icon: Star,
                title: "Qualidade",
                desc: "Montadores avaliados pela comunidade e histórico de serviços transparente.",
                color: "text-success",
                bg: "bg-success/10",
              },
            ].map((b) => (
              <motion.div key={b.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card className="border-border bg-background transition-shadow hover:shadow-lg h-full">
                  <CardContent className="flex flex-col items-start gap-4 p-8">
                    <div className={`rounded-xl p-3 ${b.bg}`}>
                      <b.icon className={`h-7 w-7 ${b.color}`} />
                    </div>
                    <h3 className="text-xl font-bold">{b.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-3xl font-bold md:text-4xl">
              Como Funciona
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Três passos para uma montagem sem dor de cabeça
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="mt-14 grid gap-10 md:grid-cols-3"
          >
            {[
              {
                step: "1",
                title: "Solicite",
                desc: "Descreva o serviço, envie fotos do móvel e receba lances de montadores da sua cidade.",
              },
              {
                step: "2",
                title: "Compare",
                desc: "Avalie perfis, valores e mensagens dos profissionais. Escolha o melhor para você.",
              },
              {
                step: "3",
                title: "Agende",
                desc: "Confirme o serviço, receba o código de segurança e acompanhe tudo pelo chat em tempo real.",
              },
            ].map((s) => (
              <motion.div key={s.step} variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground text-2xl font-black shadow-lg">
                  {s.step}
                </div>
                <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security highlight */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Lock className="h-4 w-4" />
              Protocolo de Identificação
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">
              Segurança em cada etapa
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Antes de iniciar o serviço, o montador se identifica pelo app e
              confirma presença. O cliente então compartilha o código de 4
              dígitos exclusivo — só após a validação o serviço começa.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.15 }} className="flex flex-1 justify-center">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: UserCheck, label: "Foto no perfil" },
                { icon: Hash, label: "Código de 4 dígitos" },
                { icon: Shield, label: "Pagamento protegido" },
                { icon: MessageCircle, label: "Chat em tempo real" },
              ].map((f) => (
                <motion.div
                  key={f.label}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6 text-center shadow-sm"
                >
                  <f.icon className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA final */}
      <section className="px-4 py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl rounded-3xl gradient-primary p-10 text-center text-primary-foreground shadow-2xl md:p-16"
        >
          <h2 className="text-3xl font-bold md:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80 text-lg">
            Crie sua conta gratuita e solicite uma montagem em poucos minutos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="h-13 gap-2 px-8 text-base font-semibold"
              onClick={() => navigate("/auth?role=cliente")}
            >
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-13 gap-2 px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => navigate("/sou-montador")}
            >
              Sou Montador
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-border bg-card px-4 py-10"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 md:flex-row md:justify-between">
          <img src={logoClickmont} alt="Clickmont" className="h-10 opacity-70 w-auto" />
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <a href="/termos-e-privacidade" className="hover:text-foreground transition-colors">
              Termos de Uso
            </a>
            <span className="text-border">·</span>
            <a href="/termos-e-privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </a>
            <span className="text-border">·</span>
            <a href="/quem-somos" className="hover:text-foreground transition-colors">
              Quem Somos
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Clickmont. Todos os direitos reservados.
          </p>
        </div>
      </motion.footer>

      {/* WhatsApp Float */}
      <motion.a
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        href="https://api.whatsapp.com/send?phone=551151280116"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg transition-transform hover:scale-110"
        aria-label="Fale conosco no WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </motion.a>
    </div>
  );
};

export default LandingPage;
