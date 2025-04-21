import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const supabaseUrl: string = Deno.env.get('SUPABASE_URL')!
const supabaseKey: string = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: Request): Promise<Response> {
  try {
    const { data, error } = await supabase.rpc('cleanup_old_data')
    
    if (error) {
      console.error('Error running cleanup_old_data:', error)
      return new Response('Error', { status: 500 })
    }

    // Log the cleanup in system_logs
    await supabase
      .from('system_logs')
      .insert({
        action: 'cleanup',
        details: `Edge Function triggered cleanup completed at ${new Date().toISOString()}`
      })

    return new Response('Cleanup completed successfully', { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 