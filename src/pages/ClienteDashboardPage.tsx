import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ClienteHome from "./ClienteHome";

const ClienteDashboardPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading || (user && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.role === "montador") return <Navigate to="/dashboard/montador" replace />;

  return (
    <AppLayout>
      <ClienteHome />
    </AppLayout>
  );
};

export default ClienteDashboardPage;
