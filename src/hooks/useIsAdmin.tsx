import { useAuth } from "./useAuth";

export function useIsAdmin() {
  const { user, profile, loading } = useAuth();
  return { 
    isAdmin: profile?.role === "admin", 
    loading,
    user,
    profile 
  };
}
