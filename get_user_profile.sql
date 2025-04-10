-- Function to get complete user profile data including tags
-- Run this in the Supabase SQL Editor to create the get_user_profile RPC function

-- Drop the function if it already exists to prevent errors
DROP FUNCTION IF EXISTS get_user_profile(UUID);

-- Create the function
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'name', name,
        'avatar', avatar,
        'tags', COALESCE(tags, '{}'),
        'custom_status', custom_status
    ) INTO result
    FROM profiles
    WHERE id = user_id;
    
    -- Return empty JSON if user not found
    IF result IS NULL THEN
        RETURN json_build_object(
            'id', user_id,
            'name', NULL,
            'avatar', NULL,
            'tags', '{}',
            'custom_status', NULL
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql; 