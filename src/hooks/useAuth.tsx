
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type UserRole = 'super_admin' | 'admin' | 'machine_admin' | 'setup_user';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleData {
  id: string;
  role: UserRole;
  venue_id: string | null;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  userRoles: UserRoleData[];
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole, venueId?: string) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: (venueId?: string) => boolean;
  isMachineAdmin: (venueId?: string) => boolean;
  isSetupUser: () => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRoleData[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      setProfile(profileData);
      setUserRoles(rolesData || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setUserRoles([]);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setUserRoles([]);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          variant: "destructive",
          title: "Sign Out Failed",
          description: error.message,
        });
      } else {
        console.log('Sign out successful');
        // Clear local state immediately
        setUser(null);
        setProfile(null);
        setUserRoles([]);
        setSession(null);
        
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "An unexpected error occurred while signing out.",
      });
    }
  };

  const hasRole = (role: UserRole, venueId?: string): boolean => {
    return userRoles.some(userRole => {
      if (userRole.role !== role) return false;
      if (userRole.expires_at && new Date(userRole.expires_at) < new Date()) return false;
      if (venueId && userRole.venue_id !== venueId && userRole.venue_id !== null) return false;
      return true;
    });
  };

  const isSuperAdmin = (): boolean => hasRole('super_admin');
  const isAdmin = (venueId?: string): boolean => hasRole('admin', venueId);
  const isMachineAdmin = (venueId?: string): boolean => hasRole('machine_admin', venueId);
  const isSetupUser = (): boolean => hasRole('setup_user');

  const value: AuthContextType = {
    user,
    profile,
    userRoles,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isMachineAdmin,
    isSetupUser,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
