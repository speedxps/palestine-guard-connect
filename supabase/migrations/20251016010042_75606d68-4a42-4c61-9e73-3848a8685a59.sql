-- Allow admins to delete user roles when deleting users
DROP POLICY IF EXISTS "Admins can delete user roles" ON user_roles;

CREATE POLICY "Admins can delete user roles"
ON user_roles
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Add cascade delete for user_roles when profile is deleted
DO $$ 
BEGIN
    -- Drop existing foreign key if it exists
    ALTER TABLE user_roles 
    DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
    
    -- Add new foreign key with cascade delete
    ALTER TABLE user_roles
    ADD CONSTRAINT user_roles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error updating foreign key: %', SQLERRM;
END $$;