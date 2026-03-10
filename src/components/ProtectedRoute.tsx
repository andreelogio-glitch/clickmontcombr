import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    if (profile.role === "montador") {
      return <Navigate to="/dashboard/montador" replace />;
    }
    return <Navigate to="/dashboard/cliente" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
