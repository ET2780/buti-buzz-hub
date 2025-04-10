-- Create pinned_messages table
CREATE TABLE IF NOT EXISTS public.pinned_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow admins to perform all operations
CREATE POLICY "Admins can manage pinned messages" ON public.pinned_messages
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'isAdmin')::boolean = true
    )
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'isAdmin')::boolean = true
    );

-- Allow all users to read pinned messages
CREATE POLICY "All users can read pinned messages" ON public.pinned_messages
    FOR SELECT
    TO authenticated
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.pinned_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 