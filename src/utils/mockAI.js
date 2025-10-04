// src/utils/mockAI.js
// Mock AI response generator for demo/fallback scenarios

import { getSeasonPreset } from './seasonPresets'

/**
 * Generate a mock AI analysis response
 * This mimics the structure returned by Google AI Studio
 * @param {Object} params - Analysis parameters
 * @param {string} params.topUrl - Top image URL
 * @param {string} params.topLayerUrl - Top layer image URL
 * @param {string} params.bottomUrl - Bottom image URL
 * @param {string} params.shoesUrl - Shoes image URL
 * @param {string} params.accessoriesUrl - Accessories image URL
 * @param {string} params.season - Selected season
 * @param {string} params.formality - Formality level
 * @returns {Object} Mock AI response matching expected structure
 */
export function generateMockAnalysis({ 
  topUrl, 
  topLayerUrl,
  bottomUrl, 
  shoesUrl, 
  accessoriesUrl, 
  season = 'Fall', 
  formality = 'casual' 
}) {
  console.log('🤖 Generating mock AI analysis (fallback mode)')
  
  const seasonPreset = getSeasonPreset(season)
  
  // Mock clothing item descriptions based on season
  const topDescriptions = {
    Spring: ['floral blouse', 'light cardigan', 'pastel sweater', 'cotton tee'],
    Summer: ['white tank top', 'crop top', 'linen shirt', 'bright tee'],
    Fall: ['rust sweater', 'olive button-up', 'denim jacket', 'cozy hoodie'],
    Winter: ['chunky knit sweater', 'thermal top', 'turtleneck', 'fleece pullover']
  }
  
  const topLayerDescriptions = {
    Spring: ['light denim jacket', 'bomber jacket', 'cardigan'],
    Summer: ['kimono', 'sheer cover-up', 'vest'],
    Fall: ['leather jacket', 'oversized blazer', 'wool coat'],
    Winter: ['puffer jacket', 'parka', 'peacoat', 'trench coat']
  }
  
  const bottomDescriptions = {
    Spring: ['light wash jeans', 'floral skirt', 'khaki pants', 'midi skirt'],
    Summer: ['denim shorts', 'white pants', 'flowy skirt', 'linen trousers'],
    Fall: ['dark jeans', 'corduroy pants', 'plaid skirt', 'cargo pants'],
    Winter: ['black jeans', 'wool trousers', 'fleece-lined leggings', 'thermal pants']
  }
  
  const shoesDescriptions = {
    Spring: ['white sneakers', 'canvas shoes', 'loafers', 'sandals'],
    Summer: ['slides', 'espadrilles', 'sandals', 'white sneakers'],
    Fall: ['ankle boots', 'combat boots', 'sneakers', 'oxfords'],
    Winter: ['winter boots', 'Chelsea boots', 'insulated sneakers', 'hiking boots']
  }
  
  // Randomly select descriptions
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
  
  const top = topUrl ? getRandomItem(topDescriptions[season]) : null
  const topLayer = topLayerUrl ? getRandomItem(topLayerDescriptions[season]) : null
  const bottom = bottomUrl ? getRandomItem(bottomDescriptions[season]) : null
  const shoes = shoesUrl ? getRandomItem(shoesDescriptions[season]) : null
  
  // Generate accessories description
  const accessoriesList = accessoriesUrl 
    ? seasonPreset.recommendedAccessories.slice(0, 2)
    : []
  
  // Generate aesthetic tags
  const aestheticOptions = {
    casual: ['streetwear', 'Y2K', 'casual', 'everyday', 'relaxed'],
    'semi-formal': ['smart casual', 'chic', 'polished', 'refined'],
    'business-casual': ['professional', 'corporate', 'minimalist', 'classic'],
    sports: ['athletic', 'sporty', 'performance', 'active']
  }
  
  const baseAesthetic = aestheticOptions[formality] || aestheticOptions.casual
  const aesthetic = [
    ...seasonPreset.aesthetic.slice(0, 2),
    getRandomItem(baseAesthetic)
  ]
  
  // Generate color palette
  const colors = {
    top: top ? seasonPreset.recommendedColors[0] : null,
    topLayer: topLayer ? seasonPreset.recommendedColors[1] : null,
    bottom: bottom ? seasonPreset.recommendedColors[2] : null,
    shoes: shoes ? seasonPreset.recommendedColors[3] || 'neutral' : null,
    accessories: accessoriesList.length > 0 ? 'mixed metals' : null
  }
  
  // Mock generated image URL (would be from Nanobanana in production)
  // Use a simple SVG data URL to avoid CORS issues
  const ai_image_url = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23334155' width='400' height='600'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial, sans-serif' font-size='24' fill='%238B5CF6' text-anchor='middle' dominant-baseline='middle'%3E🔥 AI Generated%3C/text%3E%3Ctext x='50%25' y='55%25' font-family='Arial, sans-serif' font-size='18' fill='%2394A3B8' text-anchor='middle' dominant-baseline='middle'%3EOutfit Preview%3C/text%3E%3C/svg%3E`
  
  return {
    top,
    topLayer,
    bottom,
    shoes,
    accessories: accessoriesList,
    aesthetic,
    colors,
    ai_description: buildDescription({ top, topLayer, bottom, shoes, accessories: accessoriesList }),
    accessories_description: accessoriesList.length > 0 
      ? `Accessorized with ${accessoriesList.join(' and ')}` 
      : null,
    accessories_tags: accessoriesList,
    ai_image_url,
    season,
    formality,
    confidence: 0.85, // Mock confidence score
    timestamp: new Date().toISOString()
  }
}

/**
 * Build a human-readable description from analyzed items
 */
function buildDescription({ top, topLayer, bottom, shoes, accessories }) {
  const parts = []
  
  if (top) parts.push(top)
  if (topLayer) parts.push(`with ${topLayer}`)
  if (bottom) parts.push(bottom)
  if (shoes) parts.push(shoes)
  if (accessories && accessories.length > 0) {
    parts.push(`accessorized with ${accessories.join(', ')}`)
  }
  
  return parts.join(', ')
}

/**
 * Simulate API call delay for realistic mock behavior
 * @param {number} ms - Delay in milliseconds
 */
export function simulateDelay(ms = 1500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
