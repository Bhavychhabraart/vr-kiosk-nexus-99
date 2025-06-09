
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

    // First, try to get venue-specific games from machine_games
    const { data: machineGamesData, error: machineGamesError } = await supabase
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
      .eq('venue_id', venueId);

    console.log('Machine games query result:', {
      data: machineGamesData?.length || 0,
      error: machineGamesError?.message
    });

    // If there are machine_games records for this venue, use them
    if (machineGamesData && machineGamesData.length > 0) {
      console.log('Found machine games for venue, filtering active ones');
      
      // Filter for games that are both globally active AND machine-level active
      const filteredData = machineGamesData.filter(mg => {
        const gameIsGloballyActive = mg.games?.is_active === true;
        const gameIsMachineActive = mg.is_active === true;
        const shouldInclude = gameIsGloballyActive && gameIsMachineActive;
        
        console.log('Filtering machine game:', {
          game_title: mg.games?.title,
          game_is_globally_active: gameIsGloballyActive,
          machine_is_active: gameIsMachineActive,
          will_include: shouldInclude
        });
        
        return shouldInclude;
      });
      
      console.log('Filtered machine games (customer visible):', filteredData.length);

      const mappedData = filteredData.map(mg => ({
        ...mg.games,
        machine_game_id: mg.id,
        is_machine_active: mg.is_active
      })) as CustomerGame[];

      console.log('Final customer games result:', mappedData.length);
      return mappedData;
    }

    // If no machine_games records exist for this venue, fall back to all active games
    console.log('No machine games found for venue, falling back to all active games');
    const { data: allGamesData, error: allGamesError } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('title');

    if (allGamesError) {
      console.error('Error fetching all active games:', allGamesError);
      throw allGamesError;
    }

    console.log('All active games fallback:', allGamesData?.length || 0);
    
    return (allGamesData || []).map(game => ({
      ...game,
      machine_game_id: '',
      is_machine_active: true
    }));
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
