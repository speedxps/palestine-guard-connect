-- Grant admin role to current user
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = auth.uid();

-- Also grant cybercrime access to current user
INSERT INTO cybercrime_access (user_id, granted_by, is_active)
VALUES (auth.uid(), auth.uid(), true)
ON CONFLICT (user_id) DO UPDATE SET is_active = true;