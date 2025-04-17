-- Create function to clean up old data
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete messages older than 24 hours from non-admin users
    DELETE FROM public.messages
    WHERE created_at < NOW() - INTERVAL '24 hours'
    AND sender_id NOT IN (
        SELECT id FROM public.profiles WHERE tags @> ARRAY['admin']
    );

    -- Delete profiles of guest users older than 24 hours
    DELETE FROM public.profiles
    WHERE created_at < NOW() - INTERVAL '24 hours'
    AND tags IS NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.messages 
        WHERE messages.sender_id = profiles.id 
        AND messages.created_at >= NOW() - INTERVAL '24 hours'
    );

    -- Delete song requests older than 24 hours
    DELETE FROM public.song_requests
    WHERE created_at < NOW() - INTERVAL '24 hours';

    -- Log the cleanup
    INSERT INTO public.system_logs (action, details)
    VALUES ('cleanup', 'Nightly cleanup completed at ' || NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create system_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a cron job to run the cleanup at midnight Israel time
-- Note: This needs to be run in the Supabase dashboard as it requires superuser privileges
-- The cron job will be set to run at 22:00 UTC (midnight Israel time during standard time)
-- and 21:00 UTC (midnight Israel time during daylight savings time)
-- You'll need to adjust this in the Supabase dashboard based on the current time zone offset

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.cleanup_old_data TO service_role;
GRANT ALL ON public.system_logs TO service_role; 