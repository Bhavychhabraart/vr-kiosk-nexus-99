
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, email, setup_type = 'new_user' } = await req.json()

    console.log(`Starting auto-setup for user: ${email} (${user_id}), type: ${setup_type}`)

    // Update onboarding status to pending with initial progress
    const { error: statusError } = await supabaseClient
      .from('user_onboarding_status')
      .upsert({
        user_id: user_id,
        status: 'pending',
        setup_progress: {
          venue_created: false,
          games_assigned: 0,
          settings_configured: false,
          role_assigned: false
        }
      })

    if (statusError) {
      console.error('Error updating onboarding status:', statusError)
      throw statusError
    }

    console.log('Starting setup_user_venue function...')

    // Call the setup function
    const { data: setupResult, error: setupError } = await supabaseClient
      .rpc('setup_user_venue', {
        p_user_id: user_id,
        p_email: email
      })

    if (setupError) {
      console.error('Setup error:', setupError)
      
      // Update onboarding status with error
      await supabaseClient
        .from('user_onboarding_status')
        .update({
          status: 'failed',
          error_message: setupError.message || 'Setup failed'
        })
        .eq('user_id', user_id)
      
      throw setupError
    }

    console.log('Setup completed successfully:', setupResult)

    return new Response(
      JSON.stringify({
        success: true,
        data: setupResult,
        message: 'User venue setup completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in auto-setup-user function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to setup user venue'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
