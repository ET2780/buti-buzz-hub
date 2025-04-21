-- Add unique constraint on user_id
ALTER TABLE user_roles
ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Add foreign key constraint to auth.users
ALTER TABLE user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE; 