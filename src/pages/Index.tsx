import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";

const Index = () => {
  const { user, profile, loading } = useAuth();

  // Mostrar spinner apenas durante o carregamento inicial da sessao
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Usuario nao logado -> Landing Page (sem spinner infinito)
  if (!user) return <LandingPage />;

  // Usuario logado mas perfil ainda carregando -> spinner breve
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirecionar baseado no role do usuario
  if (profile.role === "admin") return <Navigate to="/admin" replace />;
  if (profile.role === "montador") return <Navigate to="/dashboard/montador" replace />;
  return <LandingPage />;
};

export default Index;
