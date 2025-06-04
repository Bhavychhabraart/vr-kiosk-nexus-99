
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface LaunchOptions {
  id: string;
  venue_id: string;
  tap_to_start_enabled: boolean;
  rfid_enabled: boolean;
  qr_payment_enabled: boolean;
  default_duration_minutes: number;
  price_per_minute: number;
  created_at: string;
  updated_at: string;
}

export const useLaunchOptions = (venueId?: string) => {
  const queryClient = useQueryClient();

  const { data: launchOptions, isLoading } = useQuery({
    queryKey: ['launchOptions', venueId],
    queryFn: async (): Promise<LaunchOptions | null> => {
      if (!venueId) return null;
      
      const { data, error } = await supabase
        .from('launch_options')
        .select('*')
        .eq('venue_id', venueId)
        .single();

      if (error) {
        console.error('Error fetching launch options:', error);
        return null;
      }

      return data;
    },
    enabled: !!venueId,
  });

  const updateLaunchOptions = useMutation({
    mutationFn: async (options: Partial<LaunchOptions>) => {
      if (!venueId) throw new Error('Venue ID is required');

      const { error } = await supabase
        .from('launch_options')
        .upsert({
          venue_id: venueId,
          ...options,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launchOptions', venueId] });
      toast({
        title: "Success",
        description: "Launch options updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating launch options:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update launch options",
      });
    },
  });

  return {
    launchOptions,
    isLoading,
    updateLaunchOptions: updateLaunchOptions.mutate,
    isUpdating: updateLaunchOptions.isPending,
  };
};
