
-- Add password hashing capability and fix RLS policies for security
-- First, add password hashing functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update venue_settings to hash passwords properly
ALTER TABLE venue_settings ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;

-- Create a function to hash passwords securely
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF password IS NULL OR password = '' THEN
    RETURN NULL;
  END IF;
  RETURN crypt(password, gen_salt('bf', 12));
END;
$$;

-- Create a function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF password IS NULL OR hash IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN crypt(password, hash) = hash;
END;
$$;

-- Update the verify_admin_password function to use hashed passwords
CREATE OR REPLACE FUNCTION verify_admin_password(p_venue_id uuid, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  stored_hash text;
  stored_plain text;
  password_enabled boolean;
BEGIN
  -- Get venue settings
  SELECT admin_password_hash, admin_password, password_protection_enabled
  INTO stored_hash, stored_plain, password_enabled
  FROM venue_settings
  WHERE venue_id = p_venue_id;
  
  -- If password protection is not enabled, always return true
  IF NOT COALESCE(password_enabled, false) THEN
    RETURN true;
  END IF;
  
  -- Check hashed password first (new format)
  IF stored_hash IS NOT NULL AND stored_hash != '' THEN
    RETURN verify_password(p_password, stored_hash);
  END IF;
  
  -- Fallback to plain text (legacy, will be migrated)
  IF stored_plain IS NOT NULL AND stored_plain != '' THEN
    RETURN stored_plain = p_password;
  END IF;
  
  -- No password set, return true (not protected)
  RETURN true;
END;
$$;

-- Fix RLS policies for sensitive tables
-- Update games table RLS to be more restrictive
DROP POLICY IF EXISTS "Allow full access to games" ON games;

CREATE POLICY "Authenticated users can view games" 
ON games FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Super admins can manage games" 
ON games FOR ALL 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));

-- Update session_history RLS to be more restrictive
DROP POLICY IF EXISTS "Allow full access to session history" ON session_history;

CREATE POLICY "Users can view session history for their venues" 
ON session_history FOR SELECT 
TO authenticated 
USING (
  has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (
    SELECT venue_id FROM simplified_user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Update launch_options RLS to be more restrictive
DROP POLICY IF EXISTS "Allow all operations on launch_options" ON launch_options;

CREATE POLICY "Users can manage launch options for their venues" 
ON launch_options FOR ALL 
TO authenticated 
USING (
  has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (
    SELECT venue_id FROM simplified_user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Update settings table to be more restrictive
DROP POLICY IF EXISTS "Allow full access to settings" ON settings;

CREATE POLICY "Super admins can manage global settings" 
ON settings FOR ALL 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));

-- Update machine_setup_status to be more restrictive
DROP POLICY IF EXISTS "Allow setup access" ON machine_setup_status;

CREATE POLICY "Allow authenticated setup access" 
ON machine_setup_status FOR ALL 
TO authenticated 
USING (true);

-- Update setup_tokens to be more restrictive  
DROP POLICY IF EXISTS "Allow setup tokens access" ON setup_tokens;

CREATE POLICY "Allow authenticated token access" 
ON setup_tokens FOR ALL 
TO authenticated 
USING (true);
