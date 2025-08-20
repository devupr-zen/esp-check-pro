import type { Session, User } from "@supabase/supabase-js";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; // ✅ canonical singleton

interface Profile {
  id: string; // profiles.id === auth.users.id
  user_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: "student" | "teacher" | "superadmin";
  track?: string | null;
  avatar_url?: string | null;
  is_active?: boolean | null;
  password_changed?: boolean | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ---- helpers ---------------------------------------------------------

  const getReturnTo = () => {
    const rt = new URLSearchParams(location.search).get("returnTo");
    return rt && rt.startsWith("/") ? rt : null;
  };

  const onOnboardingRoute = () =>
    location.pathname.startsWith("/onboarding/");

  const onAuthRoute = () => location.pathname.startsWith("/auth");

  const roleToDefaultPath = (role: string) => {
    if (role === "teacher") return "/teacher/dashboard";
    if (role === "superadmin") return "/superadmin/overview";
    return "/student/dashboard";
  };

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    return (data as Profile | null) ?? null;
  };

  const hasEspProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from("esp_profiles_latest")
      .select("id")
      .eq("user_id", uid)
      .maybeSingle();
    if (error) return false;
    return Boolean(data);
  };

  const handleRedirects = async (p: Profile) => {
    const returnTo = getReturnTo();

    // 1) Teacher forced password change
    if (p.role === "teacher" && p.password_changed === false) {
      if (!location.pathname.startsWith("/auth/teacher")) {
        navigate("/auth/teacher", { replace: true });
      }
      return;
    }

    // 2) Student onboarding flow (only if not already on an onboarding route)
    if (p.role === "student" && !onOnboardingRoute()) {
      if (!p.track) {
        navigate("/onboarding/track", { replace: true });
        return;
      }
      const hasProfile = await hasEspProfile(p.id);
      if (!hasProfile) {
        navigate("/onboarding/survey", { replace: true });
        return;
      }
    }

    // 3) Respect returnTo if present
    if (returnTo) {
      navigate(returnTo, { replace: true });
      return;
    }

    // 4) Role-based home
    navigate(roleToDefaultPath(p.role), { replace: true });
  };

  // ---- effects ---------------------------------------------------------

  useEffect(() => {
    // Reusable handler for auth changes
    const handleAuthChange = async (newSession: Session | null) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const p = await fetchProfile(newSession.user.id);
        setProfile(p);

        // Only redirect when landing/auth pages or when app doesn't have a stable route yet
        const isLanding = location.pathname === "/";
        const isAuth = onAuthRoute();

        if (p && (isLanding || isAuth || location.pathname === "")) {
          await handleRedirects(p);
        }
      } else {
        setProfile(null);

        // If signed out while on protected routes → send to landing
        const protectedPrefixes = [
          "/dashboard",
          "/student",
          "/teacher",
          "/superadmin",
          "/assessments",
          "/activities",
          "/reports",
          "/profile",
        ];
        const isProtected = protectedPrefixes.some((r) =>
          location.pathname.startsWith(r),
        );
        if (isProtected) navigate("/", { replace: true });
      }

      setLoading(false);
    };

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      void handleAuthChange(newSession);
    });

    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      void handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, location.pathname]);

  // ---- actions ---------------------------------------------------------

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      navigate("/", { replace: true });
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
