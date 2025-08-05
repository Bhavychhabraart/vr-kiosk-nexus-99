
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface PasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const useAdminPassword = () => {
  // Set admin password with hashing
  const setAdminPassword = useMutation({
    mutationFn: async ({ venueId, password, enabled }: {
      venueId: string;
      password: string;
      enabled: boolean;
    }) => {
      // Hash the password using the new database function
      const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_password', {
        password: password
      });

      if (hashError) throw hashError;

      // Update venue settings with hashed password
      const { error: updateError } = await supabase
        .from('venue_settings')
        .upsert({
          venue_id: venueId,
          admin_password_hash: hashedPassword,
          password_protection_enabled: enabled,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      return { success: true, message: "Password updated successfully" };
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Password updated successfully"
      });
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
