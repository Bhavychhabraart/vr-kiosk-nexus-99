
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
    console.log('Fetching customer games for venue:', venueId);
    
    if (!venueId) {
      console.log('No venue ID provided, fetching all active games as fallback');
      // Fallback to all active games if no venue is specified
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('title');
      
      if (error) {
        console.error('Error fetching fallback games:', error);
        throw error;
      }
      
      console.log('Fallback games fetched:', data?.length || 0);
      return (data || []).map(game => ({
        ...game,
        machine_game_id: '',
        is_machine_active: true
      }));
    }

    // Fixed query syntax - use proper PostgREST filtering for joined tables
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
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching venue games:', error);
      throw error;
    }

    console.log('Raw venue games data:', data?.length || 0, 'records');
    
    // Debug: Log the structure of the first record
    if (data && data.length > 0) {
      console.log('First record structure:', JSON.stringify(data[0], null, 2));
      console.log('games property structure:', data[0].games);
      console.log('games.is_active value:', data[0].games?.is_active);
    }

    // Filter for active games at the application level
    // The data structure should have mg.games as the nested game object
    const filteredData = data?.filter(mg => {
      console.log('Filtering record:', {
        machine_game_id: mg.id,
        has_games: !!mg.games,
        games_is_active: mg.games?.is_active,
        machine_is_active: mg.is_active
      });
      
      // Check if games object exists and the game itself is active
      return mg.games && mg.games.is_active === true;
    }) || [];
    
    console.log('Filtered active games:', filteredData.length);
    console.log('Filtered games details:', filteredData.map(mg => ({
      title: mg.games?.title,
      game_active: mg.games?.is_active,
      machine_active: mg.is_active
    })));

    const mappedData = filteredData.map(mg => ({
      ...mg.games,
      machine_game_id: mg.id,
      is_machine_active: mg.is_active
    })) as CustomerGame[];

    console.log('Final mapped customer games:', mappedData.length);
    console.log('Final games list:', mappedData.map(game => ({ title: game.title, id: game.id })));
    
    return mappedData;
  };

  const { data: customerGames, isLoading, error } = useQuery({
    queryKey: ['customer-games', venueId],
    queryFn: fetchCustomerGames,
    enabled: true
  });

  // Log query results for debugging
  useEffect(() => {
    if (error) {
      console.error('Customer games query error:', error);
    }
    if (customerGames) {
      console.log('Customer games query success:', customerGames.length, 'games');
      console.log('Query executed with venue ID:', venueId);
    }
  }, [customerGames, error, venueId]);

  // Real-time subscription for games and machine_games table changes
  useEffect(() => {
    console.log('Setting up real-time subscription for customer games with venue:', venueId);
    
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
            console.log('Machine games change affects current venue, refreshing...');
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
