
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { KioskOwner, KioskOwnerInsert, KioskOwnerUpdate } from '@/types/business';

export function useKioskOwner() {
  const queryClient = useQueryClient();
  
  const fetchKioskOwner = async (): Promise<KioskOwner | null> => {
    const { data, error } = await supabase
      .from('kiosk_owners')
      .select('*')
      .limit(1)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  };
  
  const { data: kioskOwner, isLoading, error } = useQuery({
    queryKey: ['kiosk-owner'],
    queryFn: fetchKioskOwner
  });
  
  const updateKioskOwner = useMutation({
    mutationFn: async (updates: KioskOwnerUpdate) => {
      if (!kioskOwner?.id) throw new Error('No kiosk owner found');
      
      const { data, error } = await supabase
        .from('kiosk_owners')
        .update(updates)
        .eq('id', kioskOwner.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosk-owner'] });
      toast({
        title: "Kiosk information updated",
        description: "Your kiosk details have been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating kiosk information",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    kioskOwner,
    isLoading,
    error,
    updateKioskOwner: (updates: KioskOwnerUpdate) => updateKioskOwner.mutate(updates),
    isUpdating: updateKioskOwner.isPending
  };
}
