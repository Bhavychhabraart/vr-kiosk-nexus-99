
-- Setup vrarcadia001@gmail.com user as machine admin with venue and games
DO $$
DECLARE
    target_user_id UUID;
    new_venue_id UUID;
    venue_name TEXT := 'vrarcadia001''s VR Arcade';
    serial_number TEXT;
    games_assigned INTEGER := 0;
    game_record RECORD;
BEGIN
    -- Get the user ID for vrarcadia001@gmail.com from profiles table
    SELECT id INTO target_user_id
    FROM profiles
    WHERE email = 'vrarcadia001@gmail.com';
    
    -- If user doesn't exist in profiles, we need to find them in auth.users
    IF target_user_id IS NULL THEN
        -- This would need to be done by finding the user in the Supabase dashboard
        -- For now, let's use a placeholder that you'll need to replace
        RAISE NOTICE 'User vrarcadia001@gmail.com not found in profiles table. Please ensure they have signed up first.';
        RETURN;
    END IF;
    
    -- Check if user already has a venue
    IF EXISTS (
        SELECT 1 FROM simplified_user_roles 
        WHERE user_id = target_user_id 
        AND role = 'machine_admin' 
        AND is_active = true
    ) THEN
        RAISE NOTICE 'User already has machine admin role assigned';
        RETURN;
    END IF;
    
    -- Generate unique serial number
    serial_number := 'VR-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(FLOOR(random() * 10000)::text, 4, '0');
    
    -- Ensure serial number is unique
    WHILE EXISTS (SELECT 1 FROM venues WHERE venues.serial_number = serial_number) LOOP
        serial_number := 'VR-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(FLOOR(random() * 10000)::text, 4, '0');
    END LOOP;
    
    -- Create venue for the user
    INSERT INTO venues (
        name, city, state, address, pin_code, serial_number, machine_model, status
    ) VALUES (
        venue_name,
        'Mumbai',
        'Maharashtra', 
        '123 VR Street',
        '400001',
        serial_number,
        'VR-KIOSK-V1',
        'active'
    ) RETURNING id INTO new_venue_id;
    
    -- Assign machine admin role
    INSERT INTO simplified_user_roles (user_id, role, venue_id, is_active)
    VALUES (target_user_id, 'machine_admin', new_venue_id, true);
    
    -- Assign all active games to the venue
    FOR game_record IN 
        SELECT id FROM games WHERE is_active = true
    LOOP
        INSERT INTO machine_games (venue_id, game_id, is_active, assigned_by)
        VALUES (new_venue_id, game_record.id, true, 'admin-setup');
        games_assigned := games_assigned + 1;
    END LOOP;
    
    -- Create venue settings
    INSERT INTO venue_settings (venue_id)
    VALUES (new_venue_id);
    
    -- Create launch options
    INSERT INTO launch_options (venue_id)
    VALUES (new_venue_id);
    
    -- Create machine auth
    INSERT INTO machine_auth (
        venue_id, 
        product_id, 
        product_key, 
        access_level
    ) VALUES (
        new_venue_id,
        'NGA-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
        encode(gen_random_bytes(16), 'hex'),
        'admin'
    );
    
    -- Update or create onboarding status
    INSERT INTO user_onboarding_status (
        user_id, 
        status, 
        venue_id, 
        machine_serial_number,
        setup_progress,
        completed_at
    ) VALUES (
        target_user_id,
        'completed',
        new_venue_id,
        serial_number,
        jsonb_build_object(
            'venue_created', true,
            'venue_name', venue_name,
            'games_assigned', games_assigned,
            'settings_configured', true,
            'role_assigned', true
        ),
        now()
    ) ON CONFLICT (user_id) DO UPDATE SET
        status = 'completed',
        venue_id = new_venue_id,
        machine_serial_number = serial_number,
        setup_progress = jsonb_build_object(
            'venue_created', true,
            'venue_name', venue_name,
            'games_assigned', games_assigned,
            'settings_configured', true,
            'role_assigned', true
        ),
        completed_at = now();
    
    RAISE NOTICE 'Successfully set up user vrarcadia001@gmail.com as machine admin';
    RAISE NOTICE 'Venue created: % (ID: %)', venue_name, new_venue_id;
    RAISE NOTICE 'Serial number: %', serial_number;
    RAISE NOTICE 'Games assigned: %', games_assigned;
    
END $$;
