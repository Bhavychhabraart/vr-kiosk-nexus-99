
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useGameAssignment() {
  const queryClient = useQueryClient();

  // Function to assign all active games to a venue
  const assignAllGamesToVenue = useMutation({
    mutationFn: async (venueId: string) => {
      console.log('=== Assigning All Active Games to Venue ===');
      console.log('Venue ID:', venueId);

      // First, get all active games
      const { data: activeGames, error: gamesError } = await supabase
        .from('games')
        .select('id, title')
        .eq('is_active', true);

      if (gamesError) {
        console.error('Error fetching active games:', gamesError);
        throw gamesError;
      }

      if (!activeGames || activeGames.length === 0) {
        console.log('No active games found to assign');
        return { assigned: 0, games: [] };
      }

      console.log('Found active games to assign:', activeGames.length);

      // Assign each game to the venue (using ON CONFLICT to avoid duplicates)
      const assignments = activeGames.map(game => ({
        venue_id: venueId,
        game_id: game.id,
        is_active: true,
        assigned_by: 'auto-assignment'
      }));

      const { data, error } = await supabase
        .from('machine_games')
        .upsert(assignments, {
          onConflict: 'venue_id,game_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('Error assigning games to venue:', error);
        throw error;
      }

      console.log('Successfully assigned games:', data?.length || 0);
      return { assigned: data?.length || 0, games: activeGames };
    },
    onSuccess: (result, venueId) => {
      console.log('Game assignment success:', result);
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['customer-games', venueId] });
      queryClient.invalidateQueries({ queryKey: ['venue-games', venueId] });
      queryClient.invalidateQueries({ queryKey: ['machine-games', venueId] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['customer-games', venueId] });
      queryClient.refetchQueries({ queryKey: ['venue-games', venueId] });
      
      toast({
        title: "Games Assigned",
        description: `${result.assigned} active games have been assigned to this venue`,
      });
    },
    onError: (error) => {
      console.error('Game assignment error:', error);
      toast({
        title: "Error assigning games",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    assignAllGamesToVenue: (venueId: string) => assignAllGamesToVenue.mutate(venueId),
    isAssigning: assignAllGamesToVenue.isPending
  };
}
