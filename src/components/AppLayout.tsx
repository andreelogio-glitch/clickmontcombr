import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";
import logoClickmont from "@/assets/logo-clickmont.png";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { profile, signOut } = useAuth();
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
              <Link to="/dashboard">
                <Button variant={isActive("/dashboard") ? "default" : "ghost"} size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Pedidos
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </nav>
        </div>
      </header>

      <main className="container py-6">{children}</main>

      {/* Footer with small logo */}
      <footer className="border-t border-border py-4">
        <div className="container flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <img src={logoClickmont} alt="Clickmont" className="h-5 w-5" />
          <span>© {new Date().getFullYear()} Clickmont</span>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
