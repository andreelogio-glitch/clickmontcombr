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

  // Never block rendering — show LandingPage if anything is still loading or missing
  if (loading || !user) return <LandingPage />;

  if (isAdmin && !adminLoading) return <Navigate to="/admin" replace />;

  if (!profile) return <LandingPage />;

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
