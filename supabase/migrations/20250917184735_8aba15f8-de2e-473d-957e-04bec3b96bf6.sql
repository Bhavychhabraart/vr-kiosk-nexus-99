-- Fix remaining function search path security issues
-- Update all existing functions to use secure search_path

CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role user_role, _venue_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
      AND (_venue_id IS NULL OR ur.venue_id = _venue_id OR ur.venue_id IS NULL)
  )
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION start_user_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_onboarding_status (user_id, status)
  VALUES (NEW.id, 'pending');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  SELECT 'TK-' || to_char(now(), 'YYYYMMDD') || '-' || 
         LPAD((COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM '\d+$') AS integer)), 0) + 1)::text, 4, '0')
  INTO new_number
  FROM public.support_tickets 
  WHERE ticket_number LIKE 'TK-' || to_char(now(), 'YYYYMMDD') || '-%';
  
  RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_analytics_on_session_end_improved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL AND NEW.status = 'completed' THEN
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

CREATE OR REPLACE FUNCTION validate_machine_auth(p_venue_id uuid, p_product_key text, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  auth_record record;
  venue_record record;
  result JSON;
BEGIN
  SELECT * INTO auth_record
  FROM public.machine_auth 
  WHERE venue_id = p_venue_id 
    AND product_key = p_product_key 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
  
  SELECT * INTO venue_record
  FROM public.venues 
  WHERE id = p_venue_id AND status = 'active';
  
  INSERT INTO public.auth_attempts (venue_id, product_id, ip_address, user_agent, success, error_message)
  VALUES (
    p_venue_id,
    auth_record.product_id,
    p_ip_address,
    p_user_agent,
    CASE WHEN auth_record.id IS NOT NULL AND venue_record.id IS NOT NULL THEN true ELSE false END,
    CASE 
      WHEN venue_record.id IS NULL THEN 'Invalid or inactive venue'
      WHEN auth_record.id IS NULL THEN 'Invalid product key or expired access'
      ELSE NULL
    END
  );
  
  IF auth_record.id IS NOT NULL AND venue_record.id IS NOT NULL THEN
    UPDATE public.machine_auth 
    SET last_used_at = now() 
    WHERE id = auth_record.id;
    
    result := json_build_object(
      'success', true,
      'venue', json_build_object(
        'id', venue_record.id,
        'name', venue_record.name,
        'city', venue_record.city,
        'state', venue_record.state,
        'machine_model', venue_record.machine_model,
        'serial_number', venue_record.serial_number
      ),
      'auth', json_build_object(
        'product_id', auth_record.product_id,
        'access_level', auth_record.access_level,
        'expires_at', auth_record.expires_at
      )
    );
  ELSE
    result := json_build_object(
      'success', false,
      'error', CASE 
        WHEN venue_record.id IS NULL THEN 'Invalid or inactive venue'
        ELSE 'Invalid product key or expired access'
      END
    );
  END IF;
  
  RETURN result;
END;
$$;