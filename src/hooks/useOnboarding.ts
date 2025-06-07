
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnboardingStatus {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  venue_id?: string;
  machine_serial_number?: string;
  setup_progress?: {
    step: string;
    message: string;
  };
  completed_at?: string;
  error_message?: string;
}

export const useOnboarding = () => {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchOnboardingStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding status:', error);
        return;
      }

      setOnboardingStatus(data);
    } catch (error) {
      console.error('Error in fetchOnboardingStatus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAutoSetup = async () => {
    if (!user) return;

    try {
      const response = await supabase.functions.invoke('auto-setup-user', {
        body: {
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.full_name
        }
      });

      if (response.error) {
        throw response.error;
      }

      console.log('Auto-setup triggered successfully');
      // Refresh status after triggering
      setTimeout(fetchOnboardingStatus, 1000);
    } catch (error) {
      console.error('Error triggering auto-setup:', error);
    }
  };

  useEffect(() => {
    fetchOnboardingStatus();
  }, [user]);

  // Set up real-time subscription for onboarding status updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('onboarding-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_onboarding_status',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Onboarding status updated:', payload.new);
          setOnboardingStatus(payload.new as OnboardingStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    onboardingStatus,
    isLoading,
    triggerAutoSetup,
    refetch: fetchOnboardingStatus
  };
};
