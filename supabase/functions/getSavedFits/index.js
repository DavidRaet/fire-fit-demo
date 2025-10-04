// Supabase Edge Function: getSavedFits
// Retrieves all saved outfits for a session

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('session_id')

    console.log('📥 Received getSavedFits request for session:', sessionId)

    // Validate required fields
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'session_id query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('📂 Fetching saved outfits...')

    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .eq('session_id', sessionId)
      .eq('saved', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log(`✅ Retrieved ${data.length} outfits`)

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error fetching outfits:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch outfits', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
