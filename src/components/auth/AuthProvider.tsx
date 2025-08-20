import type { Session, User } from "@supabase/supabase-js";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // ✅ singleton

interface Profile {
	id: string;
	// ⚠️ In your schema profiles.id === auth.user.id; user_id may not exist.
	//    Keep it optional so other parts of the app compiling against it won't break.
	user_id?: string;
	// Email/flags may not exist in your table yet → keep optional to avoid TS errors.
	email?: string;
	first_name?: string;
	last_name?: string;
	role: "student" | "teacher" | "superadmin";
	track?: string;
	avatar_url?: string;
	is_active?: boolean;
	password_changed?: boolean;
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

	// Helper: read ?returnTo=... from current URL
	const getReturnTo = () => {
		const rt = new URLSearchParams(location.search).get("returnTo");
		return rt && rt.startsWith("/") ? rt : null;
	};

	useEffect(() => {
		// --- Auth state listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, newSession) => {
			setSession(newSession ?? null);
			setUser(newSession?.user ?? null);

			if (newSession?.user) {
				// 🔧 UPDATED: profiles keyed by id === auth.user.id
				const { data: profileData } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", newSession.user.id)
					.single();

				setProfile(profileData ?? null);

				// Redirect logic (kept minimal, with returnTo support)
				if (profileData) {
					const isAuthPage = location.pathname.startsWith("/auth");
					const isLandingPage = location.pathname === "/";
					const returnTo = getReturnTo();

					if (isAuthPage || isLandingPage) {
						if (
							profileData.role === "teacher" &&
							profileData.password_changed === false
						) {
							// Teacher must change password → keep them on teacher auth
							navigate("/auth/teacher", { replace: true });
						} else if (returnTo) {
							navigate(returnTo, { replace: true });
						} else {
							// Route by role (preserve your existing destinations)
							if (profileData.role === "student") {
								navigate("/student/dashboard", { replace: true });
							} else if (profileData.role === "teacher") {
								navigate("/teacher/dashboard", { replace: true });
							} else if (profileData.role === "superadmin") {
								navigate("/superadmin", { replace: true });
							}
						}
					}
				}
			} else {
				setProfile(null);

				// Unauthed on protected routes → send to landing
				const protectedRoutes = [
					"/dashboard",
					"/student",
					"/teacher",
					"/superadmin",
					"/assessments",
					"/activities",
					"/reports",
					"/profile",
				];
				const isProtectedRoute = protectedRoutes.some((route) =>
					location.pathname.startsWith(route),
				);

				if (isProtectedRoute) navigate("/", { replace: true });
			}

			setLoading(false);
		});

		// --- Initial session check (on mount)
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			setSession(session ?? null);
			setUser(session?.user ?? null);

			if (session?.user) {
				// 🔧 UPDATED: profiles keyed by id === auth.user.id
				const { data: profileData } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", session.user.id)
					.single();

				setProfile(profileData ?? null);
			}

			setLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [navigate, location.pathname]);

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
