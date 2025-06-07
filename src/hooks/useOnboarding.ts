
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

interface SetupResult {
  success: boolean;
  users_processed: number;
  results: any[];
}

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch onboarding status with real-time updates
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
    enabled: !!user?.id,
    refetchInterval: (query) => {
      // Refetch every 2 seconds if status is pending
      return query.state.data?.status === 'pending' ? 2000 : false;
    }
  });

  // Start automated setup
  const startSetup = useMutation({
    mutationFn: async () => {
      if (!user?.id || !user?.email) {
        throw new Error('User not authenticated');
      }

      console.log('Starting setup for user:', user.email);

      // First create or update onboarding status to pending
      const { error: statusError } = await supabase
        .from('user_onboarding_status')
        .upsert({
          user_id: user.id,
          status: 'pending',
          setup_progress: {
            venue_created: false,
            games_assigned: 0,
            settings_configured: false,
            role_assigned: false
          }
        });

      if (statusError) {
        console.error('Error updating onboarding status:', statusError);
        throw statusError;
      }

      // Trigger the edge function
      const { data, error } = await supabase.functions.invoke('auto-setup-user', {
        body: {
          user_id: user.id,
          email: user.email,
          setup_type: 'new_user'
        }
      });

      if (error) {
        console.error('Setup function error:', error);
        throw error;
      }

      console.log('Setup function response:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Setup started successfully');
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-venues'] });
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
    mutationFn: async (): Promise<SetupResult> => {
      const { data, error } = await supabase.functions.invoke('setup-existing-users', {
        body: {}
      });
      if (error) throw error;
      return data as SetupResult;
    },
    onSuccess: (data: SetupResult) => {
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

  const needsOnboarding = !onboardingStatus || onboardingStatus.status === 'pending';
  const isCompleted = onboardingStatus?.status === 'completed';
  const isInProgress = onboardingStatus?.status === 'pending';

  return {
    onboardingStatus,
    isLoading,
    error,
    needsOnboarding,
    isCompleted,
    isInProgress,
    startSetup: () => startSetup.mutate(),
    setupExistingUsers: () => setupExistingUsers.mutate(),
    isSettingUp: startSetup.isPending,
    isBatchSetup: setupExistingUsers.isPending
  };
}
