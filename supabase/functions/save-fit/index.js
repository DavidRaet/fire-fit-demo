// Supabase Edge Function: save-fit
// Saves analyzed outfit to the database

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const payload = await req.json()
    console.log('📥 Received save-fit request:', payload)

    const {
      session_id,
      top_url,
      top_layer_url,
      bottom_url,
      shoes_url,
      accessories_url,
      ai_description,
      ai_image_url,
      season,
      formality,
      aesthetic,
      colors,
      accessories_description,
      accessories_tags
    } = payload

    // Validate required fields
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insert outfit record
    const outfitData = {
      session_id,
      top_url: top_url || null,
      top_layer_url: top_layer_url || null,
      bottom_url: bottom_url || null,
      shoes_url: shoes_url || null,
      accessories_url: accessories_url || null,
      ai_description: ai_description || null,
      ai_image_url: ai_image_url || null,
      season: season || null,
      formality: formality || null,
      aesthetic: aesthetic || [],
      colors: colors || {},
      accessories_description: accessories_description || null,
      accessories_tags: accessories_tags || [],
      saved: true,
      created_at: new Date().toISOString()
    }

    console.log('💾 Saving outfit to database...')

    const { data, error } = await supabase
      .from('outfits')
      .insert(outfitData)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log('✅ Outfit saved successfully:', data.id)

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error saving outfit:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to save outfit', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
