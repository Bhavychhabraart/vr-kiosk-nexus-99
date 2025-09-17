-- Add user vrarcade003@gmail.com as machine admin
-- First check if user profile exists, if not create it
DO $$
DECLARE
  user_profile_id uuid;
  venue_record record;
BEGIN
  -- Check if user profile exists
  SELECT id INTO user_profile_id 
  FROM public.profiles 
  WHERE email = 'vrarcade003@gmail.com';
  
  -- If user doesn't exist, we need to create a placeholder profile
  -- Note: The user will need to sign up through the auth system first
  IF user_profile_id IS NULL THEN
    RAISE NOTICE 'User profile not found. User must sign up through the authentication system first with email: vrarcade003@gmail.com';
    RETURN;
  END IF;
  
  -- Check if user already has machine_admin role
  IF EXISTS (
    SELECT 1 FROM public.simplified_user_roles 
    WHERE user_id = user_profile_id 
    AND role = 'machine_admin' 
    AND is_active = true
  ) THEN
    RAISE NOTICE 'User already has machine admin role';
    RETURN;
  END IF;
  
  -- Get the first available venue or create a new one for this user
  SELECT * INTO venue_record 
  FROM public.venues 
  WHERE status = 'active' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- If no venues exist, create a default venue for this user
  IF venue_record.id IS NULL THEN
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
      'VR Arcade 003',
      'Mumbai',
      'Maharashtra', 
      '123 VR Street',
      '400001',
      public.generate_machine_serial(),
      'VR-KIOSK-V1',
      'active'
    ) RETURNING * INTO venue_record;
    
    RAISE NOTICE 'Created new venue: % with ID: %', venue_record.name, venue_record.id;
  END IF;
  
  -- Assign machine admin role to the user for the venue
  INSERT INTO public.simplified_user_roles (user_id, role, venue_id, is_active)
  VALUES (user_profile_id, 'machine_admin', venue_record.id, true);
  
  RAISE NOTICE 'Successfully assigned machine admin role to user vrarcade003@gmail.com for venue: %', venue_record.name;
  
END $$;