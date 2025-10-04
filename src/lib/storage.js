// src/lib/storage.js
import { supabase } from './client'
export async function uploadOutfitImage(file, category) {
  try {
    if (!file) return null

    const filePath = `${category}/${Date.now()}_${file.name}`

    const { data, error } = await supabase.storage
      .from('outfit-images')
      .upload(filePath, file)

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
      .from('outfit-images')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error(`Error uploading ${category} image:`, error.message)
    return null
  }
}
