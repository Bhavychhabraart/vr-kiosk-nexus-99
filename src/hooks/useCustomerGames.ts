
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
    console.log('=== Customer Games Query ===');
    console.log('Venue ID provided:', venueId);
    
    if (!venueId) {
      console.log('No venue ID - returning empty array for customer view');
      return [];
    }

    console.log('Fetching customer games for venue:', venueId);

    // ONLY fetch venue-specific games from machine_games - no fallback to all games
    const { data: machineGamesData, error: machineGamesError } = await supabase
      .from('machine_games')
      .select(`
        id,
        is_active,
        venue_id,
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

    console.log('Machine games query result:', {
      data: machineGamesData?.length || 0,
      error: machineGamesError?.message,
      venueId
    });

    if (machineGamesError) {
      console.error('Error fetching machine games:', machineGamesError);
      throw machineGamesError;
    }

    if (!machineGamesData || machineGamesData.length === 0) {
      console.log('No machine games found for venue - customer will see no games');
      console.log('This means games need to be assigned to this venue by an admin');
      return [];
    }

    // Filter for games that are BOTH globally active AND venue-active
    const filteredData = machineGamesData.filter(mg => {
      const gameIsGloballyActive = mg.games?.is_active === true;
      const gameIsVenueActive = mg.is_active === true;
      const shouldInclude = gameIsGloballyActive && gameIsVenueActive;
      
      console.log('Filtering game:', {
        game_title: mg.games?.title,
        game_id: mg.games?.id,
        global_active: gameIsGloballyActive,
        venue_active: gameIsVenueActive,
        machine_game_id: mg.id,
        will_show_to_customer: shouldInclude
      });
      
      return shouldInclude;
    });
    
    console.log('Final filtered games for customers:', {
      total_assigned_to_venue: machineGamesData.length,
      customer_visible: filteredData.length,
      venue_id: venueId
    });

    const mappedData = filteredData.map(mg => ({
      ...mg.games,
      machine_game_id: mg.id,
      is_machine_active: mg.is_active
    })) as CustomerGame[];

    console.log('Customer games result:', {
      count: mappedData.length,
      games: mappedData.map(g => ({ id: g.id, title: g.title, machine_active: g.is_machine_active }))
    });

    return mappedData;
  };

  const { data: customerGames, isLoading, error } = useQuery({
    queryKey: ['customer-games', venueId],
    queryFn: fetchCustomerGames,
    enabled: !!venueId, // Only run if we have a venue ID
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  });

  // Log query results for debugging
  useEffect(() => {
    if (error) {
      console.error('Customer games query error:', error);
    }
    if (customerGames !== undefined) {
      console.log('=== Customer Games Hook Result ===');
      console.log('Venue ID:', venueId);
      console.log('Games count:', customerGames.length);
      console.log('Games:', customerGames.map(g => ({ 
        id: g.id, 
        title: g.title, 
        machine_active: g.is_machine_active,
        global_active: g.is_active 
      })));
    }
  }, [customerGames, error, venueId]);

  // Real-time subscription for games and machine_games table changes
  useEffect(() => {
    if (!venueId) return;
    
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
          
          if (newRecord?.venue_id === venueId || oldRecord?.venue_id === venueId) {
            console.log('Machine games change affects current venue, refreshing customer games...');
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
