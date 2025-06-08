
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

interface VenueGame {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  trailer_url?: string | null;
  is_active: boolean;
  min_duration_seconds: number;
  max_duration_seconds: number;
  executable_path?: string | null;
  working_directory?: string | null;
  arguments?: string | null;
  created_at: string;
  updated_at: string;
  machine_game_id: string;
  is_machine_active: boolean;
  assigned_at: string;
  assigned_by: string;
}

export function useVenueGames(venueId?: string) {
  const queryClient = useQueryClient();

  const fetchVenueGames = async (): Promise<VenueGame[]> => {
    if (!venueId) return [];

    console.log('Fetching venue games for admin:', venueId);

    const { data, error } = await supabase
      .from('machine_games')
      .select(`
        id,
        is_active,
        assigned_at,
        assigned_by,
        games!inner(
          id,
          title,
          description,
          image_url,
          trailer_url,
          is_active,
          min_duration_seconds,
          max_duration_seconds,
          executable_path,
          working_directory,
          arguments,
          created_at,
          updated_at
        )
      `)
      .eq('venue_id', venueId);

    if (error) {
      console.error('Error fetching venue games:', error);
      throw error;
    }

    const mappedData = data?.map(mg => ({
      ...mg.games,
      machine_game_id: mg.id,
      is_machine_active: mg.is_active,
      assigned_at: mg.assigned_at,
      assigned_by: mg.assigned_by
    })) as VenueGame[] || [];

    console.log('Mapped venue games for admin:', mappedData);
    return mappedData;
  };

  const { data: venueGames, isLoading, error } = useQuery({
    queryKey: ['venue-games', venueId],
    queryFn: fetchVenueGames,
    enabled: !!venueId
  });

  // Real-time subscription for machine_games table changes
  useEffect(() => {
    if (!venueId) return;
    
    console.log('Setting up real-time subscription for venue games admin');
    
    const channel = supabase
      .channel('venue-games-admin-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'machine_games'
        },
        (payload) => {
          console.log('Real-time machine_games update received in admin:', payload);
          
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          if (newRecord?.venue_id === venueId || oldRecord?.venue_id === venueId) {
            queryClient.invalidateQueries({ queryKey: ['venue-games', venueId] });
            queryClient.invalidateQueries({ queryKey: ['customer-games', venueId] });
            queryClient.refetchQueries({ queryKey: ['venue-games', venueId] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        (payload) => {
          console.log('Real-time games update received in venue admin:', payload);
          
          // Invalidate all related queries when games table changes
          queryClient.invalidateQueries({ queryKey: ['venue-games', venueId] });
          queryClient.invalidateQueries({ queryKey: ['customer-games', venueId] });
          queryClient.invalidateQueries({ queryKey: ['games'] });
          queryClient.refetchQueries({ queryKey: ['venue-games', venueId] });
        }
      )
      .subscribe((status) => {
        console.log('Venue games admin real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription for venue games admin');
      supabase.removeChannel(channel);
    };
  }, [queryClient, venueId]);

  // Toggle venue-specific game status
  const toggleVenueGameStatus = useMutation({
    mutationFn: async ({ machineGameId, isActive }: { machineGameId: string; isActive: boolean }) => {
      console.log('Toggling venue game status:', { machineGameId, isActive });
      
      const { data, error } = await supabase
        .from('machine_games')
        .update({ is_active: isActive })
        .eq('id', machineGameId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling venue game status:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Venue game status toggle success:', data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['venue-games', venueId] });
      queryClient.invalidateQueries({ queryKey: ['customer-games', venueId] });
      queryClient.invalidateQueries({ queryKey: ['machine-games', venueId] });
      
      toast({
        title: "Game Status Updated",
        description: "Venue game availability has been updated",
      });
    },
    onError: (error) => {
      console.error('Venue game status toggle error:', error);
      toast({
        title: "Error updating game status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    venueGames,
    isLoading,
    error,
    toggleVenueGameStatus: (machineGameId: string, isActive: boolean) =>
      toggleVenueGameStatus.mutate({ machineGameId, isActive }),
    isToggling: toggleVenueGameStatus.isPending
  };
}
