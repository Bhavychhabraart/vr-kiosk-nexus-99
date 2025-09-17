-- Complete Supabase Database Schema Migration Script
-- This script recreates the entire VR Arcade Management System database structure

-- =============================================================================
-- 1. CUSTOM TYPES AND ENUMS
-- =============================================================================

-- User role types
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'machine_admin', 'customer');
CREATE TYPE public.simplified_user_role AS ENUM ('super_admin', 'machine_admin');

-- Machine and setup types
CREATE TYPE public.machine_mode AS ENUM ('setup', 'customer', 'admin');
CREATE TYPE public.setup_status AS ENUM ('not_started', 'in_progress', 'completed', 'failed');

-- =============================================================================
-- 2. CORE TABLES (Dependencies: None)
-- =============================================================================

-- Global settings table
CREATE TABLE public.settings (
    id text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Games catalog
CREATE TABLE public.games (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    executable_path text,
    working_directory text,
    arguments text,
    image_url text,
    trailer_url text,
    min_duration_seconds integer NOT NULL DEFAULT 300,
    max_duration_seconds integer NOT NULL DEFAULT 1800,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Venues (VR arcade locations)
CREATE TABLE public.venues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    pin_code text NOT NULL,
    status text DEFAULT 'active',
    manager_name text,
    manager_phone text,
    manager_email text,
    machine_model text,
    serial_number text,
    latitude numeric,
    longitude numeric,
    installation_date date,
    last_maintenance date,
    machine_mode machine_mode DEFAULT 'customer',
    setup_completed_at timestamp with time zone,
    first_boot_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Upcoming products catalog
CREATE TABLE public.upcoming_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    category text NOT NULL,
    preview_image_url text,
    trailer_url text,
    release_date date,
    features jsonb,
    estimated_price numeric,
    pre_order_available boolean DEFAULT false,
    status text DEFAULT 'coming_soon',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 3. USER MANAGEMENT TABLES
-- =============================================================================

-- User onboarding status
CREATE TABLE public.user_onboarding_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    venue_id uuid REFERENCES public.venues(id),
    status text NOT NULL DEFAULT 'pending',
    machine_serial_number text,
    setup_progress jsonb DEFAULT '{}',
    error_message text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Legacy user roles (with potential recursion issue)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role user_role NOT NULL,
    venue_id uuid REFERENCES public.venues(id),
    granted_by uuid,
    granted_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true
);

-- Simplified user roles (main role system)
CREATE TABLE public.simplified_user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role simplified_user_role NOT NULL,
    venue_id uuid REFERENCES public.venues(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Admin users
CREATE TABLE public.admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL,
    role text NOT NULL DEFAULT 'kiosk_admin',
    venue_ids uuid[],
    permissions jsonb,
    last_login timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Admin invitations
CREATE TABLE public.admin_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    venue_id uuid NOT NULL REFERENCES public.venues(id),
    invited_by uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 4. MACHINE AND AUTHENTICATION TABLES
-- =============================================================================

-- Machine authentication
CREATE TABLE public.machine_auth (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid NOT NULL REFERENCES public.venues(id),
    product_id text NOT NULL,
    product_key text NOT NULL,
    access_level text DEFAULT 'admin',
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Machine setup status
CREATE TABLE public.machine_setup_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_serial_number text NOT NULL,
    current_status setup_status DEFAULT 'not_started',
    setup_data jsonb DEFAULT '{}',
    completed_steps text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Setup tokens
CREATE TABLE public.setup_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_serial_number text NOT NULL,
    token text NOT NULL,
    token_type text NOT NULL DEFAULT 'setup',
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Authentication attempts log
CREATE TABLE public.auth_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid REFERENCES public.venues(id),
    product_id text,
    ip_address text,
    user_agent text,
    success boolean DEFAULT false,
    error_message text,
    attempted_at timestamp with time zone DEFAULT now()
);

-- Machine games assignments
CREATE TABLE public.machine_games (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid NOT NULL REFERENCES public.venues(id),
    game_id uuid NOT NULL REFERENCES public.games(id),
    is_active boolean DEFAULT true,
    assigned_by text,
    assigned_at timestamp with time zone DEFAULT now(),
    UNIQUE(venue_id, game_id)
);

-- =============================================================================
-- 5. BUSINESS AND ANALYTICS TABLES
-- =============================================================================

-- Customers
CREATE TABLE public.customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    email text,
    phone text,
    gender text,
    date_of_birth date,
    preferred_venue_id uuid REFERENCES public.venues(id),
    total_sessions integer DEFAULT 0,
    total_spent numeric DEFAULT 0,
    loyalty_points integer DEFAULT 0,
    last_visit_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- RFID cards
CREATE TABLE public.rfid_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id text NOT NULL,
    name text,
    status text NOT NULL DEFAULT 'active',
    customer_id uuid REFERENCES public.customers(id),
    last_used_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Session tracking (real-time)
CREATE TABLE public.session_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    game_id uuid REFERENCES public.games(id),
    venue_id uuid REFERENCES public.venues(id),
    rfid_tag text,
    start_time timestamp with time zone NOT NULL DEFAULT now(),
    end_time timestamp with time zone,
    duration_seconds integer,
    rating integer,
    amount_paid numeric DEFAULT 0,
    payment_method text DEFAULT 'rfid',
    status text NOT NULL DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Session history (completed sessions)
CREATE TABLE public.session_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id uuid REFERENCES public.games(id),
    venue_id uuid REFERENCES public.venues(id),
    customer_id uuid REFERENCES public.customers(id),
    rfid_tag text,
    start_time timestamp with time zone NOT NULL DEFAULT now(),
    end_time timestamp with time zone,
    duration_seconds integer,
    rating smallint,
    status text NOT NULL DEFAULT 'completed',
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Earnings summary
CREATE TABLE public.earnings_summary (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid REFERENCES public.venues(id),
    date date NOT NULL,
    total_sessions integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    rfid_revenue numeric DEFAULT 0,
    upi_revenue numeric DEFAULT 0,
    session_breakdown jsonb,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(date, venue_id)
);

-- Popular games analytics
CREATE TABLE public.popular_games (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id uuid REFERENCES public.games(id),
    venue_id uuid REFERENCES public.venues(id),
    total_sessions integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    average_rating numeric,
    last_played_at timestamp with time zone,
    weekly_sessions integer DEFAULT 0,
    monthly_sessions integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(game_id, venue_id)
);

-- Business analytics
CREATE TABLE public.business_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    total_venues integer DEFAULT 0,
    active_venues integer DEFAULT 0,
    total_customers integer DEFAULT 0,
    new_customers integer DEFAULT 0,
    total_sessions integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    average_session_duration integer DEFAULT 0,
    top_performing_venue_id uuid REFERENCES public.venues(id),
    regional_breakdown jsonb,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(date)
);

-- =============================================================================
-- 6. CONFIGURATION TABLES
-- =============================================================================

-- Venue settings
CREATE TABLE public.venue_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid NOT NULL REFERENCES public.venues(id),
    theme text DEFAULT 'light',
    brightness integer DEFAULT 100,
    volume integer DEFAULT 50,
    sound_effects_enabled boolean DEFAULT true,
    rfid_enabled boolean DEFAULT true,
    upi_enabled boolean DEFAULT true,
    upi_merchant_id text,
    password_protection_enabled boolean DEFAULT false,
    admin_password text,
    admin_password_hash text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Launch options
CREATE TABLE public.launch_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid REFERENCES public.venues(id),
    tap_to_start_enabled boolean NOT NULL DEFAULT true,
    rfid_enabled boolean NOT NULL DEFAULT true,
    qr_payment_enabled boolean NOT NULL DEFAULT false,
    default_duration_minutes integer NOT NULL DEFAULT 10,
    price_per_minute numeric NOT NULL DEFAULT 15.0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Game pricing
CREATE TABLE public.game_pricing (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid NOT NULL REFERENCES public.venues(id),
    game_id uuid NOT NULL REFERENCES public.games(id),
    base_price numeric NOT NULL DEFAULT 50.0,
    price_per_minute numeric NOT NULL DEFAULT 15.0,
    duration_packages jsonb DEFAULT '[]',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Payment methods
CREATE TABLE public.payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid REFERENCES public.venues(id),
    rfid_enabled boolean DEFAULT true,
    upi_enabled boolean DEFAULT false,
    upi_merchant_id text,
    upi_qr_settings jsonb,
    payment_gateway_config jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 7. BUSINESS MANAGEMENT TABLES
-- =============================================================================

-- Kiosk owners
CREATE TABLE public.kiosk_owners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid REFERENCES public.venues(id),
    kiosk_name text NOT NULL,
    owner_name text NOT NULL,
    contact_email text,
    contact_phone text,
    address text,
    business_license text,
    logo_url text,
    operating_hours jsonb,
    theme_colors jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Subscriptions
CREATE TABLE public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid REFERENCES public.venues(id),
    plan_name text NOT NULL,
    plan_tier text NOT NULL,
    status text DEFAULT 'active',
    start_date date NOT NULL,
    end_date date,
    monthly_cost numeric NOT NULL,
    max_sessions_per_month integer,
    max_games integer,
    features jsonb,
    billing_history jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Support tickets
CREATE TABLE public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid REFERENCES public.venues(id),
    ticket_number text,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    priority text DEFAULT 'medium',
    status text DEFAULT 'open',
    assigned_to text,
    assigned_to_user_id uuid,
    resolution text,
    attachments jsonb,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    target_type text NOT NULL,
    target_ids uuid[],
    priority text DEFAULT 'medium',
    status text DEFAULT 'pending',
    created_by text,
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Owner registration
CREATE TABLE public.owner_registration (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_serial_number text NOT NULL,
    business_name text NOT NULL,
    owner_name text NOT NULL,
    owner_email text NOT NULL,
    owner_phone text,
    business_address text,
    business_city text,
    business_state text,
    business_pin_code text,
    business_type text,
    verification_status text DEFAULT 'pending',
    expected_hours jsonb,
    email_verified_at timestamp with time zone,
    phone_verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Admin audit log
CREATE TABLE public.admin_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    action text NOT NULL,
    resource_type text,
    resource_id uuid,
    details jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 8. UTILITY FUNCTIONS
-- =============================================================================

-- Function to generate machine serial numbers
CREATE OR REPLACE FUNCTION public.generate_machine_serial()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_serial_number text;
  exists_check boolean;
BEGIN
  LOOP
    new_serial_number := 'VR-' || EXTRACT(YEAR FROM now()) || '-' || 
                    LPAD(FLOOR(random() * 10000)::text, 4, '0');
    
    SELECT EXISTS(SELECT 1 FROM public.venues WHERE venues.serial_number = new_serial_number) INTO exists_check;
    
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_serial_number;
END;
$$;

-- Function to generate support ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_number text;
BEGIN
  SELECT 'TK-' || to_char(now(), 'YYYYMMDD') || '-' || 
         LPAD((COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM '\d+$') AS integer)), 0) + 1)::text, 4, '0')
  INTO new_number
  FROM public.support_tickets 
  WHERE ticket_number LIKE 'TK-' || to_char(now(), 'YYYYMMDD') || '-%';
  
  RETURN new_number;
