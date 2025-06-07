
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
      console.log('Fetching session analytics for venue:', selectedVenueId);
      
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

      console.log('Session tracking data:', trackingData?.length || 0, 'records');
      console.log('Session history data:', historyData?.length || 0, 'records');

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

      console.log('Total unique sessions found:', uniqueSessions.length);
      return uniqueSessions;
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const { data: stats } = useQuery({
    queryKey: ['sessionStats', selectedVenueId],
    queryFn: async () => {
      console.log('Fetching session stats for venue:', selectedVenueId);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's sessions from both tables
      let trackingQuery = supabase
        .from('session_tracking')
        .select('*')
        .gte('start_time', today);

      let historyQuery = supabase
        .from('session_history')
        .select('*')
        .gte('start_time', today);

      // Apply venue filter if specified
      if (selectedVenueId) {
        trackingQuery = trackingQuery.eq('venue_id', selectedVenueId);
        historyQuery = historyQuery.eq('venue_id', selectedVenueId);
      }

      const { data: trackingSessions } = await trackingQuery;
      const { data: historySessions } = await historyQuery;

      // Combine both datasets
      const allTodaySessions = [
        ...(trackingSessions || []),
        ...(historySessions || [])
      ];

      // Remove duplicates and count sessions
      const uniqueSessionIds = new Set();
      const uniqueSessions = allTodaySessions.filter(session => {
        if (uniqueSessionIds.has(session.id)) {
          return false;
        }
        uniqueSessionIds.add(session.id);
        return true;
      });

      console.log('Today\'s unique sessions:', uniqueSessions.length);

      const totalSessions = uniqueSessions.length;
      const totalRevenue = uniqueSessions.reduce((sum, session) => sum + (session.amount_paid || 0), 0);
      const completedSessions = uniqueSessions.filter(s => s.status === 'completed' && s.duration_seconds);
      const avgDuration = completedSessions.length > 0 
        ? completedSessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / completedSessions.length 
        : 0;

      const statsResult = {
        totalSessions,
        totalRevenue,
        avgDuration
      };

      console.log('Session stats result:', statsResult);
      return statsResult;
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
