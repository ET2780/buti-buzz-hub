-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert their own song requests" ON song_requests;

-- Create new insert policy that allows inserts if user exists in profiles table
CREATE POLICY "Users can insert their own song requests"
    ON song_requests FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = user_id
        )
    ); 