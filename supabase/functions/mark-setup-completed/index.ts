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

    const { email, venueId } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    console.log(`Marking setup as completed for user: ${email}`)

    // Get user ID from profiles table
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      throw new Error(`User not found: ${email}`)
    }

    const userId = profile.id
    console.log(`Found user with ID: ${userId}`)

    // Update or create onboarding status as completed
    const { data: onboardingData, error: onboardingError } = await supabaseClient
      .from('user_onboarding_status')
      .upsert({
        user_id: userId,
        status: 'completed',
        venue_id: venueId,
        setup_progress: {
          venue_created: true,
          games_assigned: true,
          settings_configured: true,
          role_assigned: true,
          manually_completed: true
        },
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (onboardingError) {
      console.error('Error updating onboarding status:', onboardingError)
      throw onboardingError
    }

    console.log('Successfully marked setup as completed:', onboardingData)

    return new Response(
      JSON.stringify({
        success: true,
        data: onboardingData,
        message: `Setup marked as completed for ${email}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in mark-setup-completed function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to mark setup as completed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})