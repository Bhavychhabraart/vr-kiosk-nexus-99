
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GamePerformance } from '@/types/business';

export function usePopularGames() {
  const fetchPopularGames = async (): Promise<GamePerformance[]> => {
    const { data, error } = await supabase
      .from('popular_games')
      .select(`
        *,
        games!inner(title)
      `)
      .order('total_sessions', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item,
      game_title: item.games?.title,
      revenue_per_session: item.total_sessions > 0 
        ? Number(item.total_revenue) / item.total_sessions 
        : 0,
      engagement_score: Math.min(100, (item.average_rating || 0) * 20)
    }));
  };
  
  const { data: popularGames, isLoading, error } = useQuery({
    queryKey: ['popular-games'],
    queryFn: fetchPopularGames
  });
  
  return {
    popularGames,
    isLoading,
    error
  };
}
