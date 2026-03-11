import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, LayoutDashboard, LogOut, AlertTriangle, Wallet, Info, Wrench, HelpCircle, Menu, X, FileText } from "lucide-react";
import { NotificationBell, PushPermissionBanner, useNotifications } from "@/components/Notifications";
import logoClickmont from "@/assets/logo-clickmont.png";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoClickmont} alt="Clickmont" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-lg font-bold text-gradient">Clickmont</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {profile?.role === "cliente" && (
              <>
                <Link to="/"><Button variant={isActive("/") ? "default" : "ghost"} size="sm"><Home className="h-4 w-4 mr-1" /> Início</Button></Link>
                <Link to="/pedir-montagem"><Button variant={isActive("/pedir-montagem") ? "default" : "ghost"} size="sm"><PlusCircle className="h-4 w-4 mr-1" /> Pedir</Button></Link>
              </>
            )}
            {profile?.role === "montador" && (
              <>
                <Link to="/montador"><Button variant={isActive("/montador") ? "default" : "ghost"} size="sm"><LayoutDashboard className="h-4 w-4 mr-1" /> Mural</Button></Link>
                <Link to="/carteira"><Button variant={isActive("/carteira") ? "default" : "ghost"} size="sm"><Wallet className="h-4 w-4 mr-1" /> Carteira</Button></Link>
                <Link to="/suporte-montador"><Button variant={isActive("/suporte-montador") ? "default" : "ghost"} size="sm"><HelpCircle className="h-4 w-4 mr-1" /> Suporte</Button></Link>
              </>
            )}
            <Link to="/assistencia"><Button variant={isActive("/assistencia") ? "default" : "ghost"} size="sm"><AlertTriangle className="h-4 w-4 mr-1" /> Ajuda</Button></Link>
            {profile?.role !== "montador" && (
              <Link to="/sou-montador"><Button variant={isActive("/sou-montador") ? "default" : "ghost"} size="sm"><Wrench className="h-4 w-4 mr-1" /> Sou Montador</Button></Link>
            )}
            <Link to="/quem-somos"><Button variant={isActive("/quem-somos") ? "default" : "ghost"} size="sm"><Info className="h-4 w-4 mr-1" /> Sobre</Button></Link>
            <NotificationBell unreadCount={unreadCount} onClick={() => setShowNotifs(!showNotifs)} />
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-1" /> Sair</Button>
          </nav>

          {/* Mobile nav controls */}
          <div className="flex md:hidden items-center gap-1">
            <NotificationBell unreadCount={unreadCount} onClick={() => setShowNotifs(!showNotifs)} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Notification dropdown */}
          {showNotifs && (
            <div className="absolute right-4 top-16 z-50 w-80 max-h-96 overflow-y-auto rounded-xl border bg-card shadow-xl animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between p-3 border-b">
                <p className="text-sm font-semibold">Notificações</p>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b last:border-0 cursor-pointer hover:bg-accent/50 transition-colors ${!n.read ? "bg-accent/20" : ""}`}
                    onClick={() => { markAsRead(n.id); setShowNotifs(false); }}
                  >
                    <p className="text-xs font-semibold text-foreground">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card animate-in slide-in-from-top-1">
            <nav className="container py-3 flex flex-col gap-1">
              {profile?.role === "cliente" && (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive("/") ? "default" : "ghost"} size="sm" className="w-full justify-start"><Home className="h-4 w-4 mr-2" /> Início</Button>
                  </Link>
                  <Link to="/pedir-montagem" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive("/pedir-montagem") ? "default" : "ghost"} size="sm" className="w-full justify-start"><PlusCircle className="h-4 w-4 mr-2" /> Pedir Montagem</Button>
                  </Link>
                </>
              )}
              {profile?.role === "montador" && (
                <>
                  <Link to="/montador" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive("/montador") ? "default" : "ghost"} size="sm" className="w-full justify-start"><LayoutDashboard className="h-4 w-4 mr-2" /> Mural</Button>
                  </Link>
                  <Link to="/carteira" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive("/carteira") ? "default" : "ghost"} size="sm" className="w-full justify-start"><Wallet className="h-4 w-4 mr-2" /> Carteira</Button>
                  </Link>
                  <Link to="/suporte-montador" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive("/suporte-montador") ? "default" : "ghost"} size="sm" className="w-full justify-start"><HelpCircle className="h-4 w-4 mr-2" /> Suporte ao Montador</Button>
                  </Link>
                </>
              )}
              <Link to="/assistencia" onClick={() => setMobileMenuOpen(false)}>
                <Button variant={isActive("/assistencia") ? "default" : "ghost"} size="sm" className="w-full justify-start"><AlertTriangle className="h-4 w-4 mr-2" /> Ajuda</Button>
              </Link>
              {profile?.role !== "montador" && (
                <Link to="/sou-montador" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive("/sou-montador") ? "default" : "ghost"} size="sm" className="w-full justify-start"><Wrench className="h-4 w-4 mr-2" /> Sou Montador</Button>
                </Link>
              )}
              <Link to="/quem-somos" onClick={() => setMobileMenuOpen(false)}>
                <Button variant={isActive("/quem-somos") ? "default" : "ghost"} size="sm" className="w-full justify-start"><Info className="h-4 w-4 mr-2" /> Sobre</Button>
              </Link>
              <div className="border-t border-border mt-1 pt-1">
                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <PushPermissionBanner />
      <main className="container py-6" onClick={() => showNotifs && setShowNotifs(false)}>{children}</main>

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/551151280116"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] shadow-lg hover:bg-[hsl(142,70%,38%)] transition-colors"
        aria-label="Fale conosco no WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Footer with Montador banner */}
      <footer className="border-t border-border py-6">
        <div className="container space-y-4">
          {/* Montador recruitment banner */}
          {profile?.role !== "montador" && (
            <div className="rounded-xl gradient-primary p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-primary-foreground">
                <Wrench className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-bold text-sm">É montador profissional?</p>
                  <p className="text-xs opacity-90">Cadastre-se e ganhe dinheiro com montagens e mudanças!</p>
                </div>
              </div>
              <Link to="/sou-montador">
                <Button variant="secondary" size="sm" className="shrink-0">
                  Sou Montador →
                </Button>
              </Link>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <img src={logoClickmont} alt="Clickmont" className="h-5 w-5" />
              <span>© {new Date().getFullYear()} ClickMont</span>
            </div>
            <p>CNPJ: 61.774.392/0001-30 · contato@clickmont.com.br</p>
          </div>
          <p className="text-center text-[11px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            🔒 Sua segurança é nossa prioridade. Todos os pagamentos na ClickMont são realizados através do Mercado Pago, garantindo proteção total dos seus dados e a custódia do seu dinheiro até a conclusão do serviço.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
