
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
  debugInfo?: any;
}

export function useAdminSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [validatedVenue, setValidatedVenue] = useState<SignupValidationResult['venue'] | null>(null);
  const [isSendingConfirmation, setIsSendingConfirmation] = useState(false);

  const validateProductKey = async (productKey: string): Promise<SignupValidationResult> => {
    try {
      // Clean and normalize the product key
      const cleanedProductKey = productKey.trim().toUpperCase();
      console.log('Validating product key:', cleanedProductKey);
      
      // Enhanced format validation
      if (!cleanedProductKey.startsWith('AUTH-')) {
        return {
          success: false,
          error: 'Product key must start with "AUTH-". Please enter the complete product key.',
          debugInfo: { reason: 'invalid_format', providedKey: cleanedProductKey }
        };
      }

      if (cleanedProductKey.length < 15) {
        return {
          success: false,
          error: 'Product key appears incomplete. Expected format: AUTH-XXX-XXX-XXXX',
          debugInfo: { reason: 'incomplete_key', providedKey: cleanedProductKey }
        };
      }
      
      // First, check if the product key exists at all
      const { data: authCheck, error: authError } = await supabase
        .from('machine_auth')
        .select('*')
        .eq('product_key', cleanedProductKey);

      console.log('Auth check result:', { authCheck, authError });

      if (authError) {
        console.error('Database error during auth check:', authError);
        return {
          success: false,
          error: 'Database error occurred while validating product key',
          debugInfo: { authError }
        };
      }

      if (!authCheck || authCheck.length === 0) {
        console.log('No matching product key found');
        return {
          success: false,
          error: 'Product key not found in database. Please check that you copied the complete key from the table above.',
          debugInfo: { searchedKey: cleanedProductKey }
        };
      }

      const authRecord = authCheck[0];
      console.log('Found auth record:', authRecord);

      // Check if the auth record is active
      if (!authRecord.is_active) {
        return {
          success: false,
          error: 'This product key has been deactivated. Please contact support.',
          debugInfo: { reason: 'auth_inactive' }
        };
      }

      // Check if the auth record has expired
      if (authRecord.expires_at && new Date(authRecord.expires_at) < new Date()) {
        return {
          success: false,
          error: 'This product key has expired. Please contact support for renewal.',
          debugInfo: { reason: 'auth_expired', expires_at: authRecord.expires_at }
        };
      }

      // Now get the venue information
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('*')
        .eq('id', authRecord.venue_id)
        .maybeSingle();

      console.log('Venue check result:', { venueData, venueError });

      if (venueError) {
        console.error('Database error during venue check:', venueError);
        return {
          success: false,
          error: 'Database error occurred while validating venue',
          debugInfo: { venueError }
        };
      }

      if (!venueData) {
        return {
          success: false,
          error: 'Associated venue not found in database',
          debugInfo: { venue_id: authRecord.venue_id }
        };
      }

      if (venueData.status !== 'active') {
        return {
          success: false,
          error: 'The venue associated with this product key is not active',
          debugInfo: { venue_status: venueData.status }
        };
      }

      // Check if machine already has an admin
      const { data: existingRole, error: roleError } = await supabase
        .from('simplified_user_roles')
        .select('id')
        .eq('venue_id', authRecord.venue_id)
        .eq('role', 'machine_admin')
        .eq('is_active', true)
        .maybeSingle();

      console.log('Existing role check:', { existingRole, roleError });

      if (roleError) {
        console.error('Error checking existing roles:', roleError);
        return {
          success: false,
          error: 'Error checking existing admin assignments',
          debugInfo: { roleError }
        };
      }

      if (existingRole) {
        return {
          success: false,
          error: 'This machine already has an assigned admin. Please contact support if you need to change the admin.',
          debugInfo: { reason: 'admin_exists' }
        };
      }

      const venue = {
        id: venueData.id,
        name: venueData.name,
        city: venueData.city,
        state: venueData.state,
        machine_model: venueData.machine_model || 'VR-KIOSK-V1',
        serial_number: venueData.serial_number || ''
      };

      setValidatedVenue(venue);

      console.log('Validation successful:', venue);

      return {
        success: true,
        venue,
        auth: {
          product_id: authRecord.product_id,
          access_level: authRecord.access_level || 'admin'
        }
      };
    } catch (error) {
      console.error('Unexpected error during product key validation:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during validation. Please try again.',
        debugInfo: { unexpectedError: error }
      };
    }
  };

  const sendConfirmationEmail = async (email: string, fullName: string, venueName: string) => {
    setIsSendingConfirmation(true);
    try {
      console.log('Sending confirmation email to:', email);

      const confirmationUrl = `${window.location.origin}/machine-admin`;

      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          fullName,
          venueName,
          confirmationUrl
        }
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        toast({
          variant: "destructive",
          title: "Email Error",
          description: "Failed to send confirmation email. Please contact support.",
        });
        return false;
      }

      console.log('Confirmation email sent successfully:', data);
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email for account confirmation instructions.",
      });
      return true;
    } catch (error: any) {
      console.error('Confirmation email error:', error);
      toast({
        variant: "destructive",
        title: "Email Error",
        description: "Failed to send confirmation email. Please try again.",
      });
      return false;
    } finally {
      setIsSendingConfirmation(false);
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
      console.log('Starting admin signup process for:', email);

      // Clean the product key before validation
      const cleanedProductKey = productKey.trim().toUpperCase();

      // Re-validate the product key to ensure it's still valid
      const validation = await validateProductKey(cleanedProductKey);
      if (!validation.success) {
        console.error('Product key validation failed during signup:', validation.error);
        toast({
          variant: "destructive",
          title: "Invalid Product Key",
          description: validation.error,
        });
        return { error: validation.error };
      }

      console.log('Product key validated, creating user account...');

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
        console.error('Auth signup error:', authError);
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: authError.message,
        });
        return { error: authError.message };
      }

      console.log('User account created successfully:', authData.user?.id);

      if (authData.user && validation.venue) {
        console.log('Assigning machine admin role using simplified system...');

        // Insert role into simplified_user_roles table
        const { error: roleError } = await supabase
          .from('simplified_user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'machine_admin',
            venue_id: validation.venue.id,
            is_active: true
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

        // Update last used time for the product key
        const { error: updateError } = await supabase
          .from('machine_auth')
          .update({ last_used_at: new Date().toISOString() })
          .eq('product_key', cleanedProductKey);

        if (updateError) {
          console.error('Failed to update last_used_at:', updateError);
        }

        // Send confirmation email
        await sendConfirmationEmail(email, fullName, validation.venue.name);

        console.log('Admin signup completed successfully');

        toast({
          title: "Welcome!",
          description: `Admin account created successfully for ${validation.venue.name}. Please check your email to verify your account.`,
        });

        return { success: true, user: authData.user };
      }

      console.error('Missing user or venue data after signup');
      return { error: "Incomplete signup data" };
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
    isSendingConfirmation,
    validatedVenue,
    validateProductKey,
    signUpAdmin,
    sendConfirmationEmail,
    clearValidation: () => setValidatedVenue(null)
  };
}
