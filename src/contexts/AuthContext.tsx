
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);

      // Check for onboarding needs when user signs up or logs in
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await checkOnboardingStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      // Check if user has onboarding status
      const { data: onboardingData } = await supabase
        .from('user_onboarding_status')
        .select('status')
        .eq('user_id', userId)
        .single();

      // Check if user has machine admin role
      const { data: roleData } = await supabase
        .from('simplified_user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', 'machine_admin')
        .eq('is_active', true)
        .single();

      // User needs onboarding if they don't have completed status or no admin role
      const needsSetup = !onboardingData || 
                        onboardingData.status !== 'completed' || 
                        !roleData;

      setNeedsOnboarding(needsSetup);

      // If user needs onboarding and doesn't have pending/in_progress status, trigger auto-setup
      if (needsSetup && (!onboardingData || onboardingData.status === 'failed')) {
        console.log('Triggering auto-setup for new user');
        await triggerAutoSetup(userId);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const triggerAutoSetup = async (userId: string) => {
    try {
      const response = await supabase.functions.invoke('auto-setup-user', {
        body: {
          userId: userId,
          userEmail: user?.email,
          userName: user?.user_metadata?.full_name
        }
      });

      if (response.error) {
        console.error('Auto-setup error:', response.error);
      } else {
        console.log('Auto-setup triggered successfully');
      }
    } catch (error) {
      console.error('Error triggering auto-setup:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error.message);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign-in error:', error.message);
      return { user: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error('Sign-up error:', error.message);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign-up error:', error.message);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Sign-out error:', error.message);
    }
  };

  const value = {
    user,
    loading,
    needsOnboarding,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
