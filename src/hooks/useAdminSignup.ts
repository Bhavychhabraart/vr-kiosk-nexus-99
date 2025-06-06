
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SignupValidationResult {
  success: boolean;
  venue?: {
    id: string;
    name: string;
    city: string;
    state: string;
    machine_model: string;
    serial_number: string;
  };
  auth?: {
    product_id: string;
    access_level: string;
  };
  error?: string;
}

export function useAdminSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [validatedVenue, setValidatedVenue] = useState<SignupValidationResult['venue'] | null>(null);

  const validateProductKey = async (productKey: string): Promise<SignupValidationResult> => {
    try {
      const { data, error } = await supabase.rpc('validate_signup_product_key', {
        p_product_key: productKey
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (result.success) {
        setValidatedVenue(result.venue);
      }
      
      return result;
    } catch (error) {
      console.error('Product key validation error:', error);
      return {
        success: false,
        error: 'Failed to validate product key. Please try again.'
      };
    }
  };

  const signUpAdmin = async (
    email: string, 
    password: string, 
    fullName: string, 
    productKey: string
  ) => {
    setIsLoading(true);
    try {
      // First validate the product key again
      const validation = await validateProductKey(productKey);
      if (!validation.success) {
        toast({
          variant: "destructive",
          title: "Invalid Product Key",
          description: validation.error,
        });
        return { error: validation.error };
      }

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/machine-admin`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: authError.message,
        });
        return { error: authError.message };
      }

      // If user was created successfully, complete the admin signup
      if (authData.user) {
        const { data: roleData, error: roleError } = await supabase.rpc('complete_admin_signup', {
          p_user_id: authData.user.id,
          p_product_key: productKey
        });

        if (roleError) {
          console.error('Role assignment error:', roleError);
          toast({
            variant: "destructive",
            title: "Setup Incomplete",
            description: "Account created but admin role assignment failed. Please contact support.",
          });
          return { error: "Role assignment failed" };
        }

        const roleResult = typeof roleData === 'string' ? JSON.parse(roleData) : roleData;
        
        if (!roleResult.success) {
          toast({
            variant: "destructive",
            title: "Setup Failed",
            description: roleResult.error,
          });
          return { error: roleResult.error };
        }

        toast({
          title: "Welcome!",
          description: `Admin account created successfully for ${validatedVenue?.name}. Please check your email to verify your account.`,
        });

        return { success: true, user: authData.user };
      }

      return { error: "Unknown error occurred" };
    } catch (error: any) {
      console.error('Admin signup error:', error);
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
      });
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    validatedVenue,
    validateProductKey,
    signUpAdmin,
    clearValidation: () => setValidatedVenue(null)
  };
}
