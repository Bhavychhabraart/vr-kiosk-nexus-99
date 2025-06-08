
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Game } from '@/types';
import { useEffect } from 'react';

interface MachineGameWithStatus extends Game {
  machine_game_id: string;
  is_machine_active: boolean;
  assigned_at: string;
  assigned_by: string;
}

export function useMachineGames(venueId?: string) {
  const queryClient = useQueryClient();

  // Fetch games assigned to a specific machine (both active and inactive)
  const fetchMachineGames = async (): Promise<MachineGameWithStatus[]> => {
    if (!venueId) return [];

    console.log('Fetching machine games for venue:', venueId);

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
      console.error('Error fetching machine games:', error);
      throw error;
    }

    console.log('Raw machine games data:', data);

    const mappedData = data?.map(mg => ({
      ...mg.games,
      machine_game_id: mg.id,
      is_machine_active: mg.is_active,
      assigned_at: mg.assigned_at,
      assigned_by: mg.assigned_by
    })) as MachineGameWithStatus[] || [];

    console.log('Mapped machine games:', mappedData);
    return mappedData;
  };

  // Fetch all available games (for Super Admin)
  const fetchAllGames = async (): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('title');

    if (error) throw error;
    return data || [];
  };

  const { data: machineGames, isLoading: isLoadingMachineGames } = useQuery({
    queryKey: ['machine-games', venueId],
    queryFn: fetchMachineGames,
    enabled: !!venueId
  });

  const { data: allGames, isLoading: isLoadingAllGames } = useQuery({
    queryKey: ['all-games'],
    queryFn: fetchAllGames
  });

  // Real-time subscription for games and machine_games table changes
  useEffect(() => {
    if (!venueId) return;
    
    console.log('Setting up real-time subscription for machine games');
    
    const channel = supabase
      .channel('machine-games-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        (payload) => {
          console.log('Real-time games update received in useMachineGames:', payload);
          
          // Invalidate queries to ensure consistency
          queryClient.invalidateQueries({ queryKey: ['machine-games', venueId] });
          queryClient.invalidateQueries({ queryKey: ['all-games'] });
          queryClient.invalidateQueries({ queryKey: ['games'] });
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
          
          // Invalidate queries to ensure consistency
          queryClient.invalidateQueries({ queryKey: ['machine-games', venueId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription for machine games');
      supabase.removeChannel(channel);
    };
  }, [queryClient, venueId]);

  // Toggle game status for machine with optimistic updates
  const toggleGameStatus = useMutation({
    mutationFn: async ({ machineGameId, isActive }: { machineGameId: string; isActive: boolean }) => {
      console.log('Toggling game status:', { machineGameId, isActive });
      
      const { data, error } = await supabase
        .from('machine_games')
        .update({ is_active: isActive })
        .eq('id', machineGameId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling game status:', error);
        throw error;
      }
      
      console.log('Toggle response:', data);
      return data;
    },
    onMutate: async ({ machineGameId, isActive }) => {
      console.log('Optimistic update:', { machineGameId, isActive });
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['machine-games', venueId] });

      // Snapshot the previous value
      const previousGames = queryClient.getQueryData(['machine-games', venueId]) as MachineGameWithStatus[];

      // Optimistically update to the new value
      if (previousGames) {
        const updatedGames = previousGames.map(game => 
          game.machine_game_id === machineGameId 
            ? { ...game, is_machine_active: isActive }
            : game
        );
        
        console.log('Setting optimistic data:', updatedGames);
        queryClient.setQueryData(['machine-games', venueId], updatedGames);
      }

      // Return a context object with the snapshotted value
      return { previousGames };
    },
    onError: (err, { machineGameId, isActive }, context) => {
      console.error('Toggle mutation failed:', err);
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGames) {
        queryClient.setQueryData(['machine-games', venueId], context.previousGames);
      }
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update game status",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      console.log('Toggle mutation succeeded:', data);
      toast({
        title: "Game Status Updated",
        description: "Game status has been successfully updated",
      });
    },
    onSettled: () => {
      console.log('Toggle mutation settled, invalidating queries');
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['machine-games', venueId] });
    }
  });

  // Assign game to machine
  const assignGameToMachine = useMutation({
    mutationFn: async ({ venueId, gameId, assignedBy }: { venueId: string; gameId: string; assignedBy: string }) => {
      const { data, error } = await supabase
        .from('machine_games')
        .upsert({
          venue_id: venueId,
          game_id: gameId,
          is_active: true,
          assigned_by: assignedBy
        }, {
          onConflict: 'venue_id,game_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-games', venueId] });
      queryClient.invalidateQueries({ queryKey: ['all-games'] });
      toast({
        title: "Game Assigned",
        description: "Game has been successfully assigned to the machine",
      });
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Remove game from machine
  const removeGameFromMachine = useMutation({
    mutationFn: async ({ venueId, gameId }: { venueId: string; gameId: string }) => {
      const { error } = await supabase
        .from('machine_games')
        .delete()
        .eq('venue_id', venueId)
        .eq('game_id', gameId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-games', venueId] });
      queryClient.invalidateQueries({ queryKey: ['all-games'] });
      toast({
        title: "Game Removed",
        description: "Game has been removed from the machine",
      });
    },
    onError: (error) => {
      toast({
        title: "Removal Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Bulk assign games to machine
  const bulkAssignGames = useMutation({
    mutationFn: async ({ venueId, gameIds, assignedBy }: { venueId: string; gameIds: string[]; assignedBy: string }) => {
      const assignments = gameIds.map(gameId => ({
        venue_id: venueId,
        game_id: gameId,
        is_active: true,
        assigned_by: assignedBy
      }));

      const { data, error } = await supabase
        .from('machine_games')
        .upsert(assignments, {
          onConflict: 'venue_id,game_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-games', venueId] });
      queryClient.invalidateQueries({ queryKey: ['all-games'] });
      toast({
        title: "Bulk Assignment Complete",
        description: "Selected games have been assigned to the machine",
      });
    },
    onError: (error) => {
      toast({
        title: "Bulk Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    machineGames,
    allGames,
    isLoadingMachineGames,
    isLoadingAllGames,
    assignGame: (venueId: string, gameId: string, assignedBy: string) =>
      assignGameToMachine.mutate({ venueId, gameId, assignedBy }),
    removeGame: (venueId: string, gameId: string) =>
      removeGameFromMachine.mutate({ venueId, gameId }),
    toggleGameStatus: (machineGameId: string, isActive: boolean) =>
      toggleGameStatus.mutate({ machineGameId, isActive }),
    bulkAssignGames: (venueId: string, gameIds: string[], assignedBy: string) =>
      bulkAssignGames.mutate({ venueId, gameIds, assignedBy }),
    isAssigning: assignGameToMachine.isPending,
    isRemoving: removeGameFromMachine.isPending,
    isToggling: toggleGameStatus.isPending,
    isBulkAssigning: bulkAssignGames.isPending
  };
}
