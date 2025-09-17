-- Final function search path security updates
-- Update all remaining functions to use secure search_path

CREATE OR REPLACE FUNCTION setup_existing_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_record RECORD;
  setup_result json;
  users_processed integer := 0;
  results json[] := '{}';
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.user_onboarding_status uo ON u.id = uo.user_id
    WHERE uo.id IS NULL
      AND u.email IS NOT NULL
  LOOP
    INSERT INTO public.user_onboarding_status (user_id, status)
    VALUES (user_record.id, 'pending');
    
    SELECT public.setup_user_venue(user_record.email, user_record.id) INTO setup_result;
    
    users_processed := users_processed + 1;
    results := results || setup_result;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'users_processed', users_processed,
    'results', results
  );
END;
$$;

CREATE OR REPLACE FUNCTION update_launch_options_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_machine_admin_invitation(p_email text, p_venue_id uuid, p_invited_by uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  invitation_token text;
  result json;
BEGIN
  IF NOT public.has_simplified_role(p_invited_by, 'super_admin') THEN
    result := json_build_object(
      'success', false,
      'error', 'Only super admins can send invitations'
    );
    RETURN result;
  END IF;

  invitation_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO public.admin_invitations (email, venue_id, invited_by, token)
  VALUES (p_email, p_venue_id, p_invited_by, invitation_token);

  result := json_build_object(
    'success', true,
    'token', invitation_token,
    'message', 'Invitation created successfully'
  );

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION accept_invitation(p_token text, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  invitation_record record;
  result json;
BEGIN
  SELECT * INTO invitation_record
  FROM public.admin_invitations
  WHERE token = p_token
    AND expires_at > now()
    AND used_at IS NULL;

  IF invitation_record.id IS NULL THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation'
    );
    RETURN result;
  END IF;

  INSERT INTO public.simplified_user_roles (user_id, role, venue_id)
  VALUES (p_user_id, 'machine_admin', invitation_record.venue_id);

  UPDATE public.admin_invitations
  SET used_at = now()
  WHERE id = invitation_record.id;

  result := json_build_object(
    'success', true,
    'venue_id', invitation_record.venue_id,
    'message', 'Successfully joined as machine admin'
  );

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION update_simplified_roles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION has_simplified_role(_user_id uuid, _role simplified_user_role, _venue_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.simplified_user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND ur.is_active = true
      AND (_venue_id IS NULL OR ur.venue_id = _venue_id OR ur.venue_id IS NULL)
  )
$$;

CREATE OR REPLACE FUNCTION setup_user_venue(p_email text, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_venue_id uuid;
  venue_name text;
  serial_number text;
  result json;
  game_record record;
  games_assigned integer := 0;
BEGIN
  venue_name := split_part(p_email, '@', 1) || '''s VR Arcade';
  
  serial_number := public.generate_machine_serial();
  
  INSERT INTO public.venues (
    name, 
    city, 
    state, 
    address, 
    pin_code, 
    serial_number, 
    machine_model,
    status
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

  INSERT INTO public.simplified_user_roles (user_id, role, venue_id)
  VALUES (p_user_id, 'machine_admin', new_venue_id);

  FOR game_record IN 
    SELECT * FROM public.games WHERE is_active = true
  LOOP
    INSERT INTO public.machine_games (venue_id, game_id, assigned_by)
    VALUES (new_venue_id, game_record.id, 'auto-setup');
    games_assigned := games_assigned + 1;
  END LOOP;

  INSERT INTO public.venue_settings (venue_id)
  VALUES (new_venue_id);

  INSERT INTO public.launch_options (venue_id)
  VALUES (new_venue_id);

  INSERT INTO public.machine_auth (
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

  UPDATE public.user_onboarding_status 
  SET 
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
    completed_at = now()
  WHERE user_id = p_user_id;

  result := json_build_object(
    'success', true,
    'venue_id', new_venue_id,
    'venue_name', venue_name,
    'serial_number', serial_number,
    'games_assigned', games_assigned,
    'message', 'User setup completed successfully'
  );

  RETURN result;
END;
$$;