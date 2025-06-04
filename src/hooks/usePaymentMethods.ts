
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { PaymentMethod, PaymentMethodUpdate } from '@/types/business';

export function usePaymentMethods() {
  const queryClient = useQueryClient();
  
  const fetchPaymentMethods = async (): Promise<PaymentMethod | null> => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .limit(1)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  };
  
  const { data: paymentMethods, isLoading, error } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods
  });
  
  const updatePaymentMethods = useMutation({
    mutationFn: async (updates: PaymentMethodUpdate) => {
      if (!paymentMethods?.id) throw new Error('No payment methods found');
      
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', paymentMethods.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({
        title: "Payment settings updated",
        description: "Payment method configuration has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating payment settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    paymentMethods,
    isLoading,
    error,
    updatePaymentMethods: (updates: PaymentMethodUpdate) => updatePaymentMethods.mutate(updates),
    isUpdating: updatePaymentMethods.isPending
  };
}
