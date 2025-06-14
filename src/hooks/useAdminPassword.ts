
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface PasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const useAdminPassword = () => {
  // Set admin password
  const setAdminPassword = useMutation({
    mutationFn: async ({ venueId, password, enabled }: {
      venueId: string;
      password: string;
      enabled: boolean;
    }) => {
      const { data, error } = await supabase.rpc('set_admin_password', {
        p_venue_id: venueId,
        p_password: password,
        p_enabled: enabled
      });

      if (error) throw error;
      return data as unknown as PasswordResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Password updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update password",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Verify admin password
  const verifyAdminPassword = useMutation({
    mutationFn: async ({ venueId, password }: {
      venueId: string;
      password: string;
    }) => {
      const { data, error } = await supabase.rpc('verify_admin_password', {
        p_venue_id: venueId,
        p_password: password
      });

      if (error) throw error;
      return data as boolean;
    }
  });

  return {
    setAdminPassword,
    verifyAdminPassword
  };
};
