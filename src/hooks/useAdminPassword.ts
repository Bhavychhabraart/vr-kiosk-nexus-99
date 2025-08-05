
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useAdminPassword() {
  const queryClient = useQueryClient();

  const setAdminPassword = useMutation({
    mutationFn: async ({ venueId, password, enabled }: { venueId: string; password: string; enabled: boolean }) => {
      // Hash the password using our database function
      const { data: hashedPassword, error: hashError } = await supabase
        .rpc('hash_password', { password });

      if (hashError) {
        throw new Error('Failed to hash password');
      }

      // Update venue settings with hashed password
      const { error: updateError } = await supabase
        .from('venue_settings')
        .update({
          admin_password_hash: hashedPassword,
          admin_password: null, // Clear old plain text password
          password_protection_enabled: enabled
        })
        .eq('venue_id', venueId);

      if (updateError) {
        throw updateError;
      }

      return { success: true };
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
    setAdminPassword: (venueId: string, password: string, enabled: boolean = true) => 
      setAdminPassword.mutate({ venueId, password, enabled }),
    verifyAdminPassword: (venueId: string, password: string) => 
      verifyAdminPassword.mutate({ venueId, password }),
    isSettingPassword: setAdminPassword.isPending,
    isVerifying: verifyAdminPassword.isPending
  };
}
