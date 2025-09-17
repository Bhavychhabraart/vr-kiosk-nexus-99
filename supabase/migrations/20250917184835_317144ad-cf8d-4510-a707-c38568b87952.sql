-- Complete function search path security hardening
-- Update remaining functions to use secure search_path

CREATE OR REPLACE FUNCTION initialize_machine_setup(p_serial_number text, p_model text DEFAULT 'VR-KIOSK-V1'::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  setup_record record;
  setup_token TEXT;
  result JSON;
BEGIN
  SELECT * INTO setup_record
  FROM public.machine_setup_status 
  WHERE machine_serial_number = p_serial_number;
  
  IF setup_record.id IS NULL THEN
    INSERT INTO public.machine_setup_status (machine_serial_number, current_status)
    VALUES (p_serial_number, 'not_started')
    RETURNING * INTO setup_record;
  END IF;
  
  setup_token := encode(gen_random_bytes(32), 'hex');
  
  INSERT INTO public.setup_tokens (machine_serial_number, token, expires_at)
  VALUES (p_serial_number, setup_token, now() + interval '24 hours');
  
  result := json_build_object(
    'success', true,
    'setup_id', setup_record.id,
    'serial_number', p_serial_number,
    'current_status', setup_record.current_status,
    'setup_token', setup_token,
    'completed_steps', setup_record.completed_steps
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION update_setup_progress(p_serial_number text, p_status setup_status, p_step_data jsonb DEFAULT '{}'::jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE public.machine_setup_status 
  SET 
    current_status = p_status,
    setup_data = setup_data || p_step_data,
    updated_at = now()
  WHERE machine_serial_number = p_serial_number;
  
  IF p_status = 'completed' THEN
    UPDATE public.venues 
    SET 
      setup_completed_at = now(),
      first_boot_completed = true,
      machine_mode = 'customer'
    WHERE serial_number = p_serial_number;
  END IF;
  
  result := json_build_object(
    'success', true,
    'status', p_status,
    'message', 'Setup progress updated successfully'
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION update_analytics_on_session_end()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    INSERT INTO public.earnings_summary (
      date, venue_id, total_revenue, rfid_revenue, upi_revenue, total_sessions
    )
    VALUES (
      CURRENT_DATE,
      NEW.venue_id,
      COALESCE(NEW.amount_paid, 0),
      CASE WHEN NEW.payment_method = 'rfid' THEN COALESCE(NEW.amount_paid, 0) ELSE 0 END,
      CASE WHEN NEW.payment_method = 'upi' THEN COALESCE(NEW.amount_paid, 0) ELSE 0 END,
      1
    )
    ON CONFLICT (date, venue_id) DO UPDATE SET
      total_revenue = earnings_summary.total_revenue + EXCLUDED.total_revenue,
      rfid_revenue = earnings_summary.rfid_revenue + EXCLUDED.rfid_revenue,
      upi_revenue = earnings_summary.upi_revenue + EXCLUDED.upi_revenue,
      total_sessions = earnings_summary.total_sessions + 1;

    INSERT INTO public.popular_games (
      game_id, venue_id, total_sessions, total_revenue, last_played_at
    )
    VALUES (
      NEW.game_id,
      NEW.venue_id,
      1,
      COALESCE(NEW.amount_paid, 0),
      NEW.end_time
    )
    ON CONFLICT (game_id, venue_id) DO UPDATE SET
      total_sessions = popular_games.total_sessions + 1,
      total_revenue = popular_games.total_revenue + COALESCE(NEW.amount_paid, 0),
      last_played_at = NEW.end_time,
      updated_at = now();

    INSERT INTO public.business_analytics (
      date, total_sessions, total_revenue
    )
    VALUES (
      CURRENT_DATE,
      1,
      COALESCE(NEW.amount_paid, 0)
    )
    ON CONFLICT (date) DO UPDATE SET
      total_sessions = business_analytics.total_sessions + 1,
      total_revenue = business_analytics.total_revenue + COALESCE(NEW.amount_paid, 0);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_setup_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  token_record record;
  setup_record record;
  result JSON;
BEGIN
  SELECT * INTO token_record
  FROM public.setup_tokens 
  WHERE token = p_token 
    AND expires_at > now()
    AND used_at IS NULL;
  
  IF token_record.id IS NULL THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid or expired setup token'
    );
    RETURN result;
  END IF;
  
  SELECT * INTO setup_record
  FROM public.machine_setup_status 
  WHERE machine_serial_number = token_record.machine_serial_number;
  
  result := json_build_object(
    'success', true,
    'serial_number', token_record.machine_serial_number,
    'current_status', setup_record.current_status,
    'setup_data', setup_record.setup_data,
    'completed_steps', setup_record.completed_steps
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION assign_machine_admin_role(p_user_id uuid, p_venue_id uuid, p_granted_by uuid DEFAULT NULL::uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  result json;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = p_user_id 
      AND role = 'machine_admin' 
      AND venue_id = p_venue_id 
      AND is_active = true
  ) THEN
    result := json_build_object(
      'success', false,
      'error', 'User already has machine admin role for this venue'
    );
    RETURN result;
  END IF;

  INSERT INTO public.user_roles (
    user_id,
    role,
    venue_id,
    granted_by,
    is_active
  ) VALUES (
    p_user_id,
    'machine_admin',
    p_venue_id,
    COALESCE(p_granted_by, p_user_id),
    true
  );

  result := json_build_object(
    'success', true,
    'message', 'Machine admin role assigned successfully'
  );
  
  RETURN result;
END;
$$;