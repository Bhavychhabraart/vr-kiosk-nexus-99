
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type SimplifiedUserRole = 'super_admin' | 'machine_admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SimplifiedUserRoleData {
  id: string;
  role: SimplifiedUserRole;
  venue_id: string | null;
  created_at: string;
  is_active: boolean;
}

interface SimplifiedAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  userRoles: SimplifiedUserRoleData[];
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signUpWithInvitation: (email: string, password: string, fullName: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isSuperAdmin: () => boolean;
  isMachineAdmin: (venueId?: string) => boolean;
  refreshProfile: () => Promise<void>;
  createMachineAdminInvitation: (email: string, venueId: string) => Promise<{ success: boolean; error?: string }>;
}

const SimplifiedAuthContext = createContext<SimplifiedAuthContextType | undefined>(undefined);

export function useSimplifiedAuth() {
  const context = useContext(SimplifiedAuthContext);
  if (context === undefined) {
    throw new Error('useSimplifiedAuth must be used within a SimplifiedAuthProvider');
  }
  return context;
}

interface SimplifiedAuthProviderProps {
  children: ReactNode;
}

export function SimplifiedAuthProvider({ children }: SimplifiedAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<SimplifiedUserRoleData[]>([]);
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
        .from('simplified_user_roles')
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
      // For super admin signup, automatically assign super_admin role
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
    }

    return { error };
  };

  const signUpWithInvitation = async (email: string, password: string, fullName: string, token: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Accept the invitation
        const { data: result, error: inviteError } = await supabase.rpc('accept_invitation', {
          p_token: token,
          p_user_id: authData.user.id
        });

        if (inviteError) throw inviteError;

        // Type cast the result to access properties
        const typedResult = result as { success: boolean; error?: string };

        if (!typedResult.success) {
          throw new Error(typedResult.error || 'Failed to accept invitation');
        }

        toast({
          title: "Account Created!",
          description: "You have successfully joined as a machine admin.",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
      return { error };
    }
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

  const isSuperAdmin = (): boolean => {
    return userRoles.some(role => role.role === 'super_admin' && role.is_active);
  };

  const isMachineAdmin = (venueId?: string): boolean => {
    return userRoles.some(role => 
      role.role === 'machine_admin' && 
      role.is_active && 
      (venueId ? role.venue_id === venueId : true)
    );
  };

  const createMachineAdminInvitation = async (email: string, venueId: string) => {
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data: result, error } = await supabase.rpc('create_machine_admin_invitation', {
        p_email: email,
        p_venue_id: venueId,
        p_invited_by: user.id
      });

      if (error) throw error;

      // Type cast the result to access properties
      const typedResult = result as { success: boolean; error?: string };

      if (!typedResult.success) {
        return { success: false, error: typedResult.error };
      }

      toast({
        title: "Invitation Sent",
        description: `Machine admin invitation sent to ${email}`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      return { success: false, error: error.message };
    }
  };

  const value: SimplifiedAuthContextType = {
    user,
    profile,
    userRoles,
    session,
    isLoading,
    signIn,
    signUp,
    signUpWithInvitation,
    signOut,
    isSuperAdmin,
    isMachineAdmin,
    refreshProfile,
    createMachineAdminInvitation,
  };

  return (
    <SimplifiedAuthContext.Provider value={value}>
      {children}
    </SimplifiedAuthContext.Provider>
  );
}
