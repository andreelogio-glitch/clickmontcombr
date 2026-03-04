import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  role: "cliente" | "montador";
  is_approved?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (mounted) setProfile(data as Profile | null);
    };

    // 1. Restore session from storage FIRST, then mark ready
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      if (mounted) {
        setLoading(false);
        initializedRef.current = true;
      }
    });

    // 2. Listen for subsequent changes (login, logout, token refresh)
    // This fires AFTER getSession, so we gate updates on initializedRef
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Skip the INITIAL_SESSION event — we handle it via getSession above
        if (event === "INITIAL_SESSION") return;

        const newUser = session?.user ?? null;
        setUser(newUser);

        if (newUser) {
          // Use setTimeout to avoid blocking the callback
          setTimeout(async () => {
            if (!mounted) return;
            await fetchProfile(newUser.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
