
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Subscription } from '@/types/business';

export function useSubscription() {
  const fetchSubscription = async (): Promise<Subscription | null> => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  };
  
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription
  });
  
  return {
    subscription,
    isLoading,
    error
  };
}
