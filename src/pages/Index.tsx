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

  // While loading, show nothing (avoid flashing LandingPage for logged-in users)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // No session → landing page
  if (!user) return <LandingPage />;

  // Admin redirect
  if (!adminLoading && isAdmin) return <Navigate to="/admin" replace />;

  // Profile not loaded yet but user exists → simple spinner (won't hang due to 2s timeout)
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Unapproved montador
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
