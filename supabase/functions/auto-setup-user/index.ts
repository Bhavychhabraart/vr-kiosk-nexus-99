
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, userEmail, userName } = await req.json()

    console.log('Starting auto-setup for user:', userId)

    // Update onboarding status to in_progress
    await supabaseClient
      .from('user_onboarding_status')
      .update({ 
        status: 'in_progress',
        setup_progress: { step: 'creating_venue', message: 'Creating your VR venue...' }
      })
      .eq('user_id', userId)

    // Generate unique machine serial number
    const { data: serialData } = await supabaseClient.rpc('generate_machine_serial')
    const machineSerial = serialData

    // Create venue for the user
    const venueName = userName || userEmail?.split('@')[0] || 'My VR Venue'
    const { data: venue, error: venueError } = await supabaseClient
      .from('venues')
      .insert({
        name: `${venueName}'s VR Arcade`,
        address: '123 VR Street, Gaming District',
        city: 'Mumbai',
        state: 'Maharashtra',
        pin_code: '400001',
        manager_name: userName || 'Admin',
        manager_email: userEmail,
        manager_phone: '+91-9876543210',
        serial_number: machineSerial,
        machine_model: 'VR-KIOSK-V1',
        status: 'active',
        first_boot_completed: true,
        machine_mode: 'customer'
      })
      .select()
      .single()

    if (venueError) throw venueError

    console.log('Created venue:', venue.id)

    // Update progress
    await supabaseClient
      .from('user_onboarding_status')
      .update({ 
        venue_id: venue.id,
        machine_serial_number: machineSerial,
        setup_progress: { step: 'assigning_games', message: 'Adding all games to your machine...' }
      })
      .eq('user_id', userId)

    // Get all active games
    const { data: games } = await supabaseClient
      .from('games')
      .select('id')
      .eq('is_active', true)

    if (games && games.length > 0) {
      // Assign all games to the venue
      const gameAssignments = games.map(game => ({
        venue_id: venue.id,
        game_id: game.id,
        is_active: true,
        assigned_by: 'auto-setup'
      }))

      await supabaseClient
        .from('machine_games')
        .insert(gameAssignments)
    }

    // Update progress
    await supabaseClient
      .from('user_onboarding_status')
      .update({ 
        setup_progress: { step: 'configuring_settings', message: 'Setting up payment and launch options...' }
      })
      .eq('user_id', userId)

    // Create default launch options
    await supabaseClient
      .from('launch_options')
      .insert({
        venue_id: venue.id,
        price_per_minute: 15.0,
        default_duration_minutes: 10,
        rfid_enabled: true,
        qr_payment_enabled: true,
        tap_to_start_enabled: true
      })

    // Create default payment methods
    await supabaseClient
      .from('payment_methods')
      .insert({
        venue_id: venue.id,
        rfid_enabled: true,
        upi_enabled: true,
        upi_merchant_id: `VR${venue.id.slice(0, 8)}`
      })

    // Create default venue settings
    await supabaseClient
      .from('venue_settings')
      .insert({
        venue_id: venue.id,
        theme: 'dark',
        volume: 75,
        brightness: 100,
        rfid_enabled: true,
        upi_enabled: true,
        sound_effects_enabled: true,
        password_protection_enabled: false
      })

    // Create machine authentication credentials
    const productKey = `VR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await supabaseClient
      .from('machine_auth')
      .insert({
        venue_id: venue.id,
        product_id: machineSerial,
        product_key: productKey,
        access_level: 'admin',
        is_active: true
      })

    // Update progress
    await supabaseClient
      .from('user_onboarding_status')
      .update({ 
        setup_progress: { step: 'assigning_role', message: 'Finalizing your admin access...' }
      })
      .eq('user_id', userId)

    // Assign machine_admin role to the user
    await supabaseClient
      .from('simplified_user_roles')
      .insert({
        user_id: userId,
        role: 'machine_admin',
        venue_id: venue.id,
        is_active: true
      })

    // Mark onboarding as completed
    await supabaseClient
      .from('user_onboarding_status')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        setup_progress: { 
          step: 'completed', 
          message: 'Your VR machine is ready! Welcome to your admin dashboard.' 
        }
      })
      .eq('user_id', userId)

    console.log('Auto-setup completed successfully for user:', userId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        venue_id: venue.id,
        machine_serial: machineSerial,
        product_key: productKey,
        message: 'Auto-setup completed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Auto-setup error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
