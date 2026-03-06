import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import PedirMontagem from "./PedirMontagem";

const PedirMontagemPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Wait for profile before checking role
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Block montadores from creating orders
  if (profile.role === "montador") return <Navigate to="/montador-dashboard" replace />;

  return (
    <AppLayout>
      <PedirMontagem />
    </AppLayout>
  );
};

export default PedirMontagemPage;
