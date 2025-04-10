-- Enable RLS on user_roles table if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view specific user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can query roles by user_id" ON public.user_roles;

-- Create new policies
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view specific user roles"
    ON public.user_roles FOR SELECT
    USING (true);  -- Allow any authenticated user to view any user's role

-- Add specific policy for role queries
CREATE POLICY "Users can query roles by user_id"
    ON public.user_roles FOR SELECT
    USING (true);  -- Allow querying roles by user_id

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Use a direct query with bypass RLS
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies using the function
CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    USING (is_admin(auth.uid()));

-- Grant necessary permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO service_role; 