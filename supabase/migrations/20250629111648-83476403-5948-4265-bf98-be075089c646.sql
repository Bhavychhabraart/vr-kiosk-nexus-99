
-- Setup vrarcadia001@gmail.com user as machine admin with venue and games (fixed version)
DO $$
DECLARE
    target_user_id UUID;
    new_venue_id UUID;
    venue_name TEXT := 'vrarcadia001''s VR Arcade';
    machine_serial TEXT;
    games_assigned INTEGER := 0;
    game_record RECORD;
    existing_venue_id UUID;
BEGIN
    -- Get the user ID for vrarcadia001@gmail.com from profiles table
    SELECT id INTO target_user_id
    FROM profiles
    WHERE email = 'vrarcadia001@gmail.com';
    
    -- If user doesn't exist in profiles, we need to find them in auth.users
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User vrarcadia001@gmail.com not found in profiles table. Please ensure they have signed up first.';
        RETURN;
    END IF;
    
    -- Check if user already has a venue
    SELECT venue_id INTO existing_venue_id
    FROM simplified_user_roles 
    WHERE user_id = target_user_id 
    AND role = 'machine_admin' 
    AND is_active = true
    LIMIT 1;
    
    IF existing_venue_id IS NOT NULL THEN
        RAISE NOTICE 'User already has machine admin role assigned to venue: %', existing_venue_id;
        
        -- Ensure all games are assigned to existing venue
        FOR game_record IN 
            SELECT id FROM games WHERE is_active = true
        LOOP
            INSERT INTO machine_games (venue_id, game_id, is_active, assigned_by)
            VALUES (existing_venue_id, game_record.id, true, 'admin-setup')
            ON CONFLICT (venue_id, game_id) DO UPDATE SET
                is_active = EXCLUDED.is_active,
                assigned_by = EXCLUDED.assigned_by;
            games_assigned := games_assigned + 1;
        END LOOP;
        
        RAISE NOTICE 'Ensured all % games are assigned to existing venue', games_assigned;
        RETURN;
    END IF;
    
    -- Generate unique serial number
    machine_serial := 'VR-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(FLOOR(random() * 10000)::text, 4, '0');
    
    -- Ensure serial number is unique
    WHILE EXISTS (SELECT 1 FROM venues WHERE venues.serial_number = machine_serial) LOOP
        machine_serial := 'VR-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(FLOOR(random() * 10000)::text, 4, '0');
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
        machine_serial,
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
        VALUES (new_venue_id, game_record.id, true, 'admin-setup')
        ON CONFLICT (venue_id, game_id) DO UPDATE SET
            is_active = EXCLUDED.is_active,
            assigned_by = EXCLUDED.assigned_by;
        games_assigned := games_assigned + 1;
    END LOOP;
    
    -- Create venue settings
    INSERT INTO venue_settings (venue_id)
    VALUES (new_venue_id)
    ON CONFLICT (venue_id) DO NOTHING;
    
    -- Create launch options
    INSERT INTO launch_options (venue_id)
    VALUES (new_venue_id)
    ON CONFLICT (venue_id) DO NOTHING;
    
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
    
    -- Update or create onboarding status (check if exists first)
    IF EXISTS (SELECT 1 FROM user_onboarding_status WHERE user_id = target_user_id) THEN
        UPDATE user_onboarding_status SET
            status = 'completed',
            venue_id = new_venue_id,
            machine_serial_number = machine_serial,
            setup_progress = jsonb_build_object(
                'venue_created', true,
                'venue_name', venue_name,
                'games_assigned', games_assigned,
                'settings_configured', true,
                'role_assigned', true
            ),
            completed_at = now()
        WHERE user_id = target_user_id;
    ELSE
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
            machine_serial,
            jsonb_build_object(
                'venue_created', true,
                'venue_name', venue_name,
                'games_assigned', games_assigned,
                'settings_configured', true,
                'role_assigned', true
            ),
            now()
        );
    END IF;
    
    RAISE NOTICE 'Successfully set up user vrarcadia001@gmail.com as machine admin';
    RAISE NOTICE 'Venue created: % (ID: %)', venue_name, new_venue_id;
    RAISE NOTICE 'Serial number: %', machine_serial;
    RAISE NOTICE 'Games assigned: %', games_assigned;
    
END $$;
