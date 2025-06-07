
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

      console.log('Fetching onboarding status for user:', user.id);

      const { data, error } = await supabase
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching onboarding status:', error);
        throw error;
      }
      
      console.log('Onboarding status fetched:', data);
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: (query) => {
      // Refetch every 2 seconds if status is pending
      const status = query.state.data?.status;
      return status === 'pending' ? 2000 : false;
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
          },
          error_message: null
        });

      if (statusError) {
        console.error('Error updating onboarding status:', statusError);
        throw statusError;
      }

      console.log('Onboarding status updated to pending, calling edge function...');

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
        
        // Update onboarding status with error
        await supabase
          .from('user_onboarding_status')
          .update({
            status: 'failed',
            error_message: error.message || 'Setup function failed'
          })
          .eq('user_id', user.id);
        
        throw error;
      }

      console.log('Setup function response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Setup started successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-venues'] });
      
      toast({
        title: "Setup Started",
        description: "Your VR arcade setup is now in progress!",
      });
    },
    onError: (error) => {
      console.error('Setup failed:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to start setup. Please try again.",
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

  // Retry setup function
  const retrySetup = useMutation({
    mutationFn: async () => {
      if (!user?.id || !user?.email) {
        throw new Error('User not authenticated');
      }

      console.log('Retrying setup for user:', user.email);

      // Reset onboarding status
      const { error: resetError } = await supabase
        .from('user_onboarding_status')
        .update({
          status: 'pending',
          error_message: null,
          setup_progress: {
            venue_created: false,
            games_assigned: 0,
            settings_configured: false,
            role_assigned: false
          }
        })
        .eq('user_id', user.id);

      if (resetError) {
        console.error('Error resetting onboarding status:', resetError);
        throw resetError;
      }

      // Call setup function again
      return startSetup.mutateAsync();
    },
    onSuccess: () => {
      toast({
        title: "Retry Started",
        description: "Setup process has been restarted",
      });
    },
    onError: (error) => {
      toast({
        title: "Retry Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const needsOnboarding = !onboardingStatus || onboardingStatus.status === 'pending';
  const isCompleted = onboardingStatus?.status === 'completed';
  const isInProgress = onboardingStatus?.status === 'pending';
  const hasFailed = onboardingStatus?.status === 'failed';

  return {
    onboardingStatus,
    isLoading,
    error,
    needsOnboarding,
    isCompleted,
    isInProgress,
    hasFailed,
    startSetup: () => startSetup.mutate(),
    retrySetup: () => retrySetup.mutate(),
    setupExistingUsers: () => setupExistingUsers.mutate(),
    isSettingUp: startSetup.isPending,
    isRetrying: retrySetup.isPending,
    isBatchSetup: setupExistingUsers.isPending
  };
}
