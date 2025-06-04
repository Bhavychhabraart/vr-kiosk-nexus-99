
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductPreview } from '@/types/business';

export function useUpcomingProducts() {
  const fetchUpcomingProducts = async (): Promise<ProductPreview[]> => {
    const { data, error } = await supabase
      .from('upcoming_products')
      .select('*')
      .order('release_date', { ascending: true });
      
    if (error) throw error;
    
    return (data || []).map(product => ({
      ...product,
      is_featured: product.status === 'pre_order',
      demo_available: product.status === 'beta_testing'
    }));
  };
  
  const { data: upcomingProducts, isLoading, error } = useQuery({
    queryKey: ['upcoming-products'],
    queryFn: fetchUpcomingProducts
  });
  
  return {
    upcomingProducts,
    isLoading,
    error
  };
}
