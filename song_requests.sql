-- Create song_requests table
CREATE TABLE IF NOT EXISTS public.song_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    song_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_song_requests_status_created_at ON public.song_requests(status, created_at);

-- Enable RLS
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own song requests" ON public.song_requests;
DROP POLICY IF EXISTS "Users can insert their own song requests" ON public.song_requests;
DROP POLICY IF EXISTS "Admins can view all song requests" ON public.song_requests;
DROP POLICY IF EXISTS "Admins can update all song requests" ON public.song_requests;

-- Create policies
CREATE POLICY "Users can view their own song requests"
    ON public.song_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own song requests"
    ON public.song_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all song requests"
    ON public.song_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all song requests"
    ON public.song_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create function to get recent song requests
CREATE OR REPLACE FUNCTION get_recent_song_requests(hours INTEGER DEFAULT 2)
RETURNS TABLE (
    id UUID,
    user_name TEXT,
    user_avatar TEXT,
    song_name TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        p.name as user_name,
        p.avatar as user_avatar,
        sr.song_name,
        sr.status,
        sr.created_at
    FROM public.song_requests sr
    JOIN public.profiles p ON sr.user_id = p.id
    WHERE sr.created_at >= NOW() - (hours || ' hours')::INTERVAL
    AND sr.status = 'pending'
    ORDER BY sr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to approve a song request
CREATE OR REPLACE FUNCTION approve_song_request(request_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if the user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can approve song requests';
    END IF;

    UPDATE public.song_requests
    SET 
        status = 'approved',
        updated_at = NOW()
    WHERE id = request_id
    RETURNING json_build_object(
        'id', id,
        'song_name', song_name,
        'status', status,
        'created_at', created_at
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject a song request
CREATE OR REPLACE FUNCTION reject_song_request(request_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if the user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can reject song requests';
    END IF;

    UPDATE public.song_requests
    SET 
        status = 'rejected',
        updated_at = NOW()
    WHERE id = request_id
    RETURNING json_build_object(
        'id', id,
        'song_name', song_name,
        'status', status,
        'created_at', created_at
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.song_requests TO authenticated;
GRANT ALL ON public.song_requests TO service_role;
GRANT EXECUTE ON FUNCTION get_recent_song_requests TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_song_requests TO service_role;
GRANT EXECUTE ON FUNCTION approve_song_request TO authenticated;
GRANT EXECUTE ON FUNCTION approve_song_request TO service_role;
GRANT EXECUTE ON FUNCTION reject_song_request TO authenticated;
GRANT EXECUTE ON FUNCTION reject_song_request TO service_role;

-- Add explicit grants for the insert operation
GRANT INSERT ON public.song_requests TO authenticated;
GRANT INSERT ON public.song_requests TO service_role; 