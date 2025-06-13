
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from "date-fns";

export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

interface ComprehensiveAnalytics {
  currentPeriod: {
    sessions: number;
    revenue: number;
    avgDuration: number;
    uniqueCustomers: number;
  };
  previousPeriod: {
    sessions: number;
    revenue: number;
    avgDuration: number;
    uniqueCustomers: number;
  };
  trends: {
    sessionsChange: number;
    revenueChange: number;
    durationChange: number;
    customersChange: number;
  };
  timeDistribution: Array<{
    period: string;
    sessions: number;
    revenue: number;
  }>;
  gamePerformance: Array<{
    gameId: string;
    gameTitle: string;
    sessions: number;
    revenue: number;
    avgDuration: number;
  }>;
  sessionsByHour: Array<{
    hour: number;
    sessions: number;
  }>;
}

export const useComprehensiveAnalytics = (
  venueId: string,
  timePeriod: TimePeriod,
  customRange?: { start: Date; end: Date }
) => {
  return useQuery({
    queryKey: ['comprehensiveAnalytics', venueId, timePeriod, customRange],
    queryFn: async (): Promise<ComprehensiveAnalytics> => {
      const now = new Date();
      let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

      // Calculate date ranges based on time period
      switch (timePeriod) {
        case 'today':
          currentStart = startOfDay(now);
          currentEnd = endOfDay(now);
          previousStart = startOfDay(subDays(now, 1));
          previousEnd = endOfDay(subDays(now, 1));
          break;
        case 'week':
          currentStart = startOfWeek(now);
          currentEnd = endOfWeek(now);
          previousStart = startOfWeek(subWeeks(now, 1));
          previousEnd = endOfWeek(subWeeks(now, 1));
          break;
        case 'month':
          currentStart = startOfMonth(now);
          currentEnd = endOfMonth(now);
          previousStart = startOfMonth(subMonths(now, 1));
          previousEnd = endOfMonth(subMonths(now, 1));
          break;
        case 'year':
          currentStart = startOfYear(now);
          currentEnd = endOfYear(now);
          previousStart = startOfYear(subYears(now, 1));
          previousEnd = endOfYear(subYears(now, 1));
          break;
        case 'custom':
          if (!customRange) throw new Error('Custom range required');
          currentStart = customRange.start;
          currentEnd = customRange.end;
          const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
          previousStart = new Date(currentStart.getTime() - daysDiff * 24 * 60 * 60 * 1000);
          previousEnd = new Date(currentEnd.getTime() - daysDiff * 24 * 60 * 60 * 1000);
          break;
        default:
          throw new Error('Invalid time period');
      }

      // Fetch current period data
      const { data: currentSessions } = await supabase
        .from('session_tracking')
        .select(`
          *,
          games:game_id (title)
        `)
        .eq('venue_id', venueId)
        .gte('start_time', currentStart.toISOString())
        .lte('start_time', currentEnd.toISOString())
        .order('start_time', { ascending: false });

      // Fetch previous period data
      const { data: previousSessions } = await supabase
        .from('session_tracking')
        .select('*')
        .eq('venue_id', venueId)
        .gte('start_time', previousStart.toISOString())
        .lte('start_time', previousEnd.toISOString());

      // Calculate current period metrics
      const currentMetrics = calculateMetrics(currentSessions || []);
      const previousMetrics = calculateMetrics(previousSessions || []);

      // Calculate trends (percentage change)
      const trends = {
        sessionsChange: calculatePercentageChange(previousMetrics.sessions, currentMetrics.sessions),
        revenueChange: calculatePercentageChange(previousMetrics.revenue, currentMetrics.revenue),
        durationChange: calculatePercentageChange(previousMetrics.avgDuration, currentMetrics.avgDuration),
        customersChange: calculatePercentageChange(previousMetrics.uniqueCustomers, currentMetrics.uniqueCustomers)
      };

      // Generate time distribution based on period
      const timeDistribution = generateTimeDistribution(currentSessions || [], timePeriod, currentStart, currentEnd);

      // Game performance analysis
      const gamePerformance = generateGamePerformance(currentSessions || []);

      // Sessions by hour analysis
      const sessionsByHour = generateSessionsByHour(currentSessions || []);

      return {
        currentPeriod: currentMetrics,
        previousPeriod: previousMetrics,
        trends,
        timeDistribution,
        gamePerformance,
        sessionsByHour
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

function calculateMetrics(sessions: any[]) {
  const totalSessions = sessions.length;
  const totalRevenue = sessions.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.duration_seconds);
  const avgDuration = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / completedSessions.length
    : 0;
  const uniqueCustomers = new Set(sessions.map(s => s.rfid_tag).filter(Boolean)).size;

  return {
    sessions: totalSessions,
    revenue: totalRevenue,
    avgDuration,
    uniqueCustomers
  };
}

function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

function generateTimeDistribution(sessions: any[], period: TimePeriod, start: Date, end: Date) {
  // Implementation varies by period - group sessions by day/week/month
  const grouped = new Map<string, { sessions: number; revenue: number }>();
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.start_time);
    let key: string;
    
    switch (period) {
      case 'today':
        key = sessionDate.getHours().toString().padStart(2, '0') + ':00';
        break;
      case 'week':
        key = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'month':
        key = sessionDate.getDate().toString();
        break;
      case 'year':
        key = sessionDate.toLocaleDateString('en-US', { month: 'short' });
        break;
      default:
        key = sessionDate.toLocaleDateString();
    }
    
    const existing = grouped.get(key) || { sessions: 0, revenue: 0 };
    grouped.set(key, {
      sessions: existing.sessions + 1,
      revenue: existing.revenue + (session.amount_paid || 0)
    });
  });
  
  return Array.from(grouped.entries()).map(([period, data]) => ({
    period,
    sessions: data.sessions,
    revenue: data.revenue
  }));
}

function generateGamePerformance(sessions: any[]) {
  const gameMap = new Map();
  
  sessions.forEach(session => {
    const gameId = session.game_id;
    const gameTitle = session.games?.title || 'Unknown Game';
    
    if (!gameMap.has(gameId)) {
      gameMap.set(gameId, {
        gameId,
        gameTitle,
        sessions: 0,
        revenue: 0,
        totalDuration: 0,
        completedSessions: 0
      });
    }
    
    const game = gameMap.get(gameId);
    game.sessions += 1;
    game.revenue += session.amount_paid || 0;
    
    if (session.status === 'completed' && session.duration_seconds) {
      game.totalDuration += session.duration_seconds;
      game.completedSessions += 1;
    }
  });
  
  return Array.from(gameMap.values()).map(game => ({
    ...game,
    avgDuration: game.completedSessions > 0 ? game.totalDuration / game.completedSessions : 0
  })).sort((a, b) => b.sessions - a.sessions);
}

function generateSessionsByHour(sessions: any[]) {
  const hourMap = new Map<number, number>();
  
  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourMap.set(i, 0);
  }
  
  sessions.forEach(session => {
    const hour = new Date(session.start_time).getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });
  
  return Array.from(hourMap.entries()).map(([hour, sessions]) => ({
    hour,
    sessions
  }));
}
