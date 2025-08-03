-- First create a profile for the current user if it doesn't exist
INSERT INTO profiles (user_id, username, full_name, role, is_active)
VALUES (
  auth.uid(), 
  COALESCE(auth.email(), 'admin'),
  COALESCE(auth.email(), 'Administrator'),
  'admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin',
  is_active = true;

-- Then grant cybercrime access
INSERT INTO cybercrime_access (user_id, granted_by, is_active)
VALUES (auth.uid(), auth.uid(), true)
ON CONFLICT (user_id) DO UPDATE SET is_active = true;