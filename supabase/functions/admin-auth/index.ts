import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: Request) {
  try {
    console.log('Admin auth request received');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid auth header');
      return new Response(JSON.stringify({ error: 'Missing authorization token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Extract the token
    const token = authHeader.split(' ')[1]
    console.log('Token extracted');

    // Verify the token and get the user
    console.log('Verifying token...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    console.log('Token verification result:', { user, authError });

    if (authError || !user) {
      console.log('Token verification failed:', authError);
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if user is admin
    console.log('Checking admin role for user:', user.id);
    const { data: role, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    console.log('Role check result:', { role, roleError });

    if (roleError || role?.role !== 'admin') {
      console.log('User is not admin');
      return new Response(JSON.stringify({ error: 'Not authorized as admin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Admin verification successful');
    // Return success with user data
    return new Response(JSON.stringify({ 
      user: {
        id: user.id,
        email: user.email,
        role: role.role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Admin auth error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 