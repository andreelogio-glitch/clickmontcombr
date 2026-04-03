import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Validação profunda com Supabase client-side verify (Mitigação sugerida por Samuel Segurança)
    const verifyDeepSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && user) {
        console.error("Conflito de estado: Usuário logado no state mas sem sessão válida no backend. Forçando logout.");
        window.location.href = "/auth";
      }
    };
    if (user && profile) verifyDeepSession();
  }, [user, profile]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (profile.role === "montador") {
      return <Navigate to="/dashboard/montador" replace />;
    }
    return <Navigate to="/dashboard/cliente" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
