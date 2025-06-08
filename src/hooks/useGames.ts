
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Game, GameInsert, GameUpdate } from '@/types';

export function useGames() {
  const queryClient = useQueryClient();
  
  const fetchGames = async (): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('title');
      
    if (error) throw error;
    
    return data || [];
  };
  
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames
  });

  // Real-time subscription for games table changes
  useEffect(() => {
    console.log('Setting up real-time subscription for games');
    
    const channel = supabase
      .channel('games-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        (payload) => {
          console.log('Real-time games update received:', payload);
          
          // Invalidate all related queries immediately
          queryClient.invalidateQueries({ queryKey: ['games'] });
          queryClient.invalidateQueries({ queryKey: ['machine-games'] });
          queryClient.invalidateQueries({ queryKey: ['all-games'] });
          
          // Force refetch of games query to ensure UI updates
          queryClient.refetchQueries({ queryKey: ['games'] });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription for games');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  const createGame = useMutation({
    mutationFn: async (newGame: GameInsert) => {
      const { data, error } = await supabase
        .from('games')
        .insert(newGame)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all game-related queries
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['machine-games'] });
      queryClient.invalidateQueries({ queryKey: ['all-games'] });
      toast({
        title: "Game created",
        description: "The game has been successfully added",
      });
      
      // Sync with Python backend
      syncGamesToPythonBackend();
    },
    onError: (error) => {
      toast({
        title: "Error creating game",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateGame = useMutation({
    mutationFn: async (game: GameUpdate) => {
      const { data, error } = await supabase
        .from('games')
        .update(game)
        .eq('id', game.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all game-related queries
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['machine-games'] });
      queryClient.invalidateQueries({ queryKey: ['all-games'] });
      toast({
        title: "Game updated",
        description: "The game has been successfully updated",
      });
      
      // Sync with Python backend
      syncGamesToPythonBackend();
    },
    onError: (error) => {
      toast({
        title: "Error updating game",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteGame = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidate all game-related queries
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['machine-games'] });
      queryClient.invalidateQueries({ queryKey: ['all-games'] });
      toast({
        title: "Game deleted",
        description: "The game has been successfully deleted",
      });
      
      // Sync with Python backend
      syncGamesToPythonBackend();
    },
    onError: (error) => {
      toast({
        title: "Error deleting game",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const toggleGameStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      console.log('Toggling game status:', { id, isActive });
      
      const { data, error } = await supabase
        .from('games')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Game status toggle success:', data);
      
      // Invalidate all game-related queries to ensure all components update
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['machine-games'] });
      queryClient.invalidateQueries({ queryKey: ['all-games'] });
      
      // Force refetch to ensure immediate UI updates
      queryClient.refetchQueries({ queryKey: ['games'] });
      
      toast({
        title: "Status updated",
        description: "Game status has been updated",
      });
      
      // Sync with Python backend
      syncGamesToPythonBackend();
    },
    onError: (error) => {
      console.error('Game status toggle error:', error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Helper function to sync games to Python backend
  const syncGamesToPythonBackend = async () => {
    try {
      // Fetch all games to sync
      const { data: allGames } = await supabase.from('games').select('*');
      
      if (!allGames) return;
      
      // Format the games for Python backend
      const pythonFormatGames = {
        games: allGames.map(game => ({
          id: game.id,
          title: game.title,
          executable_path: game.executable_path || "",
          working_directory: game.working_directory || "",
          arguments: game.arguments || "",
          description: game.description || "",
          image_url: game.image_url || "",
          min_duration_seconds: game.min_duration_seconds,
          max_duration_seconds: game.max_duration_seconds
        }))
      };
      
      // In a real app, we would make a call to update the Python backend's games.json
      // This would typically be handled by an API endpoint or a server-side function
      console.log('Syncing games to Python backend:', pythonFormatGames);
      
      // Code to make HTTP request to update Python backend would go here
      // For this example, we'll just log it
    } catch (error) {
      console.error('Error syncing games to Python backend:', error);
    }
  };
  
  return {
    games,
    isLoading,
    error,
    createGame: (game: GameInsert) => createGame.mutate(game),
    updateGame: (game: GameUpdate) => updateGame.mutate(game),
    deleteGame: (id: string) => deleteGame.mutate(id),
    toggleGameStatus: (id: string, isActive: boolean) => 
      toggleGameStatus.mutate({ id, isActive }),
    isCreating: createGame.isPending,
    isUpdating: updateGame.isPending,
    isDeleting: deleteGame.isPending
  };
}
