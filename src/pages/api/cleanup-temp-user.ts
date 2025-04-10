import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { userId, isTemporary } = await req.json();

    if (!userId || !isTemporary) {
      return new Response('Invalid request', { status: 400 });
    }

    // Delete temporary user's messages
    await supabase
      .from('messages')
      .delete()
      .eq('user_id', userId)
      .eq('is_temporary', true);

    return new Response('Cleanup successful', { status: 200 });
  } catch (error) {
    console.error('Error in cleanup-temp-user:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 