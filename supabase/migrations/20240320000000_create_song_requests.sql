-- Create song_requests table
CREATE TABLE IF NOT EXISTS song_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    song_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_song_requests_status_created_at ON song_requests(status, created_at);

-- Function to get recent song requests
CREATE OR REPLACE FUNCTION get_recent_song_requests()
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
    FROM song_requests sr
    JOIN profiles p ON sr.user_id = p.id
    WHERE sr.status = 'pending'
    AND sr.created_at >= NOW() - INTERVAL '2 hours'
    ORDER BY sr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to approve a song request
CREATE OR REPLACE FUNCTION approve_song_request(request_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE song_requests
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

-- Function to reject a song request
CREATE OR REPLACE FUNCTION reject_song_request(request_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE song_requests
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
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own song requests
CREATE POLICY "Users can insert their own song requests"
    ON song_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own song requests
CREATE POLICY "Users can view their own song requests"
    ON song_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Allow admins to view all song requests
CREATE POLICY "Admins can view all song requests"
    ON song_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Allow admins to update song requests
CREATE POLICY "Admins can update song requests"
    ON song_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    ); 