END;
$$;

-- Password hashing functions
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF password IS NULL OR password = '' THEN
    RETURN NULL;
  END IF;
  RETURN crypt(password, gen_salt('bf', 12));
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF password IS NULL OR hash IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN crypt(password, hash) = hash;
END;
$$;

-- Role checking functions (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role, _venue_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.has_simplified_role(_user_id uuid, _role simplified_user_role, _venue_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.get_current_user_simplified_role()
RETURNS simplified_user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT ur.role
  FROM public.simplified_user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
  LIMIT 1
$$;

-- =============================================================================
-- 9. TRIGGER FUNCTIONS
-- =============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Auto-assign ticket numbers
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Start user onboarding
CREATE OR REPLACE FUNCTION public.start_user_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_onboarding_status (user_id, status)
  VALUES (NEW.id, 'pending');
  RETURN NEW;
END;
$$;

-- Analytics trigger for session completion
CREATE OR REPLACE FUNCTION public.update_analytics_on_session_end_improved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL AND NEW.status = 'completed' THEN
    -- Update earnings summary
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

    -- Update popular games
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

    -- Update business analytics
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

-- =============================================================================
-- 10. TRIGGERS
-- =============================================================================

-- Updated timestamp triggers
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_simplified_user_roles_updated_at BEFORE UPDATE ON public.simplified_user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_venue_settings_updated_at BEFORE UPDATE ON public.venue_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_launch_options_updated_at BEFORE UPDATE ON public.launch_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support ticket number generation
CREATE TRIGGER set_support_ticket_number BEFORE INSERT ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.set_ticket_number();

-- User management triggers (requires auth schema)
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- CREATE TRIGGER on_auth_user_created_onboarding AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.start_user_onboarding();

-- Analytics trigger
CREATE TRIGGER update_session_analytics AFTER UPDATE ON public.session_tracking FOR EACH ROW EXECUTE FUNCTION public.update_analytics_on_session_end_improved();

-- =============================================================================
-- 11. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simplified_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfid_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upcoming_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Games policies (public read, admin write)
CREATE POLICY "Authenticated users can view games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Super admins can manage games" ON public.games FOR ALL USING (public.has_simplified_role(auth.uid(), 'super_admin'));

-- Venues policies
CREATE POLICY "Super admins can manage all venues" ON public.venues FOR ALL USING (public.has_simplified_role(auth.uid(), 'super_admin'));
CREATE POLICY "Machine admins can view their venues" ON public.venues FOR SELECT USING (
  public.has_simplified_role(auth.uid(), 'super_admin') OR 
  id IN (SELECT venue_id FROM public.simplified_user_roles WHERE user_id = auth.uid() AND is_active = true)
);

-- User roles policies (using security definer functions to avoid recursion)
CREATE POLICY "Users can view their own roles" ON public.simplified_user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view roles if they are super admin" ON public.simplified_user_roles FOR SELECT USING (public.has_simplified_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can insert roles" ON public.simplified_user_roles FOR INSERT WITH CHECK (public.has_simplified_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can update roles" ON public.simplified_user_roles FOR UPDATE USING (public.has_simplified_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can delete roles" ON public.simplified_user_roles FOR DELETE USING (public.has_simplified_role(auth.uid(), 'super_admin'));

-- Machine games policies
CREATE POLICY "Users can view machine games for their venues" ON public.machine_games FOR SELECT USING (
  public.has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (SELECT venue_id FROM public.simplified_user_roles WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can modify machine games for their venues" ON public.machine_games FOR ALL USING (
  public.has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (SELECT venue_id FROM public.simplified_user_roles WHERE user_id = auth.uid() AND is_active = true)
);

-- Session tracking policies
CREATE POLICY "Anyone can view sessions" ON public.session_tracking FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sessions" ON public.session_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.session_tracking FOR UPDATE USING (true);

-- Venue settings policies
CREATE POLICY "Users can view settings for their venues" ON public.venue_settings FOR SELECT USING (
  public.has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (SELECT venue_id FROM public.simplified_user_roles WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can modify settings for their venues" ON public.venue_settings FOR ALL USING (
  public.has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (SELECT venue_id FROM public.simplified_user_roles WHERE user_id = auth.uid() AND is_active = true)
);

-- Similar policies for other venue-related tables
CREATE POLICY "Users can manage launch options for their venues" ON public.launch_options FOR ALL USING (
  public.has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (SELECT venue_id FROM public.simplified_user_roles WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Machine admins can manage venue game pricing" ON public.game_pricing FOR ALL USING (
  EXISTS (SELECT 1 FROM public.simplified_user_roles WHERE user_id = auth.uid() AND role = 'machine_admin' AND (venue_id = game_pricing.venue_id OR venue_id IS NULL) AND is_active = true) OR
  EXISTS (SELECT 1 FROM public.simplified_user_roles WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true)
);

-- Business analytics policies
CREATE POLICY "Super admins can view business analytics" ON public.business_analytics FOR SELECT USING (public.has_simplified_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can view earnings for their venues" ON public.earnings_summary FOR SELECT USING (
  public.has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (SELECT venue_id FROM public.simplified_user_roles WHERE user_id = auth.uid() AND is_active = true)
);

-- Support tickets policies
CREATE POLICY "Super admins can view all tickets" ON public.support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.simplified_user_roles WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true)
);
CREATE POLICY "Machine admins can view venue tickets" ON public.support_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.simplified_user_roles WHERE user_id = auth.uid() AND role = 'machine_admin' AND venue_id = support_tickets.venue_id AND is_active = true)
);
CREATE POLICY "Machine admins can create venue tickets" ON public.support_tickets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.simplified_user_roles WHERE user_id = auth.uid() AND role = 'machine_admin' AND venue_id = support_tickets.venue_id AND is_active = true)
);

