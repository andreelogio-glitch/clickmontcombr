import { useNavigate } from "react-router-dom";
import { Shield, Zap, Star, ArrowRight, Lock, UserCheck, Hash, MessageCircle, Users, Wrench, CreditCard, CheckCircle, Scale, AlertTriangle, Building2, Target, DollarSign, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import logoClickmont from "@/assets/logo-clickmont.png";
import heroQuarto from "@/assets/hero-quarto.jpg";
import galeriaQuarto from "@/assets/galeria-quarto.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <img src={logoClickmont} alt="ClickMont" className="h-14 md:h-20 w-auto" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/quem-somos")}>Quem Somos</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/institucional")}>Institucional</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/sou-montador")}>Sou Montador</Button>
            <Button size="sm" onClick={() => navigate("/auth")}>Entrar</Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-36 bg-cover bg-center"
      style={{ backgroundImage: `url(${heroQuarto})` }}>

        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/70 via-background/80 to-background/95" />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative mx-auto max-w-4xl text-center z-10">
          <motion.h1 variants={fadeUp} transition={{ duration: 0.6 }} className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Montagem de móveis profissional,{" "}
            <span className="text-gradient text-orange-400">simples e segura.</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Plataforma digital de intermediação que conecta clientes a montadores profissionais independentes.
            Pagamento protegido e código de segurança exclusivo de 4 dígitos.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 gap-2 px-10 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl animate-pulse" onClick={() => navigate("/auth?role=cliente")}>
              🚀 SOLICITAR MONTADOR AGORA <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-13 gap-2 px-8 text-base font-semibold" onClick={() => navigate("/sou-montador")}>
              Quero ser Parceiro
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* O que é o ClickMont */}
      <section className="px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="mx-auto max-w-4xl text-center">
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-3xl font-bold md:text-4xl">O que é o ClickMont</motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed">
            O ClickMont é uma <strong className="text-foreground">plataforma digital brasileira de intermediação de serviços</strong> que conecta
            clientes que precisam de montagem de móveis a montadores profissionais independentes. Atuamos como uma ponte segura entre as duas partes,
            facilitando a contratação com transparência e proteção para todos os envolvidos.
          </motion.p>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A plataforma não oferece empregos, não garante renda e não atua como prestador direto do serviço —
            funcionando exclusivamente como <strong className="text-foreground">intermediador tecnológico</strong>.
          </motion.p>
        </motion.div>
      </section>

      {/* Galeria de Serviços */}
      <section className="px-4 py-16 bg-orange-50/50 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-center text-2xl font-bold mb-10">Serviços que realizamos</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <img alt="Montagem de Guarda-Roupa" className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 object-cover h-64 w-full" src="/lovable-uploads/db9f1ef9-081b-4cd0-81f4-977e3f9d2eff.png" />
            <img alt="Instalação de Painel de TV" className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 object-cover h-64 w-full" src="/lovable-uploads/b253cbb0-a685-4261-9ce5-a3f3c2d764d2.png" />
            <img src={galeriaQuarto} alt="Quarto planejado com guarda-roupa e montagem profissional" className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 object-cover h-64 w-full" />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-3xl font-bold md:text-4xl">Por que escolher a ClickMont?</motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">Tecnologia a favor da sua tranquilidade</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="mt-14 grid gap-8 md:grid-cols-3">
            {[
            { icon: Shield, title: "Segurança Total", desc: "Pagamento garantido e sistema de código de segurança para autorizar o início do serviço.", color: "text-primary", bg: "bg-primary/10" },
            { icon: Zap, title: "Agilidade", desc: "Receba lances de profissionais verificados em poucos minutos.", color: "text-warning", bg: "bg-warning/10" },
            { icon: Star, title: "Qualidade", desc: "Montadores avaliados pela comunidade e histórico de serviços transparente.", color: "text-success", bg: "bg-success/10" }].
            map((b) =>
            <motion.div key={b.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card className="border-border bg-background transition-shadow hover:shadow-lg h-full">
                  <CardContent className="flex flex-col items-start gap-4 p-8">
                    <div className={`rounded-xl p-3 ${b.bg}`}><b.icon className={`h-7 w-7 ${b.color}`} /></div>
                    <h3 className="text-xl font-bold">{b.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-3xl font-bold md:text-4xl">Como Funciona</motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">O fluxo completo de intermediação</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="mt-14 space-y-4">
            {[
            { icon: FileText, step: "1", title: "Cliente solicita o serviço", desc: "Descreva o móvel, envie fotos e indique cidade e data desejada." },
            { icon: Users, step: "2", title: "Montador aceita a demanda", desc: "Profissionais verificados da região enviam propostas com valor e prazo." },
            { icon: MessageCircle, step: "3", title: "Comunicação via chat interno", desc: "Toda a comunicação ocorre dentro da plataforma, sem exposição de dados pessoais." },
            { icon: Eye, step: "4", title: "Plataforma acompanha o processo", desc: "A ClickMont monitora o andamento com código de segurança e confirmação de etapas." },
            { icon: CreditCard, step: "5", title: "Pagamento no ambiente seguro", desc: "O valor fica custodiado até a confirmação da conclusão do serviço pelo cliente." },
            { icon: DollarSign, step: "6", title: "Pagamento garantido", desc: "Montador recebe o valor automaticamente após a confirmação do serviço pelo cliente." }].
            map((s) =>
            <motion.div key={s.step} variants={fadeUp} transition={{ duration: 0.4 }}>
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground text-sm font-black shrink-0">{s.step}</div>
                    <div>
                      <h3 className="font-bold">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Security */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row">
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Lock className="h-4 w-4" /> Protocolo de Segurança
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">Segurança em cada etapa</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Chat interno protegido sem necessidade de compartilhar número pessoal. Pagamento custodiado no ambiente seguro.
              Código de 4 dígitos exclusivo valida a identidade do montador antes do início do serviço.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.15 }} className="flex flex-1 justify-center">
            <div className="grid grid-cols-2 gap-4">
              {[
              { icon: UserCheck, label: "Verificação de identidade" },
              { icon: Hash, label: "Código de 4 dígitos" },
              { icon: Shield, label: "Pagamento custodiado" },
              { icon: MessageCircle, label: "Chat interno protegido" }].
              map((f) =>
              <motion.div key={f.label} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6 text-center shadow-sm">
                  <f.icon className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium">{f.label}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Encontre Montadores */}
      <section className="px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="mx-auto max-w-3xl text-center">
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-3xl font-bold md:text-4xl">Encontre Montadores Profissionais</motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Receba propostas de profissionais verificados da sua região em poucos minutos.
            Compare valores, avalie perfis e contrate com a segurança do pagamento custodiado pela plataforma.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-8">
            <Button size="lg" className="h-14 gap-2 px-10 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl" onClick={() => navigate("/auth?role=cliente")}>
              Solicitar Montador <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Para Clientes / Para Montadores */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid gap-8 md:grid-cols-2">
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Card className="h-full border-primary/20">
                <CardContent className="p-8 space-y-4">
                  <div className="rounded-xl bg-primary/10 p-3 w-fit"><Users className="h-7 w-7 text-primary" /></div>
                  <h3 className="text-2xl font-bold">Para Clientes</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Encontre profissionais de montagem de forma rápida e segura. Descreva o serviço, receba propostas de montadores
                    verificados da sua região e acompanhe todo o processo pelo ambiente protegido.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Propostas de profissionais verificados</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Pagamento custodiado até a aprovação</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Chat interno sem exposição de dados</li>
                  </ul>
                  <Button className="mt-2 gap-2" onClick={() => navigate("/auth?role=cliente")}>Solicitar Serviço <ArrowRight className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Card className="h-full border-border">
                <CardContent className="p-8 space-y-4">
                  <div className="rounded-xl bg-accent p-3 w-fit"><Wrench className="h-7 w-7 text-accent-foreground" /></div>
                  <h3 className="text-2xl font-bold">Para Montadores</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Acesse oportunidades de serviço na sua região sem vínculo empregatício. Cadastre-se, passe pelo processo de verificação
                    e comece a receber demandas de clientes.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground shrink-0" /> Sem vínculo empregatício</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground shrink-0" /> Demandas da sua região</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground shrink-0" /> Pagamento garantido pela plataforma</li>
                  </ul>
                  <Button variant="outline" className="mt-2 gap-2" onClick={() => navigate("/sou-montador")}>Quero ser Parceiro <ArrowRight className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Transparência */}
      <section className="px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="mx-auto max-w-3xl">
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-3xl font-bold md:text-4xl">Transparência</motion.h2>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-8">
            <Card className="border-warning/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-bold">Informações Importantes</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-3"><Scale className="h-5 w-5 shrink-0 mt-0.5" /><span>O ClickMont <strong className="text-foreground">não garante volume de serviços</strong> nem frequência de demandas para montadores.</span></li>
                  <li className="flex items-start gap-3"><Scale className="h-5 w-5 shrink-0 mt-0.5" /><span>A plataforma <strong className="text-foreground">não promete renda</strong> e não constitui oferta de emprego.</span></li>
                  <li className="flex items-start gap-3"><Scale className="h-5 w-5 shrink-0 mt-0.5" /><span>Não existe vínculo empregatício entre a plataforma e os montadores cadastrados.</span></li>
                  <li className="flex items-start gap-3"><Scale className="h-5 w-5 shrink-0 mt-0.5" /><span>O ClickMont atua <strong className="text-foreground">exclusivamente como intermediador tecnológico</strong>.</span></li>
                  <li className="flex items-start gap-3"><Scale className="h-5 w-5 shrink-0 mt-0.5" /><span>O valor final é <strong className="text-foreground">sempre exibido antes da confirmação</strong> do pagamento.</span></li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} transition={{ duration: 0.7 }} className="mx-auto max-w-3xl rounded-3xl gradient-primary p-10 text-center text-primary-foreground shadow-2xl md:p-16">
          <h2 className="text-3xl font-bold md:text-4xl">Pronto para começar?</h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80 text-lg">Crie sua conta gratuita e solicite uma montagem em poucos minutos.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="h-13 gap-2 px-8 text-base font-semibold" onClick={() => navigate("/auth?role=cliente")}>Começar Agora <ArrowRight className="h-5 w-5" /></Button>
            <Button size="lg" variant="ghost" className="h-13 gap-2 px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => navigate("/sou-montador")}>Sou Montador</Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="border-t border-border bg-card px-4 py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <img src={logoClickmont} alt="ClickMont" className="h-12 md:h-14 opacity-70 w-auto" />
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <button onClick={() => navigate("/institucional")} className="hover:text-foreground transition-colors">Institucional</button>
              <span className="text-border">·</span>
              <button onClick={() => navigate("/termos-e-privacidade")} className="hover:text-foreground transition-colors">Termos de Uso</button>
              <span className="text-border">·</span>
              <button onClick={() => navigate("/termos-e-privacidade")} className="hover:text-foreground transition-colors">Privacidade</button>
              <span className="text-border">·</span>
              <button onClick={() => navigate("/quem-somos")} className="hover:text-foreground transition-colors">Quem Somos</button>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Building2 className="h-3 w-3" /> Operado por <strong>André Ramos dos Santos</strong> · CNPJ: 61.774.392/0001-30 · São Paulo – SP, Brasil
            </p>
            <p className="text-xs text-muted-foreground">
              contato@clickmont.com.br · <a href="https://wa.me/551151280116" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp</a>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Missão: Facilitar a conexão entre clientes e prestadores de serviços de montagem de móveis de forma segura, transparente e eficiente.
            </p>
            <p className="text-xs text-muted-foreground mt-2">© {new Date().getFullYear()} ClickMont. Todos os direitos reservados.</p>
          </div>
        </div>
      </motion.footer>

      {/* WhatsApp Float */}
      <motion.a initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }} href="https://wa.me/551151280116" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg transition-transform hover:scale-110" aria-label="Fale conosco no WhatsApp">
        <MessageCircle className="h-7 w-7" />
      </motion.a>
    </div>);

};

export default LandingPage;