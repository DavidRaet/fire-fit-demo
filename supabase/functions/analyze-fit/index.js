// Supabase Edge Function: analyze-fit
// Analyzes outfit images using Google AI Studio (Gemini Vision API)

import { GoogleGenerativeAI } from "@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to fetch image as base64
async function urlToGenerativePart(imageUrl) {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  
  // Detect mime type from URL or default to jpeg
  const mimeType = imageUrl.includes('.png') ? 'image/png' : 'image/jpeg';
  
  return {
    inlineData: {
      data: base64,
      mimeType: mimeType,
    },
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('📥 Received analyze request:', payload)

    const {
      session_id,
      top_url,
      top_layer_url,
      bottom_url,
      shoes_url,
      accessories_url,
      season,
      formality
    } = payload

    // Validate required fields
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch Google API key from Supabase secrets
    const apiKey = Deno.env.get('GOOGLE_API_KEY')
    if (!apiKey) {
      console.error('❌ GOOGLE_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Google API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Google AI Studio with the API key
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Build analysis prompt
    const imageUrls = [
      { url: top_url, label: 'top' },
      { url: top_layer_url, label: 'top layer' },
      { url: bottom_url, label: 'bottom' },
      { url: shoes_url, label: 'shoes' },
      { url: accessories_url, label: 'accessories' }
    ].filter(item => item.url)

    if (imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `You are a fashion AI assistant analyzing outfit images for the Fire Fit app.

Context:
- Season: ${season || 'not specified'}
- Formality: ${formality || 'casual'}
- Images provided: ${imageUrls.map(i => i.label).join(', ')}

Analyze the outfit images and provide a JSON response with the following structure:
{
  "top": "brief description of the top (e.g., 'white cropped t-shirt')",
  "topLayer": "brief description of top layer if present (e.g., 'denim jacket')",
  "bottom": "brief description of bottom (e.g., 'light wash jeans')",
  "shoes": "brief description of shoes (e.g., 'white sneakers')",
  "accessories": ["array", "of", "accessories"],
  "aesthetic": ["array", "of", "style", "tags"],
  "colors": {
    "top": "primary color",
    "topLayer": "primary color",
    "bottom": "primary color",
    "shoes": "primary color",
    "accessories": "color description"
  },
  "ai_description": "A complete sentence describing the entire outfit",
  "accessories_description": "Specific description of accessories if present",
  "accessories_tags": ["tag1", "tag2"],
  "season": "${season}",
  "formality": "${formality}",
  "confidence": 0.85
}

Provide only the JSON response, no additional text.`

    console.log('🤖 Fetching and processing images...')

    // Convert image URLs to base64 parts for Gemini
    const imageParts = await Promise.all(
      imageUrls.map(item => urlToGenerativePart(item.url))
    )

    console.log('🤖 Sending to Google AI Studio...')

    // Generate content with images and prompt
    const result = await model.generateContent([prompt, ...imageParts])
    const response = await result.response
    const text = response.text()

    console.log('📄 AI Response:', text)

    // Parse JSON from response
    let analysisData
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysisData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError)
      console.error('Raw response:', text)
      throw new Error('AI response was not valid JSON')
    }

    // Add metadata
    analysisData.timestamp = new Date().toISOString()
    analysisData.ai_image_url = top_url || bottom_url || shoes_url // Use first available image as preview

    console.log('✅ Analysis complete')

    return new Response(
      JSON.stringify(analysisData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error analyzing outfit:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze outfit', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})




