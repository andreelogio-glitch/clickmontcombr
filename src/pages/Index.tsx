import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ClienteHome from "./ClienteHome";
import LandingPage from "./LandingPage";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { isAdmin } = useIsAdmin();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <LandingPage />;

  if (isAdmin) return <Navigate to="/admin" replace />;

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Montadores always go to their dedicated route
  if (profile.role === "montador") {
    return <Navigate to="/montador" replace />;
  }

  return (
    <AppLayout>
      <ClienteHome />
    </AppLayout>
  );
};

export default Index;
