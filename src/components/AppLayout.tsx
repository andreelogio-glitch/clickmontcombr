import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, LayoutDashboard, LogOut, AlertTriangle, Shield, Wallet, Info, DollarSign } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import logoClickmont from "@/assets/logo-clickmont.png";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { profile, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoClickmont} alt="Clickmont" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-lg font-bold text-gradient">Clickmont</span>
          </Link>

          <nav className="flex items-center gap-1">
            {profile?.role === "cliente" && (
              <>
                <Link to="/">
                  <Button variant={isActive("/") ? "default" : "ghost"} size="sm">
                    <Home className="h-4 w-4 mr-1" /> Início
                  </Button>
                </Link>
                <Link to="/pedir-montagem">
                  <Button variant={isActive("/pedir-montagem") ? "default" : "ghost"} size="sm">
                    <PlusCircle className="h-4 w-4 mr-1" /> Pedir
                  </Button>
                </Link>
              </>
            )}
            {profile?.role === "montador" && (
              <>
                <Link to="/">
                  <Button variant={isActive("/") ? "default" : "ghost"} size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-1" /> Pedidos
                  </Button>
                </Link>
                <Link to="/carteira">
                  <Button variant={isActive("/carteira") ? "default" : "ghost"} size="sm">
                    <Wallet className="h-4 w-4 mr-1" /> Carteira
                  </Button>
                </Link>
              </>
            )}
            <Link to="/assistencia">
              <Button variant={isActive("/assistencia") ? "default" : "ghost"} size="sm">
                <AlertTriangle className="h-4 w-4 mr-1" /> Ajuda
              </Button>
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin">
                  <Button variant={isActive("/admin") ? "default" : "ghost"} size="sm">
                    <Shield className="h-4 w-4 mr-1" /> Admin
                  </Button>
                </Link>
              </>
            )}
            <Link to="/quem-somos">
              <Button variant={isActive("/quem-somos") ? "default" : "ghost"} size="sm">
                <Info className="h-4 w-4 mr-1" /> Sobre
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </nav>
        </div>
      </header>

      <main className="container py-6">{children}</main>

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

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <img src={logoClickmont} alt="Clickmont" className="h-5 w-5" />
            <span>© {new Date().getFullYear()} Clickmont</span>
          </div>
          <p className="text-center text-[11px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            🔒 Sua segurança é nossa prioridade. Todos os pagamentos na Clickmont são realizados através do Mercado Pago, garantindo proteção total dos seus dados e a custódia do seu dinheiro até a conclusão do serviço.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
