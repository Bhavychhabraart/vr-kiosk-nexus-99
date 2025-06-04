
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Game } from '@/types';
import { MachineGames } from '@/types/machine';

export function useMachineGames(venueId?: string) {
  const queryClient = useQueryClient();

  // Fetch games assigned to a specific machine
  const fetchMachineGames = async (): Promise<Game[]> => {
    if (!venueId) return [];

    const { data, error } = await supabase
      .from('machine_games')
      .select(`
        *,
        games (*)
      `)
      .eq('venue_id', venueId)
      .eq('is_active', true);

    if (error) throw error;

    return data?.map(mg => mg.games).filter(Boolean) as Game[] || [];
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
      queryClient.invalidateQueries({ queryKey: ['machine-games'] });
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
        .update({ is_active: false })
        .eq('venue_id', venueId)
        .eq('game_id', gameId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-games'] });
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
      queryClient.invalidateQueries({ queryKey: ['machine-games'] });
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
    bulkAssignGames: (venueId: string, gameIds: string[], assignedBy: string) =>
      bulkAssignGames.mutate({ venueId, gameIds, assignedBy }),
    isAssigning: assignGameToMachine.isPending,
    isRemoving: removeGameFromMachine.isPending,
    isBulkAssigning: bulkAssignGames.isPending
  };
}