-- RFID cards policies
CREATE POLICY "Machine admins can manage venue RFID cards" ON public.rfid_cards FOR ALL USING (
  public.has_simplified_role(auth.uid(), 'super_admin') OR 
  EXISTS (SELECT 1 FROM public.simplified_user_roles WHERE user_id = auth.uid() AND role = 'machine_admin' AND is_active = true)
);

-- Global settings - super admin only
CREATE POLICY "Super admins can manage global settings" ON public.settings FOR ALL USING (public.has_simplified_role(auth.uid(), 'super_admin'));

-- Machine auth - super admin only
CREATE POLICY "Super admins can manage machine auth" ON public.machine_auth FOR ALL USING (public.has_simplified_role(auth.uid(), 'super_admin'));

-- Upcoming products
CREATE POLICY "Authenticated users can view upcoming products" ON public.upcoming_products FOR SELECT USING (true);
CREATE POLICY "Super admins can manage upcoming products" ON public.upcoming_products FOR ALL USING (public.has_simplified_role(auth.uid(), 'super_admin'));

-- Subscriptions
CREATE POLICY "Super admins can manage subscriptions" ON public.subscriptions FOR ALL USING (public.has_simplified_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can view subscriptions for their venues" ON public.subscriptions FOR SELECT USING (
  public.has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (SELECT venue_id FROM public.simplified_user_roles WHERE user_id = auth.uid() AND is_active = true)
);

