
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define a unified session type that combines both table schemas
interface UnifiedSession {
  id: string;
  game_id: string;
  venue_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  status: string;
  rating?: number;
  rfid_tag?: string;
  // Fields from session_tracking only
  session_id?: string;
  payment_method?: string;
  amount_paid?: number;
  // Fields from session_history only  
  customer_id?: string;
  notes?: string;
  // Computed field
  game_title: string;
}

export const useSessionAnalytics = (selectedVenueId?: string | null) => {
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ['sessionAnalytics', selectedVenueId],
    queryFn: async (): Promise<UnifiedSession[]> => {
      // Build tracking query
      let trackingQuery = supabase
        .from('session_tracking')
        .select(`
          *,
          games:game_id (title)
        `)
        .order('start_time', { ascending: false });

      // Build history query
      let historyQuery = supabase
        .from('session_history')
        .select(`
          *,
          games:game_id (title)
        `)
        .order('start_time', { ascending: false });

      // Apply venue filter if specified
      if (selectedVenueId) {
        trackingQuery = trackingQuery.eq('venue_id', selectedVenueId);
        historyQuery = historyQuery.eq('venue_id', selectedVenueId);
      }

      const { data: trackingData, error: trackingError } = await trackingQuery;
      const { data: historyData, error: historyError } = await historyQuery;

      if (trackingError) {
        console.error('Error fetching session tracking:', trackingError);
      }

      if (historyError) {
        console.error('Error fetching session history:', historyError);
      }

      // Transform session_tracking data
      const trackingSessions: UnifiedSession[] = (trackingData || []).map(session => ({
        id: session.id,
        game_id: session.game_id,
        venue_id: session.venue_id,
        start_time: session.start_time,
        end_time: session.end_time,
        duration_seconds: session.duration_seconds,
        status: session.status,
        rating: session.rating,
        rfid_tag: session.rfid_tag,
        session_id: session.session_id,
        payment_method: session.payment_method,
        amount_paid: session.amount_paid,
        game_title: session.games?.title || 'Unknown Game'
      }));

      // Transform session_history data
      const historySessions: UnifiedSession[] = (historyData || []).map(session => ({
        id: session.id,
        game_id: session.game_id,
        venue_id: session.venue_id,
        start_time: session.start_time,
        end_time: session.end_time,
        duration_seconds: session.duration_seconds,
        status: session.status,
        rating: session.rating,
        rfid_tag: session.rfid_tag,
        customer_id: session.customer_id,
        notes: session.notes,
        // Default values for missing fields
        amount_paid: 0,
        payment_method: 'rfid',
        game_title: session.games?.title || 'Unknown Game'
      }));

      // Combine and deduplicate sessions
      const allSessions = [...trackingSessions, ...historySessions];

      // Remove duplicates by ID (session_tracking takes precedence)
      const uniqueSessions = allSessions.filter((session, index, self) => 
        index === self.findIndex(s => s.id === session.id)
      );

      return uniqueSessions;
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const { data: stats } = useQuery({
    queryKey: ['sessionStats', selectedVenueId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Use the same unified session data for stats calculation
      if (!sessions) return { totalSessions: 0, totalRevenue: 0, avgDuration: 0 };

      // Filter today's completed sessions from unified data
      const todaySessions = sessions.filter(session => {
        const sessionDate = new Date(session.start_time).toISOString().split('T')[0];
        return sessionDate === today && session.status === 'completed';
      });

      const totalSessions = todaySessions.length;
      const totalRevenue = todaySessions.reduce((sum, session) => sum + (session.amount_paid || 0), 0);
      const avgDuration = todaySessions.length > 0 
        ? todaySessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / todaySessions.length 
        : 0;

      return {
        totalSessions,
        totalRevenue,
        avgDuration
      };
    },
    enabled: !!sessions, // Only run when sessions data is available
    refetchInterval: 5000,
  });

  return {
    sessions,
    stats,
    isLoading: sessionsLoading,
    refetchSessions
  };
};
