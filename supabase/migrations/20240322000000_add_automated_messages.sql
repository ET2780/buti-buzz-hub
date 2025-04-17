-- Add is_automated and sender_metadata columns to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sender_metadata JSONB;

-- Create index for faster queries on automated messages
CREATE INDEX IF NOT EXISTS idx_messages_is_automated ON public.messages(is_automated);

-- Update existing messages to have is_automated = false
UPDATE public.messages
SET is_automated = FALSE
WHERE is_automated IS NULL;

-- Update existing messages to have empty sender_metadata
UPDATE public.messages
SET sender_metadata = '{}'::jsonb
WHERE sender_metadata IS NULL; 