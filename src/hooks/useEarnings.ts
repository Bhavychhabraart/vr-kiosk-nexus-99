
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EarningsSummary } from '@/types/business';

export function useEarnings() {
  const fetchEarnings = async (): Promise<EarningsSummary[]> => {
    const { data, error } = await supabase
      .from('earnings_summary')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);
      
    if (error) throw error;
    return data || [];
  };
  
  const { data: earnings, isLoading, error } = useQuery({
    queryKey: ['earnings'],
    queryFn: fetchEarnings
  });
  
  const calculateTotals = (earnings: EarningsSummary[]) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const dailyEarnings = earnings.filter(e => e.date === today);
    const weeklyEarnings = earnings.filter(e => e.date >= weekAgo);
    const monthlyEarnings = earnings.filter(e => e.date >= monthAgo);
    
    return {
      daily: dailyEarnings.reduce((sum, e) => sum + (Number(e.total_revenue) || 0), 0),
      weekly: weeklyEarnings.reduce((sum, e) => sum + (Number(e.total_revenue) || 0), 0),
      monthly: monthlyEarnings.reduce((sum, e) => sum + (Number(e.total_revenue) || 0), 0),
      breakdown: {
        rfid: monthlyEarnings.reduce((sum, e) => sum + (Number(e.rfid_revenue) || 0), 0),
        upi: monthlyEarnings.reduce((sum, e) => sum + (Number(e.upi_revenue) || 0), 0)
      }
    };
  };
  
  return {
    earnings,
    isLoading,
    error,
    totals: earnings ? calculateTotals(earnings) : null
  };
}
