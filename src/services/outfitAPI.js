// src/services/outfitAPI.js
// API wrapper functions for outfit operations

import { supabase } from '../lib/client'
import { uploadOutfitImage } from '../lib/storage'
import { generateMockAnalysis, simulateDelay } from '../utils/mockAI'

/**
 * Upload a file to Supabase Storage
 * Calls the upload-file Edge Function or uses direct storage API
 * @param {File} file - File object to upload
 * @param {string} category - Category folder (top, bottom, shoes, accessories)
 * @param {string} sessionId - Demo session ID
 * @returns {Promise<string>} Public URL of uploaded file
 */
export async function uploadFile(file, category, sessionId) {
  try {
    if (!file) {
      throw new Error('No file provided')
    }

    console.log(`📤 Uploading ${category} image...`)
    
    // Try using Edge Function first (optional - for advanced processing)
    // For now, use direct storage upload for simplicity
    
    // Create path with session folder structure
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${sessionId}/originals/${category}_${fileName}`

    const { data, error } = await supabase.storage
      .from('outfit-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('outfit-images')
      .getPublicUrl(filePath)

    console.log(`✅ ${category} uploaded:`, publicUrlData.publicUrl)
    return publicUrlData.publicUrl

  } catch (error) {
    console.error(`❌ Error uploading ${category}:`, error.message)
    throw error
  }
}

/**
 * Analyze outfit using Supabase Edge Function (analyze-fit) or mock AI fallback
 * Calls: supabase/functions/analyze-fit/index.js
 * @param {Object} payload - Analysis payload
 * @param {string} payload.session_id - Session ID
 * @param {string} payload.top_url - Top image URL
 * @param {string} payload.top_layer_url - Top layer image URL
 * @param {string} payload.bottom_url - Bottom image URL
 * @param {string} payload.shoes_url - Shoes image URL
 * @param {string} payload.accessories_url - Accessories image URL
 * @param {string} payload.season - Season context
 * @param {string} payload.formality - Formality level
 * @returns {Promise<Object>} AI analysis result
 */
export async function analyzeFit(payload) {
  try {
    console.log('🤖 Starting outfit analysis...', payload)

    // Call Supabase Edge Function: analyze-fit
    try {
      console.log('📡 Attempting to call Edge Function...')
      
      const { data, error } = await supabase.functions.invoke('analyze-fit', {
        body: payload
      })

      if (error) {
        console.warn('⚠️ Edge Function error:', error)
        throw error
      }
      
      if (data && (data.top || data.ai_description)) {
        console.log('✅ AI analysis complete (Edge Function)')
        return data
      }
      
      console.warn('⚠️ Edge Function returned empty data')
      throw new Error('Empty response from Edge Function')
      
    } catch (edgeFunctionError) {
      console.warn('⚠️ Edge Function not available, falling back to mock AI:', edgeFunctionError.message)
    }

    // Fallback to mock AI
    console.log('🎭 Using mock AI generator...')
    await simulateDelay(1500) // Simulate API call
    const mockResult = generateMockAnalysis({
      topUrl: payload.top_url,
      topLayerUrl: payload.top_layer_url,
      bottomUrl: payload.bottom_url,
      shoesUrl: payload.shoes_url,
      accessoriesUrl: payload.accessories_url,
      season: payload.season,
      formality: payload.formality
    })

    console.log('✅ AI analysis complete (Mock)')
    return mockResult

  } catch (error) {
    console.error('❌ Error analyzing outfit:', error.message)
    throw error
  }
}

/**
 * Save analyzed outfit to Supabase
 * Calls: supabase/functions/save-fit/index.js (Edge Function) or direct DB insert
 * @param {Object} payload - Outfit data to save
 * @returns {Promise<Object>} Saved outfit record
 */
export async function saveFit(payload) {
  try {
    console.log('💾 Saving outfit...', payload)

    const outfitData = {
      session_id: payload.session_id,
      top_url: payload.top_url,
      top_layer_url: payload.top_layer_url,
      bottom_url: payload.bottom_url,
      shoes_url: payload.shoes_url,
      accessories_url: payload.accessories_url,
      ai_description: payload.ai_description,
      ai_image_url: payload.ai_image_url,
      season: payload.season,
      formality: payload.formality,
      aesthetic: payload.aesthetic || [],
      colors: payload.colors || {},
      accessories_description: payload.accessories_description,
      accessories_tags: payload.accessories_tags || [],
      saved: true,
      created_at: new Date().toISOString()
    }

    // Try using Edge Function first
    try {
      const { data, error } = await supabase.functions.invoke('save-fit', {
        body: outfitData
      })

      if (error) throw error

      console.log('✅ Outfit saved via Edge Function:', data.id)
      return data

    } catch (edgeFunctionError) {
      console.warn('⚠️ Edge Function not available, using direct DB insert:', edgeFunctionError.message)
      
      // Fallback: Direct database insert
      try {
        const { data, error } = await supabase
          .from('outfits')
          .insert(outfitData)
          .select()
          .single()

        if (error) throw error

        console.log('✅ Outfit saved to Supabase:', data.id)
        return data

      } catch (supabaseError) {
        console.warn('⚠️ Could not save to Supabase, saving locally:', supabaseError.message)
        
        // Fallback: save to localStorage
        const localOutfits = JSON.parse(localStorage.getItem('saved_outfits') || '[]')
        const localOutfit = {
          ...outfitData,
          id: `local_${Date.now()}`
        }
        localOutfits.push(localOutfit)
        localStorage.setItem('saved_outfits', JSON.stringify(localOutfits))
        
        console.log('✅ Outfit saved locally:', localOutfit.id)
        return localOutfit
      }
    }

  } catch (error) {
    console.error('❌ Error saving outfit:', error.message)
    throw error
  }
}

/**
 * Get all saved outfits for a session
 * Calls: supabase/functions/getSavedFits/index.js (Edge Function) or direct DB query
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} Array of saved outfits
 */
export async function getSavedFits(sessionId) {
  try {
    console.log('📂 Fetching saved outfits for session:', sessionId)

    // Try using Edge Function first
    try {
      const { data, error } = await supabase.functions.invoke('getSavedFits', {
        body: { session_id: sessionId }
      })

      if (error) throw error

      console.log(`✅ Retrieved ${data.length} outfits via Edge Function`)
      return data

    } catch (edgeFunctionError) {
      console.warn('⚠️ Edge Function not available, using direct DB query:', edgeFunctionError.message)
      
      // Fallback: Direct database query
      try {
        const { data, error } = await supabase
          .from('outfits')
          .select('*')
          .eq('session_id', sessionId)
          .eq('saved', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        console.log(`✅ Retrieved ${data.length} outfits from Supabase`)
        return data

      } catch (supabaseError) {
        console.warn('⚠️ Could not fetch from Supabase, checking localStorage:', supabaseError.message)
        
        // Fallback: get from localStorage
        const localOutfits = JSON.parse(localStorage.getItem('saved_outfits') || '[]')
        const sessionOutfits = localOutfits.filter(outfit => outfit.session_id === sessionId)
        
        console.log(`✅ Retrieved ${sessionOutfits.length} outfits from localStorage`)
        return sessionOutfits
      }
    }

  } catch (error) {
    console.error('❌ Error fetching saved outfits:', error.message)
    return []
  }
}

/**
 * Delete an outfit
 * @param {string} outfitId - Outfit ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteOutfit(outfitId) {
  try {
    console.log('🗑️ Deleting outfit:', outfitId)

    // Try Supabase first
    if (!outfitId.startsWith('local_')) {
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId)

      if (error) throw error
      console.log('✅ Outfit deleted from Supabase')
      return true
    }

    // Delete from localStorage
    const localOutfits = JSON.parse(localStorage.getItem('saved_outfits') || '[]')
    const updatedOutfits = localOutfits.filter(outfit => outfit.id !== outfitId)
    localStorage.setItem('saved_outfits', JSON.stringify(updatedOutfits))
    
    console.log('✅ Outfit deleted from localStorage')
    return true

  } catch (error) {
    console.error('❌ Error deleting outfit:', error.message)
    return false
  }
}
