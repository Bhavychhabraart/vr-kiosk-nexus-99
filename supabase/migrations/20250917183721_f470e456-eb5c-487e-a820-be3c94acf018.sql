-- Mark user setup as completed with all access
-- Update onboarding status for vrarcadia003@gmail.com
UPDATE public.user_onboarding_status 
SET 
  status = 'completed',
  setup_progress = jsonb_build_object(
    'venue_created', true,
    'games_assigned', true,
    'settings_configured', true,
    'role_assigned', true,
    'manually_completed', true,
    'all_access_granted', true
  ),
  completed_at = now()
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'vrarcadia003@gmail.com'
);

-- Update onboarding status for Vrrealverse@gmail.com
UPDATE public.user_onboarding_status 
SET 
  status = 'completed',
  setup_progress = jsonb_build_object(
    'venue_created', true,
    'games_assigned', true,
    'settings_configured', true,
    'role_assigned', true,
    'manually_completed', true,
    'all_access_granted', true
  ),
  completed_at = now()
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'Vrrealverse@gmail.com'
);

-- Ensure both users have machine_admin roles active
UPDATE public.simplified_user_roles 
SET is_active = true
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE email IN ('vrarcadia003@gmail.com', 'Vrrealverse@gmail.com')
) AND role = 'machine_admin';

-- Ensure all games are assigned to their venues
INSERT INTO public.machine_games (venue_id, game_id, is_active, assigned_by)
SELECT DISTINCT v.id, g.id, true, 'admin-override'
FROM public.venues v
CROSS JOIN public.games g
WHERE v.id IN (
  SELECT DISTINCT sur.venue_id 
  FROM public.simplified_user_roles sur
  JOIN public.profiles p ON p.id = sur.user_id
  WHERE p.email IN ('vrarcadia003@gmail.com', 'Vrrealverse@gmail.com')
  AND sur.role = 'machine_admin'
  AND sur.is_active = true
)
AND g.is_active = true
ON CONFLICT (venue_id, game_id) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  assigned_by = EXCLUDED.assigned_by;