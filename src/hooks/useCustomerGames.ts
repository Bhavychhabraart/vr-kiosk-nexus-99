
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { Game } from '@/types';

interface CustomerGame extends Game {
  machine_game_id: string;
  is_machine_active: boolean;
}

export function useCustomerGames(venueId?: string) {
  const queryClient = useQueryClient();

  // Fetch venue-specific games that are both globally active and enabled for the venue
  const fetchCustomerGames = async (): Promise<CustomerGame[]> => {
    if (!venueId) {
      // Fallback to all active games if no venue is specified
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('title');
      
      if (error) throw error;
      
      return (data || []).map(game => ({
        ...game,
        machine_game_id: '',
        is_machine_active: true
      }));
    }

    console.log('Fetching customer games for venue:', venueId);

    const { data, error } = await supabase
      .from('machine_games')
      .select(`
        id,
        is_active,
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
      .eq('venue_id', venueId)
      .eq('is_active', true)
      .eq('games.is_active', true);

    if (error) {
      console.error('Error fetching customer games:', error);
      throw error;
    }

    console.log('Raw customer games data:', data);

    const mappedData = data?.map(mg => ({
      ...mg.games,
      machine_game_id: mg.id,
      is_machine_active: mg.is_active
    })) as CustomerGame[] || [];

    console.log('Mapped customer games:', mappedData);
    return mappedData;
  };

  const { data: customerGames, isLoading, error } = useQuery({
    queryKey: ['customer-games', venueId],
    queryFn: fetchCustomerGames,
    enabled: true
  });

  // Real-time subscription for games and machine_games table changes
  useEffect(() => {
    console.log('Setting up real-time subscription for customer games');
    
    const channel = supabase
      .channel('customer-games-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        (payload) => {
          console.log('Real-time games update received in useCustomerGames:', payload);
          
          // Invalidate customer games query
          queryClient.invalidateQueries({ queryKey: ['customer-games', venueId] });
          
          // Force refetch to ensure immediate updates
          queryClient.refetchQueries({ queryKey: ['customer-games', venueId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'machine_games'
        },
        (payload) => {
          console.log('Real-time machine_games update received:', payload);
          
          // Only invalidate if the change affects this venue
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          if (!venueId || 
              (newRecord && newRecord.venue_id === venueId) || 
              (oldRecord && oldRecord.venue_id === venueId)) {
            queryClient.invalidateQueries({ queryKey: ['customer-games', venueId] });
            queryClient.refetchQueries({ queryKey: ['customer-games', venueId] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Customer games real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription for customer games');
      supabase.removeChannel(channel);
    };
  }, [queryClient, venueId]);

  return {
    customerGames,
    isLoading,
    error
  };
}
