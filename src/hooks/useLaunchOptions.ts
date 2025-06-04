
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

  const { data: launchOptions, isLoading, error } = useQuery({
    queryKey: ['launchOptions', venueId],
    queryFn: async (): Promise<LaunchOptions | null> => {
      if (!venueId) {
        console.log('No venue ID provided to useLaunchOptions');
        return null;
      }
      
      console.log('Fetching launch options for venue:', venueId);
      
      const { data, error } = await supabase
        .from('launch_options')
        .select('*')
        .eq('venue_id', venueId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching launch options:', error);
        throw error;
      }

      console.log('Launch options data:', data);

      // If no launch options exist, create default ones
      if (!data) {
        console.log('No launch options found, creating defaults for venue:', venueId);
        
        const { data: newData, error: insertError } = await supabase
          .from('launch_options')
          .insert({
            venue_id: venueId,
            tap_to_start_enabled: true,
            rfid_enabled: true,
            qr_payment_enabled: false,
            default_duration_minutes: 10,
            price_per_minute: 15.0
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default launch options:', insertError);
          throw insertError;
        }

        console.log('Created default launch options:', newData);
        return newData;
      }

      return data;
    },
    enabled: !!venueId,
    retry: (failureCount, error) => {
      console.error(`Query failed ${failureCount} times:`, error);
      return failureCount < 2;
    }
  });

  const updateLaunchOptions = useMutation({
    mutationFn: async (options: Partial<LaunchOptions>) => {
      if (!venueId) {
        throw new Error('Venue ID is required');
      }

      console.log('Updating launch options for venue:', venueId, 'with options:', options);

      const { data, error } = await supabase
        .from('launch_options')
        .upsert({
          venue_id: venueId,
          ...options,
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating launch options:', error);
        throw error;
      }

      console.log('Updated launch options:', data);
      return data;
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
        description: `Failed to update launch options: ${error.message}`,
      });
    },
  });

  // Log any query errors
  if (error) {
    console.error('useLaunchOptions query error:', error);
  }

  return {
    launchOptions,
    isLoading,
    error,
    updateLaunchOptions: updateLaunchOptions.mutate,
    isUpdating: updateLaunchOptions.isPending,
  };
};
