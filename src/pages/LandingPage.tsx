import { useNavigate } from "react-router-dom";
import { Shield, Zap, Star, ArrowRight, Lock, UserCheck, Hash, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import logoClickmont from "@/assets/logo-clickmont.png";
// Importe as novas imagens
import montadorBg from "@/assets/images/montador-trabalhando.jpg";
import moveisSala from "@/assets/images/moveis-montados-sala.jpg";
import moveisQuarto from "@/assets/images/moveis-montados-quarto.jpg";

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
      {/* Navbar (sem mudança) */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <img src={logoClickmont} alt="Clickmont" className="h-9" />
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

      {/* Hero - com fundo de imagens sutis + botão principal em destaque */}
      <section 
        className="relative overflow-hidden px-4 py-24 md:py-36 bg-cover bg-center"
        style={{
          backgroundImage: `url(${montadorBg})`,
        }}
      >
        {/* Overlay gradiente + opacidade para imagem não roubar atenção */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/75 to-background/90" />
        
        {/* Imagens de móveis montados em posições decorativas (segundo plano) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
            src={moveisSala} 
            alt="Sala com móveis montados" 
            className="absolute bottom-10 left-10 w-64 md:w-96 rounded-xl shadow-2xl rotate-[-3deg] object-cover"
          />
          <img 
            src={moveisQuarto} 
            alt="Quarto com móveis montados" 
            className="absolute top-20 right-10 w-80 md:w-112 rounded-xl shadow-2xl rotate-[4deg] object-cover opacity-80"
          />
        </div>

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
            Sua montagem de móveis,{" "}
            <span className="text-gradient">simples e segura.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Conectamos você aos melhores montadores da sua região com pagamento
            protegido e garantia de serviço.
          </motion.p>

          {/* Botão principal em destaque - maior e central */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-12"
          >
            <Button
              size="xl"                    // tamanho maior (ajuste no seu Button se necessário)
              className="h-16 text-xl px-12 font-bold shadow-xl hover:shadow-2xl transition-all"
              onClick={() => navigate("/auth?role=cliente")}
            >
              Solicitar Montagem Agora
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </motion.div>

          {/* Botões secundários menores */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              variant="outline"
              className="h-13 gap-2 px-8 text-base font-semibold"
              onClick={() => navigate("/sou-montador")}
            >
              Quero ser Montador Parceiro
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-base"
              onClick={() => navigate("/quem-somos")}
            >
              Saiba Mais
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* O resto do código continua exatamente igual */}
      {/* Benefits */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        {/* ... seu código de benefits continua aqui sem mudança ... */}
      </section>

      {/* How it works */}
      <section className="px-4 py-20 md:py-28">
        {/* ... continua igual ... */}
      </section>

      {/* Security highlight */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        {/* ... igual ... */}
      </section>

      {/* CTA final */}
      <section className="px-4 py-20 md:py-28">
        {/* ... igual ... */}
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-border bg-card px-4 py-10"
      >
        {/* ... igual ... */}
      </motion.footer>

      {/* WhatsApp Float */}
      <motion.a
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        href="https://wa.me/551151280116"
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
