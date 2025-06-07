
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

    console.log('Starting batch setup for existing users')

    // Call the setup function
    const { data: setupResult, error: setupError } = await supabaseClient
      .rpc('setup_existing_users')

    if (setupError) {
      console.error('Batch setup error:', setupError)
      throw setupError
    }

    console.log('Batch setup completed successfully:', setupResult)

    return new Response(
      JSON.stringify({
        success: true,
        users_processed: setupResult.users_processed,
        results: setupResult.results,
        message: 'Batch user setup completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in setup-existing-users function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        users_processed: 0,
        message: 'Failed to setup existing users'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
