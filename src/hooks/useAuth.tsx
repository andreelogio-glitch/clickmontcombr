import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  role: "cliente" | "montador" | "admin";
  is_approved?: boolean;
  city?: string | null;
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
      let profileData: Profile | null = null;

      for (let i = 0; i < 6; i++) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, phone, role")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (data) {
          // Busca city e user_id separadamente para contornar tipos gerados
          const { data: extra } = await supabase
            .from("profiles")
            .select("user_id, city")
            .eq("id", data.id)
            .maybeSingle();

          profileData = {
            id: data.id,
            user_id: (extra as any)?.user_id ?? userId,
            full_name: data.full_name ?? "",
            phone: data.phone ?? null,
            role: data.role as Profile["role"],
            city: (extra as any)?.city ?? null,
          };
          break;
        }

        if (error && error.code !== "PGRST116") {
          console.error("Profile fetch error:", error);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (mounted) setProfile(profileData);
    };

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "INITIAL_SESSION") return;

      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        setTimeout(async () => {
          if (!mounted) return;
          await fetchProfile(newUser.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

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

  return <AuthContext.Provider value={{ user, profile, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
