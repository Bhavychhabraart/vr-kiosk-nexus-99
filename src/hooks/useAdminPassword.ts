
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useAdminPassword() {
  const queryClient = useQueryClient();

  const setAdminPassword = useMutation({
    mutationFn: async ({ venueId, password, enabled }: { venueId: string; password: string; enabled: boolean }) => {
      // Use the set_admin_password function which should handle hashing internally
      const { data, error } = await supabase
        .rpc('set_admin_password', {
          p_venue_id: venueId,
          p_password: password,
          p_enabled: enabled
        });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-settings'] });
      toast({
        title: "Password Updated",
        description: "Admin password has been securely updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const verifyAdminPassword = useMutation({
    mutationFn: async ({ venueId, password }: { venueId: string; password: string }) => {
      const { data: isValid, error } = await supabase
        .rpc('verify_admin_password', { 
          p_venue_id: venueId, 
          p_password: password 
        });

      if (error) {
        throw error;
      }

      return isValid;
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    setAdminPassword,
    verifyAdminPassword,
    isSettingPassword: setAdminPassword.isPending,
    isVerifying: verifyAdminPassword.isPending
  };
}
