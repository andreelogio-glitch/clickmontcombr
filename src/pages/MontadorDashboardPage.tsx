import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DashboardMontador from "./DashboardMontador";

const MontadorDashboardPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Wait for profile to load
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Only montadores can access this page
  if (profile.role !== "montador") return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <DashboardMontador />
    </AppLayout>
  );
};

export default MontadorDashboardPage;
