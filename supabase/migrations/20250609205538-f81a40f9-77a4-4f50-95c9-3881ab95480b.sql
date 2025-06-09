
-- Fix the user setup by handling existing data properly
DO $$
DECLARE
    user_uuid UUID := '90cc2204-7dbf-4ab8-9086-1c2bd475d001';
    user_venue_id UUID;
BEGIN
    -- Get or create venue for the user
    SELECT v.id INTO user_venue_id
    FROM simplified_user_roles sur 
    JOIN venues v ON sur.venue_id = v.id 
    WHERE sur.user_id = user_uuid AND sur.role = 'machine_admin'
    LIMIT 1;
    
    -- If no venue exists, create one
    IF user_venue_id IS NULL THEN
        INSERT INTO venues (
            name, city, state, address, pin_code, serial_number, machine_model, status
        ) VALUES (
            'littlejoys144''s VR Arcade',
            'Mumbai',
            'Maharashtra', 
            '123 VR Street',
            '400001',
            'VR-2025-' || LPAD(FLOOR(random() * 10000)::text, 4, '0'),
            'VR-KIOSK-V1',
            'active'
        ) RETURNING id INTO user_venue_id;
        
        -- Assign machine admin role
        INSERT INTO simplified_user_roles (user_id, role, venue_id)
        VALUES (user_uuid, 'machine_admin', user_venue_id);
    END IF;
    
    -- Ensure all active games are assigned using ON CONFLICT
    INSERT INTO machine_games (venue_id, game_id, is_active, assigned_by)
    SELECT 
        user_venue_id,
        g.id,
        true,
        'admin-fix'
    FROM games g
    WHERE g.is_active = true
    ON CONFLICT (venue_id, game_id) DO UPDATE SET
        is_active = true,
        assigned_by = 'admin-fix';
    
    -- Ensure venue settings exist
    INSERT INTO venue_settings (venue_id)
    VALUES (user_venue_id)
    ON CONFLICT (venue_id) DO NOTHING;
    
    -- Ensure launch options exist
    INSERT INTO launch_options (venue_id)
    VALUES (user_venue_id)
    ON CONFLICT (venue_id) DO NOTHING;
    
    -- Ensure machine auth exists
    INSERT INTO machine_auth (venue_id, product_id, product_key, access_level)
    SELECT 
        user_venue_id,
        'NGA-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
        encode(gen_random_bytes(16), 'hex'),
        'admin'
    WHERE NOT EXISTS (
        SELECT 1 FROM machine_auth WHERE venue_id = user_venue_id
    );
    
    -- Update onboarding status to completed
    UPDATE user_onboarding_status 
    SET 
        status = 'completed',
        venue_id = user_venue_id,
        machine_serial_number = (SELECT serial_number FROM venues WHERE id = user_venue_id),
        setup_progress = jsonb_build_object(
            'venue_created', true,
            'venue_name', (SELECT name FROM venues WHERE id = user_venue_id),
            'games_assigned', (SELECT COUNT(*) FROM games WHERE is_active = true),
            'settings_configured', true,
            'role_assigned', true
        ),
        completed_at = now()
    WHERE user_id = user_uuid;
    
END $$;
