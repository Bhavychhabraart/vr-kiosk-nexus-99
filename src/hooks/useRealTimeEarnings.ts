
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

interface RealTimeEarnings {
  today: {
    sessions: number;
    revenue: number;
    rfid: number;
    upi: number;
  };
  week: {
    sessions: number;
    revenue: number;
    rfid: number;
    upi: number;
  };
  month: {
    sessions: number;
    revenue: number;
    rfid: number;
    upi: number;
  };
  year: {
    sessions: number;
    revenue: number;
    rfid: number;
    upi: number;
  };
}

export const useRealTimeEarnings = (venueId: string) => {
  return useQuery({
    queryKey: ['realTimeEarnings', venueId],
    queryFn: async (): Promise<RealTimeEarnings> => {
      const now = new Date();
      const todayStart = startOfDay(now);
      const weekStart = startOfWeek(now);
      const monthStart = startOfMonth(now);
      const yearStart = startOfYear(now);

      // Fetch all sessions for this venue from the start of the year
      const { data: sessions } = await supabase
        .from('session_tracking')
        .select('*')
        .eq('venue_id', venueId)
        .gte('start_time', yearStart.toISOString())
        .order('start_time', { ascending: false });

      if (!sessions) {
        return {
          today: { sessions: 0, revenue: 0, rfid: 0, upi: 0 },
          week: { sessions: 0, revenue: 0, rfid: 0, upi: 0 },
          month: { sessions: 0, revenue: 0, rfid: 0, upi: 0 },
          year: { sessions: 0, revenue: 0, rfid: 0, upi: 0 }
        };
      }

      const calculatePeriodData = (startDate: Date) => {
        const periodSessions = sessions.filter(s => new Date(s.start_time) >= startDate);
        const totalRevenue = periodSessions.reduce((sum, s) => sum + (Number(s.amount_paid) || 0), 0);
        const rfidRevenue = periodSessions
          .filter(s => s.payment_method === 'rfid')
          .reduce((sum, s) => sum + (Number(s.amount_paid) || 0), 0);
        const upiRevenue = periodSessions
          .filter(s => s.payment_method === 'upi')
          .reduce((sum, s) => sum + (Number(s.amount_paid) || 0), 0);

        return {
          sessions: periodSessions.length,
          revenue: totalRevenue,
          rfid: rfidRevenue,
          upi: upiRevenue
        };
      };

      return {
        today: calculatePeriodData(todayStart),
        week: calculatePeriodData(weekStart),
        month: calculatePeriodData(monthStart),
        year: calculatePeriodData(yearStart)
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
