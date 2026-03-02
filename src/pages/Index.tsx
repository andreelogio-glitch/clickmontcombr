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

  // Brief spinner only while auth bootstraps (max 3s)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // No session at all → landing
  if (!user) return <LandingPage />;

  // Admin redirect (non-blocking: if still loading admin check, skip it)
  if (!adminLoading && isAdmin) return <Navigate to="/admin" replace />;

  // If profile exists, route by role; otherwise show ClienteHome as fallback
  const role = profile?.role;

  if (role === "montador" && profile?.is_approved) {
    return <AppLayout><DashboardMontador /></AppLayout>;
  }

  if (role === "montador" && !profile?.is_approved) {
    return <AppLayout><MontadorPendingApproval /></AppLayout>;
  }

  // Default: show cliente home (even if profile is null — no blocking)
  return <AppLayout><ClienteHome /></AppLayout>;
};

export default Index;
