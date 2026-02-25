import AppLayout from "@/components/AppLayout";
import Assistencia from "./Assistencia";
import { useAuth } from "@/hooks/useAuth";
import Auth from "./Auth";

const AssistenciaPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <AppLayout>
      <Assistencia />
    </AppLayout>
  );
};

export default AssistenciaPage;
