// Supabase Edge Function: upload-file
// Handles file uploads to Supabase Storage

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
    const formData = await req.formData()
    const file = formData.get('file')
    const category = formData.get('category')
    const sessionId = formData.get('session_id')

    console.log('📥 Received upload request:', { category, sessionId })

    // Validate required fields
    if (!file || !category || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'file, category, and session_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate file path
    const timestamp = Date.now()
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${sessionId}/originals/${category}_${timestamp}_${fileName}`

    console.log('📤 Uploading file to storage:', filePath)

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('outfit-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      throw uploadError
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('outfit-images')
      .getPublicUrl(filePath)

    console.log('✅ File uploaded successfully:', publicUrlData.publicUrl)

    return new Response(
      JSON.stringify({ url: publicUrlData.publicUrl }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error uploading file:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload file', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
