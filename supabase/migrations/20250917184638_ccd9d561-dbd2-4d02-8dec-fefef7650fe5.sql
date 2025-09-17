-- Fix critical RLS security issues
-- Enable RLS on tables that are missing it

ALTER TABLE rfid_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiosk_owners ENABLE ROW LEVEL SECURITY;  
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add restrictive RLS policies for these tables
-- RFID Cards - only accessible to machine admins of venues
CREATE POLICY "Machine admins can manage venue RFID cards" 
ON rfid_cards FOR ALL 
TO authenticated 
USING (
  has_simplified_role(auth.uid(), 'super_admin') OR
  EXISTS (
    SELECT 1 FROM simplified_user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'machine_admin' 
    AND is_active = true
  )
);

-- Venues - machine admins can view their venues, super admins can manage all
CREATE POLICY "Machine admins can view their venues" 
ON venues FOR SELECT 
TO authenticated 
USING (
  has_simplified_role(auth.uid(), 'super_admin') OR
  id IN (
    SELECT venue_id FROM simplified_user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Super admins can manage all venues" 
ON venues FOR ALL 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));

-- Machine Auth - only super admins can manage
CREATE POLICY "Super admins can manage machine auth" 
ON machine_auth FOR ALL 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));

-- Payment Methods - venue-specific access
CREATE POLICY "Users can manage payment methods for their venues" 
ON payment_methods FOR ALL 
TO authenticated 
USING (
  has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (
    SELECT venue_id FROM simplified_user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Popular Games - venue-specific read access
CREATE POLICY "Users can view popular games for their venues" 
ON popular_games FOR SELECT 
TO authenticated 
USING (
  has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (
    SELECT venue_id FROM simplified_user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Upcoming Products - public read access
CREATE POLICY "Authenticated users can view upcoming products" 
ON upcoming_products FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Super admins can manage upcoming products" 
ON upcoming_products FOR ALL 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));

-- Subscriptions - venue-specific access
CREATE POLICY "Users can view subscriptions for their venues" 
ON subscriptions FOR SELECT 
TO authenticated 
USING (
  has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (
    SELECT venue_id FROM simplified_user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Super admins can manage subscriptions" 
ON subscriptions FOR ALL 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));

-- Auth Attempts - super admin only
CREATE POLICY "Super admins can view auth attempts" 
ON auth_attempts FOR SELECT 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));

-- Customers - venue-specific access
CREATE POLICY "Users can view customers for their venues" 
ON customers FOR SELECT 
TO authenticated 
USING (
  has_simplified_role(auth.uid(), 'super_admin') OR 
  preferred_venue_id IN (
    SELECT venue_id FROM simplified_user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Kiosk Owners - venue-specific access
CREATE POLICY "Users can manage kiosk data for their venues" 
ON kiosk_owners FOR ALL 
TO authenticated 
USING (
  has_simplified_role(auth.uid(), 'super_admin') OR 
  venue_id IN (
    SELECT venue_id FROM simplified_user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Admin Users - super admin only
CREATE POLICY "Super admins can manage admin users" 
ON admin_users FOR ALL 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));

-- Business Analytics - super admin only
CREATE POLICY "Super admins can view business analytics" 
ON business_analytics FOR SELECT 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));

-- Notifications - simplified policy for now
CREATE POLICY "Super admins can manage notifications" 
ON notifications FOR ALL 
TO authenticated 
USING (has_simplified_role(auth.uid(), 'super_admin'));