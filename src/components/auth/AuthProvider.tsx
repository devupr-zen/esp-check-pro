import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';   // ✅ use singleton
import { useNavigate, useLocation } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'student' | 'teacher' | 'superadmin';
  track?: string;
  avatar_url?: string;
  is_active: boolean;
  password_changed: boolean;
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
  signOut: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            setProfile(profileData);
            
            // Handle redirects based on auth state and profile
            if (profileData) {
              const isAuthPage = location.pathname.startsWith('/auth');
              const isLandingPage = location.pathname === '/';
              
              if (isAuthPage || isLandingPage) {
                // Redirect authenticated users away from auth pages
                if (profileData.role === 'teacher' && !profileData.password_changed) {
                  // Teacher needs to change password
                  navigate('/auth/teacher');
                } else {
                  // Redirect to appropriate dashboard based on role
                  if (profileData.role === 'student') {
                    navigate('/student/dashboard');
                  } else if (profileData.role === 'teacher') {
                    navigate('/teacher/dashboard');
                  } else if (profileData.role === 'superadmin') {
                    navigate('/superadmin');
                  }
                }
              }
            }
          }, 0);
        } else {
          setProfile(null);
          // Redirect unauthenticated users to landing page if they're on protected routes
          const protectedRoutes = ['/dashboard', '/student', '/teacher', '/superadmin', '/assessments', '/activities', '/reports', '/profile'];
          const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
          
          if (isProtectedRoute) {
            navigate('/');
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            setProfile(profileData);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      navigate('/');
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}