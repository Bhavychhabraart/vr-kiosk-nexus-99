
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface OnboardingStatus {
  id: string;
  user_id: string;
  status: string;
  venue_id?: string;
  machine_serial_number?: string;
  setup_progress?: any;
  error_message?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch onboarding status
  const { data: onboardingStatus, isLoading, error } = useQuery({
    queryKey: ['onboarding-status', user?.id],
    queryFn: async (): Promise<OnboardingStatus | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Start automated setup
  const startSetup = useMutation({
    mutationFn: async () => {
      if (!user?.id || !user?.email) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('auto-setup-user', {
        body: {
          user_id: user.id,
          email: user.email,
          setup_type: 'new_user'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-venues'] });
      toast({
        title: "Setup Complete!",
        description: "Your VR arcade is ready to serve customers",
      });
    },
    onError: (error) => {
      console.error('Setup failed:', error);
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Setup existing users
  const setupExistingUsers = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('setup_existing_users');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-venues'] });
      toast({
        title: "Batch Setup Complete!",
        description: `Successfully set up ${data.users_processed} users`,
      });
    },
    onError: (error) => {
      toast({
        title: "Batch Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const needsOnboarding = onboardingStatus?.status === 'pending' || !onboardingStatus;
  const isCompleted = onboardingStatus?.status === 'completed';

  return {
    onboardingStatus,
    isLoading,
    error,
    needsOnboarding,
    isCompleted,
    startSetup: () => startSetup.mutate(),
    setupExistingUsers: () => setupExistingUsers.mutate(),
    isSettingUp: startSetup.isPending,
    isBatchSetup: setupExistingUsers.isPending
  };
}
