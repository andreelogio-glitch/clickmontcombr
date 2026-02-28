import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, MessageCircle, ArrowRight, Users, Wrench, CreditCard,
  CheckCircle, Building2, Target, Eye, Scale, Lock, Hash,
  UserCheck, FileText, AlertTriangle, Handshake
} from "lucide-react";
import logoClickmont from "@/assets/logo-clickmont.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const FLOW_STEPS = [
  { icon: FileText, title: "1. Cliente solicita serviço", desc: "O cliente descreve o móvel, envia fotos e indica a cidade e data desejada." },
  { icon: Users, title: "2. Montador aceita a demanda", desc: "Profissionais verificados da região enviam propostas com valor e prazo." },
  { icon: MessageCircle, title: "3. Chat interno protegido", desc: "Toda a comunicação ocorre dentro da plataforma, sem exposição de dados pessoais." },
  { icon: Eye, title: "4. Plataforma acompanha", desc: "A ClickMont monitora o andamento com código de segurança e confirmação de etapas." },
  { icon: CreditCard, title: "5. Pagamento seguro", desc: "O valor fica custodiado até a confirmação da conclusão do serviço pelo cliente." },
];

const SECURITY_ITEMS = [
  { icon: Lock, title: "Chat interno protegido", desc: "Conversas criptografadas dentro do ambiente da plataforma, sem necessidade de compartilhar telefone." },
  { icon: Shield, title: "Intermediação digital", desc: "A ClickMont atua como custódia temporária dos pagamentos, protegendo ambas as partes." },
  { icon: Hash, title: "Código de segurança", desc: "Código exclusivo de 4 dígitos valida a identidade do montador antes do início do serviço." },
  { icon: UserCheck, title: "Verificação de identidade", desc: "Montadores passam por processo de aprovação com selfie, documento e comprovação de experiência." },
];

