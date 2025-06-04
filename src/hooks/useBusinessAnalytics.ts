
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BusinessAnalytics, BusinessMetrics } from '@/types/business';

export function useBusinessAnalytics() {
  const fetchBusinessAnalytics = async (): Promise<BusinessAnalytics[]> => {
    const { data, error } = await supabase
      .from('business_analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);
      
    if (error) throw error;
    return data || [];
  };
  
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['business-analytics'],
    queryFn: fetchBusinessAnalytics
  });
  
  const calculateBusinessMetrics = (analytics: BusinessAnalytics[]): BusinessMetrics | null => {
    if (!analytics || analytics.length === 0) return null;
    
    const latest = analytics[0];
    const monthlyRevenue = analytics
      .slice(0, 30)
      .reduce((sum, item) => sum + (Number(item.total_revenue) || 0), 0);
    
    return {
      totalRevenue: monthlyRevenue,
      totalVenues: latest.total_venues || 0,
      activeVenues: latest.active_venues || 0,
      totalCustomers: latest.total_customers || 0,
      averageSessionDuration: latest.average_session_duration || 0
    };
  };
  
  return {
    analytics,
    isLoading,
    error,
    businessMetrics: analytics ? calculateBusinessMetrics(analytics) : null
  };
}
