-- Create demo_song_requests table
CREATE TABLE IF NOT EXISTS demo_song_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    song_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_demo_song_requests_status_created_at ON demo_song_requests(status, created_at);

-- Function to get recent demo song requests
CREATE OR REPLACE FUNCTION get_recent_demo_song_requests()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    song_name TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    user_name TEXT,
    user_avatar TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        sr.user_id,
        sr.song_name,
        sr.status,
        sr.created_at,
        p.name as user_name,
        p.avatar as user_avatar
    FROM demo_song_requests sr
    JOIN profiles p ON sr.user_id = p.id
    WHERE sr.status = 'pending'
    AND sr.created_at >= NOW() - INTERVAL '2 hours'
    ORDER BY sr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to approve a demo song request
CREATE OR REPLACE FUNCTION approve_demo_song_request(request_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE demo_song_requests
    SET status = 'approved',
        updated_at = NOW()
    WHERE id = request_id
    RETURNING json_build_object(
        'id', id,
        'user_id', user_id,
        'song_name', song_name,
        'status', status,
        'created_at', created_at
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to reject a demo song request
CREATE OR REPLACE FUNCTION reject_demo_song_request(request_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE demo_song_requests
    SET status = 'rejected',
        updated_at = NOW()
    WHERE id = request_id
    RETURNING json_build_object(
        'id', id,
        'user_id', user_id,
        'song_name', song_name,
        'status', status,
        'created_at', created_at
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE demo_song_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own demo song requests
CREATE POLICY "Users can insert their own demo song requests"
    ON demo_song_requests FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = user_id
        )
    );

-- Allow users to view their own demo song requests
CREATE POLICY "Users can view their own demo song requests"
    ON demo_song_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = user_id
        )
    );

-- Allow admins to view all demo song requests
CREATE POLICY "Admins can view all demo song requests"
    ON demo_song_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Allow admins to update demo song requests
CREATE POLICY "Admins can update demo song requests"
    ON demo_song_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    ); 