const Institucional = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src={logoClickmont} alt="ClickMont" className="h-10 md:h-14 w-auto" />
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/quem-somos")}>Quem Somos</Button>
            <Button size="sm" onClick={() => navigate("/auth")}>Entrar</Button>
          </div>
        </div>
      </nav>

      {/* Hero — O que é o ClickMont */}
      <section className="px-4 py-20 md:py-28">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="mx-auto max-w-4xl text-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
            <Handshake className="h-4 w-4" /> Plataforma de Intermediação
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.6 }} className="text-3xl font-extrabold leading-tight md:text-5xl">
            O que é o <span className="text-gradient">ClickMont</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed">
            O ClickMont é uma <strong className="text-foreground">plataforma digital brasileira de intermediação de serviços</strong> que conecta
            clientes que precisam de montagem de móveis a montadores profissionais independentes.
            Atuamos como uma ponte segura entre as duas partes, facilitando a contratação com
            transparência e proteção para todos os envolvidos.
          </motion.p>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            A plataforma não oferece empregos, não garante renda e não atua como prestador direto do serviço — 
            funcionando exclusivamente como <strong className="text-foreground">intermediador tecnológico</strong>.
          </motion.p>
        </motion.div>
      </section>

      {/* Como Funciona */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-3xl font-bold md:text-4xl">
              Como Funciona
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              O fluxo completo de intermediação, do pedido à conclusão
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="mt-14 space-y-6">
            {FLOW_STEPS.map((step, i) => (
              <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4 }}>
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{step.title}</h3>
                      <p className="text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Segurança */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-3xl font-bold md:text-4xl">
              Segurança
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Estrutura de proteção para clientes e profissionais
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="mt-14 grid gap-6 md:grid-cols-2">
            {SECURITY_ITEMS.map((item, i) => (
              <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4 }}>
                <Card className="h-full border-border">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modelo Operacional */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="mx-auto max-w-3xl text-center">
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-3xl font-bold md:text-4xl">
            Modelo Operacional
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-6 text-muted-foreground leading-relaxed text-lg">
            A plataforma aplica uma <strong className="text-foreground">taxa operacional entre 20% e 30%</strong> (padrão de 25%) sobre o valor do serviço,
            cobrindo: tecnologia, intermediação, suporte, segurança da transação e manutenção da plataforma.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-6">
            <Card className="border-primary/20 mx-auto max-w-md">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-center flex items-center justify-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Exemplo de Split</h3>
                <div className="bg-accent/30 rounded-xl p-4 space-y-2 text-sm">
                  <p className="flex justify-between"><span>Valor do serviço:</span><strong>R$ 100,00</strong></p>
                  <p className="flex justify-between"><span>Taxa operacional (25%):</span><strong>R$ 25,00</strong></p>
                  <div className="border-t border-border pt-2">
                    <p className="flex justify-between font-bold"><span>Montador recebe:</span><span className="text-primary">R$ 75,00</span></p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">A taxa é exibida de forma transparente antes da confirmação do pagamento.</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Para Clientes / Para Montadores */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid gap-8 md:grid-cols-2">
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Card className="h-full border-primary/20">
                <CardContent className="p-8 space-y-4">
                  <div className="rounded-xl bg-primary/10 p-3 w-fit">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Para Clientes</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Encontre profissionais de montagem de forma rápida e segura. Descreva o serviço necessário, 
                    receba propostas de montadores verificados da sua região e acompanhe todo o processo pelo 
                    ambiente protegido da plataforma.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Propostas de profissionais verificados</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Pagamento custodiado até a aprovação</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Chat interno sem exposição de dados</li>
                  </ul>
                  <Button className="mt-2 gap-2" onClick={() => navigate("/auth?role=cliente")}>
                    Solicitar Serviço <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Card className="h-full border-border">
                <CardContent className="p-8 space-y-4">
                  <div className="rounded-xl bg-accent p-3 w-fit">
                    <Wrench className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">Para Montadores</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Acesse oportunidades de serviço na sua região sem vínculo empregatício. 
                    Cadastre-se, passe pelo processo de verificação e comece a receber demandas 
                    de clientes que precisam de montagem de móveis.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground shrink-0" /> Sem vínculo empregatício</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground shrink-0" /> Demandas da sua região</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground shrink-0" /> Pagamento garantido pela plataforma</li>
                  </ul>
                  <Button variant="outline" className="mt-2 gap-2" onClick={() => navigate("/sou-montador")}>
                    Quero ser Parceiro <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Transparência */}
      <section className="border-t border-border bg-card px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="mx-auto max-w-3xl">
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-3xl font-bold md:text-4xl">
            Transparência
          </motion.h2>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-8 space-y-4">
            <Card className="border-warning/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-bold">Informações Importantes</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>O ClickMont <strong className="text-foreground">não garante volume de serviços</strong> nem frequência de demandas para montadores.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>A plataforma <strong className="text-foreground">não promete renda</strong> e não constitui oferta de emprego.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Não existe vínculo empregatício entre a plataforma e os montadores cadastrados.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>O ClickMont atua <strong className="text-foreground">exclusivamente como intermediador tecnológico</strong>, facilitando a conexão entre as partes.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Identidade Institucional */}
      <section className="px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <img src={logoClickmont} alt="ClickMont" className="mx-auto h-20 w-20 object-contain mb-6" />
          </motion.div>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Operado por <strong className="text-foreground">André Ramos dos Santos</strong></span>
            </div>
            <p className="text-sm text-muted-foreground">CNPJ: 61.774.392/0001-30</p>
            <p className="text-sm text-muted-foreground">São Paulo – SP, Brasil</p>
          </motion.div>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-8">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Missão</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Facilitar a conexão entre clientes e prestadores de serviços de montagem de móveis 
                  de forma segura, transparente e eficiente.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <img src={logoClickmont} alt="ClickMont" className="h-10 opacity-70 w-auto" />
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <button onClick={() => navigate("/termos-e-privacidade")} className="hover:text-foreground transition-colors">Termos de Uso</button>
              <span className="text-border">·</span>
              <button onClick={() => navigate("/quem-somos")} className="hover:text-foreground transition-colors">Quem Somos</button>
              <span className="text-border">·</span>
              <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Início</button>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Operado por <strong>André Ramos dos Santos</strong> · CNPJ: 61.774.392/0001-30 · São Paulo – SP, Brasil</p>
            <p className="text-xs text-muted-foreground">contato@clickmont.com.br · <a href="https://wa.me/551151280116" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp</a></p>
            <p className="text-xs text-muted-foreground mt-2">© {new Date().getFullYear()} ClickMont. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Institucional;
