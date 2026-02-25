import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import PedirMontagem from "./PedirMontagem";

const PedirMontagemPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" />;

  return (
    <AppLayout>
      <PedirMontagem />
    </AppLayout>
  );
};

export default PedirMontagemPage;
