
-- Ensure support_tickets table has proper structure and RLS policies
-- Add any missing columns for better support ticket management
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS assigned_to_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS ticket_number text UNIQUE;

-- Create a function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  -- Get current date in YYYYMMDD format
  SELECT 'TK-' || to_char(now(), 'YYYYMMDD') || '-' || 
         LPAD((COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM '\d+$') AS integer)), 0) + 1)::text, 4, '0')
  INTO new_number
  FROM support_tickets 
  WHERE ticket_number LIKE 'TK-' || to_char(now(), 'YYYYMMDD') || '-%';
  
  RETURN new_number;
END;
$$;

-- Add trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS set_ticket_number_trigger ON support_tickets;
CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy for machine admins to view tickets for their venues
CREATE POLICY "Machine admins can view venue tickets" ON public.support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM simplified_user_roles sur
      WHERE sur.user_id = auth.uid()
        AND sur.role = 'machine_admin'
        AND sur.venue_id = support_tickets.venue_id
        AND sur.is_active = true
    )
  );

-- Policy for machine admins to create tickets for their venues
CREATE POLICY "Machine admins can create venue tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM simplified_user_roles sur
      WHERE sur.user_id = auth.uid()
        AND sur.role = 'machine_admin'
        AND sur.venue_id = support_tickets.venue_id
        AND sur.is_active = true
    )
  );

-- Policy for super admins to view all tickets
CREATE POLICY "Super admins can view all tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM simplified_user_roles sur
      WHERE sur.user_id = auth.uid()
        AND sur.role = 'super_admin'
        AND sur.is_active = true
    )
  );

-- Policy for super admins to update all tickets
CREATE POLICY "Super admins can update all tickets" ON public.support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM simplified_user_roles sur
      WHERE sur.user_id = auth.uid()
        AND sur.role = 'super_admin'
        AND sur.is_active = true
    )
  );
