
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

    const { email } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    console.log(`Starting manual setup for user: ${email}`)

    // Get user ID from profiles table
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      throw new Error(`User not found: ${email}`)
    }

    const user_id = profile.id

    // Create onboarding status record
    const { error: statusError } = await supabaseClient
      .from('user_onboarding_status')
      .insert({
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
      console.error('Error creating onboarding status:', statusError)
      throw statusError
    }

    console.log('Calling setup_user_venue function...')

    // Call the setup function
    const { data: setupResult, error: setupError } = await supabaseClient
      .rpc('setup_user_venue', {
        p_email: email,
        p_user_id: user_id
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
        message: `Venue setup completed successfully for ${email}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in manual-setup-user function:', error)
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
