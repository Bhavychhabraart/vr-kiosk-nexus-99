
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Venue, VenueInsert, VenueUpdate } from '@/types/business';

export function useVenues() {
  const queryClient = useQueryClient();
  
  const fetchVenues = async (): Promise<Venue[]> => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  };
  
  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: fetchVenues
  });
  
  const createVenue = useMutation({
    mutationFn: async (venue: VenueInsert) => {
      const { data, error } = await supabase
        .from('venues')
        .insert(venue)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: "Venue created successfully",
        description: "New venue has been added to the network",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating venue",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateVenue = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VenueUpdate }) => {
      const { data, error } = await supabase
        .from('venues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: "Venue updated successfully",
        description: "Venue information has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating venue",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    venues,
    isLoading,
    error,
    createVenue: (venue: VenueInsert) => createVenue.mutate(venue),
    updateVenue: (id: string, updates: VenueUpdate) => updateVenue.mutate({ id, updates }),
    isCreating: createVenue.isPending,
    isUpdating: updateVenue.isPending
  };
}
