
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VenueAnalyticsData {
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  totalRevenue: number;
  totalSessions: number;
  averageSessionDuration: number;
  revenueByPaymentMethod: {
    rfid: number;
    upi: number;
  };
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    sessions: number;
  }>;
  topGames: Array<{
    game_id: string;
    game_title: string;
    sessions: number;
    revenue: number;
  }>;
  sessionDetails: Array<{
    id: string;
    game_title: string;
    start_time: string;
    end_time: string;
    duration_seconds: number;
    amount_paid: number;
    payment_method: string;
    status: string;
  }>;
}

export const useVenueAnalytics = (
  venueId: string | null,
  dateRange: { start: string; end: string }
) => {
  return useQuery({
    queryKey: ['venueAnalytics', venueId, dateRange],
    queryFn: async (): Promise<VenueAnalyticsData | null> => {
      if (!venueId) return null;

      console.log('Fetching venue analytics for:', venueId, dateRange);

      // Get venue info
      const { data: venue } = await supabase
        .from('venues')
        .select('id, name, city, state')
        .eq('id', venueId)
        .single();

      if (!venue) return null;

      // Get session data with date filtering
      const { data: sessions } = await supabase
        .from('session_tracking')
        .select(`
          *,
          games:game_id (title)
        `)
        .eq('venue_id', venueId)
        .gte('start_time', dateRange.start)
        .lte('start_time', dateRange.end)
        .order('start_time', { ascending: false });

      // Get historical session data too
      const { data: historicalSessions } = await supabase
        .from('session_history')
        .select(`
          *,
          games:game_id (title)
        `)
        .eq('venue_id', venueId)
        .gte('start_time', dateRange.start)
        .lte('start_time', dateRange.end)
        .order('start_time', { ascending: false });

      // Combine all sessions
      const allSessions = [
        ...(sessions || []).map(s => ({ ...s, source: 'tracking' })),
        ...(historicalSessions || []).map(s => ({ ...s, source: 'history', payment_method: 'rfid' }))
      ];

      // Calculate metrics
      const totalRevenue = allSessions.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
      const totalSessions = allSessions.length;
      const completedSessions = allSessions.filter(s => s.status === 'completed' && s.duration_seconds);
      const averageSessionDuration = completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / completedSessions.length
        : 0;

      // Revenue by payment method
      const revenueByPaymentMethod = allSessions.reduce(
        (acc, s) => {
          const method = s.payment_method || 'rfid';
          acc[method as keyof typeof acc] += s.amount_paid || 0;
          return acc;
        },
        { rfid: 0, upi: 0 }
      );

      // Daily revenue aggregation
      const dailyRevenueMap = new Map<string, { revenue: number; sessions: number }>();
      allSessions.forEach(session => {
        const date = new Date(session.start_time).toISOString().split('T')[0];
        const existing = dailyRevenueMap.get(date) || { revenue: 0, sessions: 0 };
        dailyRevenueMap.set(date, {
          revenue: existing.revenue + (session.amount_paid || 0),
          sessions: existing.sessions + 1
        });
      });

      const dailyRevenue = Array.from(dailyRevenueMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top games
      const gameStatsMap = new Map<string, { game_title: string; sessions: number; revenue: number }>();
      allSessions.forEach(session => {
        const gameTitle = session.games?.title || 'Unknown Game';
        const existing = gameStatsMap.get(session.game_id) || { 
          game_title: gameTitle, 
          sessions: 0, 
          revenue: 0 
        };
        gameStatsMap.set(session.game_id, {
          game_title: gameTitle,
          sessions: existing.sessions + 1,
          revenue: existing.revenue + (session.amount_paid || 0)
        });
      });

      const topGames = Array.from(gameStatsMap.entries())
        .map(([game_id, stats]) => ({ game_id, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Session details for export
      const sessionDetails = allSessions.map(session => ({
        id: session.id,
        game_title: session.games?.title || 'Unknown Game',
        start_time: session.start_time,
        end_time: session.end_time || '',
        duration_seconds: session.duration_seconds || 0,
        amount_paid: session.amount_paid || 0,
        payment_method: session.payment_method || 'rfid',
        status: session.status
      }));

      return {
        venue,
        totalRevenue,
        totalSessions,
        averageSessionDuration,
        revenueByPaymentMethod,
        dailyRevenue,
        topGames,
        sessionDetails
      };
    },
    enabled: !!venueId,
  });
};
