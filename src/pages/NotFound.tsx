import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      {user && (
        <div className="flex justify-end p-4">
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-1" /> Sair</Button>
        </div>
      )}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Voltar ao Início
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
