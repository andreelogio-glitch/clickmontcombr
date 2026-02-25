import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Wrench, Home, PlusCircle, LayoutDashboard, LogOut, MessageSquare } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-gradient">Clickmont</span> Pro
            </span>
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

      {/* Main */}
      <main className="container py-6">{children}</main>
    </div>
  );
};

export default AppLayout;
