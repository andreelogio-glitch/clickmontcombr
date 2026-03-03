import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ClienteHome from "./ClienteHome";
import DashboardMontador from "./DashboardMontador";
import LandingPage from "./LandingPage";
import MontadorPendingApproval from "@/components/MontadorPendingApproval";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <LandingPage />;

  if (adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAdmin) return <Navigate to="/admin" replace />;

  // Wait for profile to load before deciding which view to show
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Block unapproved montadores
  if (profile.role === "montador" && !profile.is_approved) {
    return (
      <AppLayout>
        <MontadorPendingApproval />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {profile.role === "montador" ? <DashboardMontador /> : <ClienteHome />}
    </AppLayout>
  );
};

export default Index;