-- Admin users - super admin only
CREATE POLICY "Super admins can manage admin users" ON public.admin_users FOR ALL USING (public.has_simplified_role(auth.uid(), 'super_admin'));

-- Notifications - super admin only
CREATE POLICY "Super admins can manage notifications" ON public.notifications FOR ALL USING (public.has_simplified_role(auth.uid(), 'super_admin'));

-- Admin invitations - super admin only
CREATE POLICY "Super admins can manage invitations" ON public.admin_invitations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.simplified_user_roles WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true)
);

-- User onboarding status
CREATE POLICY "Users can view their own onboarding status" ON public.user_onboarding_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own onboarding status" ON public.user_onboarding_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own onboarding status" ON public.user_onboarding_status FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- 12. SAMPLE DATA (Optional)
-- =============================================================================

-- Insert some basic games
INSERT INTO public.games (title, description, image_url, is_active) VALUES
('Space Adventure VR', 'Explore distant galaxies in this immersive space adventure', '/images/space-adventure.jpg', true),
('Ocean Explorer', 'Dive deep into the mysterious depths of the ocean', '/images/ocean-explorer.jpg', true),
('Medieval Quest', 'Embark on an epic medieval adventure', '/images/medieval-quest.jpg', true),
('Zombie Survival', 'Survive the zombie apocalypse in this thrilling experience', '/images/zombie-survival.jpg', true),
('Racing Championship', 'Experience high-speed racing like never before', '/images/racing-championship.jpg', true);

-- Insert default settings
INSERT INTO public.settings (id, value) VALUES
('system_name', '"VR Arcade Management System"'),
('version', '"1.0.0"'),
('maintenance_mode', 'false'),
('default_session_duration', '600'),
('default_price_per_minute', '15.0');

COMMENT ON TABLE public.games IS 'Catalog of available VR games';
COMMENT ON TABLE public.venues IS 'VR arcade venue locations and configurations';
COMMENT ON TABLE public.simplified_user_roles IS 'User role assignments (primary system)';
COMMENT ON TABLE public.session_tracking IS 'Real-time session tracking data';
COMMENT ON TABLE public.machine_games IS 'Games assigned to specific venues';
COMMENT ON TABLE public.venue_settings IS 'Venue-specific configuration settings';