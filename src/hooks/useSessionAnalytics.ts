
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSessionAnalytics = () => {
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ['sessionAnalytics'],
    queryFn: async () => {
      // First try to get from session_tracking (active sessions)
      const { data: trackingData, error: trackingError } = await supabase
        .from('session_tracking')
        .select(`
          *,
          games:game_id (title)
        `)
        .order('start_time', { ascending: false });

      if (trackingError) {
        console.error('Error fetching session tracking:', trackingError);
      }

      // Also get from session_history (completed sessions)
      const { data: historyData, error: historyError } = await supabase
        .from('session_history')
        .select(`
          *,
          games:game_id (title)
        `)
        .order('start_time', { ascending: false });

      if (historyError) {
        console.error('Error fetching session history:', historyError);
      }

      // Combine and deduplicate sessions
      const allSessions = [
        ...(trackingData || []),
        ...(historyData || [])
      ];

      // Remove duplicates by ID
      const uniqueSessions = allSessions.filter((session, index, self) => 
        index === self.findIndex(s => s.id === session.id)
      );

      return uniqueSessions.map(session => ({
        ...session,
        game_title: session.games?.title || 'Unknown Game'
      }));
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const { data: stats } = useQuery({
    queryKey: ['sessionStats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's sessions
      const { data: todaySessions } = await supabase
        .from('session_tracking')
        .select('*')
        .gte('start_time', today)
        .eq('status', 'completed');

      const totalSessions = todaySessions?.length || 0;
      const totalRevenue = todaySessions?.reduce((sum, session) => sum + (session.amount_paid || 0), 0) || 0;
      const avgDuration = todaySessions?.length > 0 
        ? todaySessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / todaySessions.length 
        : 0;

      return {
        totalSessions,
        totalRevenue,
        avgDuration
      };
    },
    refetchInterval: 5000,
  });

  return {
    sessions,
    stats,
    isLoading: sessionsLoading,
    refetchSessions
  };
};
