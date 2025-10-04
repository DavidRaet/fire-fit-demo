// src/utils/seasonPresets.js
// Mock seasonal presets for consistent demo output

export const SEASON_PRESETS = {
  Spring: {
    season: 'Spring',
    recommendedColors: ['pastel pink', 'mint green', 'lavender', 'cream'],
    suggestedFormality: 'casual',
    recommendedAccessories: ['sunglasses', 'light scarf', 'bracelet', 'floral headband'],
    aesthetic: ['floral', 'airy', 'layered', 'fresh'],
    description: 'Light, pastel tones with breathable fabrics'
  },
  Summer: {
    season: 'Summer',
    recommendedColors: ['white', 'bright yellow', 'coral', 'turquoise'],
    suggestedFormality: 'casual',
    recommendedAccessories: ['sunglasses', 'beach hat', 'sandals', 'minimalist jewelry'],
    aesthetic: ['beachy', 'bright', 'minimalist', 'breezy'],
    description: 'Bright, breathable fabrics and lightweight accessories'
  },
  Fall: {
    season: 'Fall',
    recommendedColors: ['rust', 'olive', 'burgundy', 'mustard', 'brown'],
    suggestedFormality: 'casual',
    recommendedAccessories: ['scarf', 'beanie', 'crossbody bag', 'ankle boots'],
    aesthetic: ['earthy', 'layered', 'cozy', 'vintage'],
    description: 'Earthy tones with layered pieces and warm accessories'
  },
  Winter: {
    season: 'Winter',
    recommendedColors: ['gray', 'navy', 'black', 'burgundy', 'forest green'],
    suggestedFormality: 'casual',
    recommendedAccessories: ['scarf', 'gloves', 'beanie', 'winter boots'],
    aesthetic: ['cozy', 'layered', 'thermal', 'minimalist'],
    description: 'Warm, muted colors with thermal layers and protective accessories'
  }
}

export const FORMALITY_LEVELS = {
  casual: {
    label: 'Casual',
    description: 'Jeans, sneakers, t-shirts, hoodies',
    examples: ['streetwear', 'athleisure', 'everyday']
  },
  'semi-formal': {
    label: 'Semi-Formal',
    description: 'Skirts, blouses, dress pants, loafers',
    examples: ['smart casual', 'date night', 'brunch']
  },
  'business-casual': {
    label: 'Business Casual',
    description: 'Slacks, button-ups, blazers, dress shoes',
    examples: ['office wear', 'professional', 'meetings']
  },
  sports: {
    label: 'Sports/Active',
    description: 'Activewear, athletic shoes, performance fabrics',
    examples: ['gym', 'running', 'yoga', 'outdoor activities']
  }
}

/**
 * Get current season based on month
 * @returns {string} Current season name
 */
export function getCurrentSeason() {
  const month = new Date().getMonth() + 1 // 1-12
  
  if (month >= 3 && month <= 5) return 'Spring'
  if (month >= 6 && month <= 8) return 'Summer'
  if (month >= 9 && month <= 11) return 'Fall'
  return 'Winter'
}

/**
 * Get season preset by name
 * @param {string} seasonName - Season name (Spring, Summer, Fall, Winter)
 * @returns {object} Season preset object
 */
export function getSeasonPreset(seasonName) {
  return SEASON_PRESETS[seasonName] || SEASON_PRESETS.Spring
}

/**
 * Get mock preset combining season and formality
 * @param {string} season - Season name
 * @param {string} formality - Formality level
 * @returns {object} Combined preset object
 */
export function getMockPreset(season, formality = 'casual') {
  const seasonData = getSeasonPreset(season)
  const formalityData = FORMALITY_LEVELS[formality] || FORMALITY_LEVELS.casual
  
  return {
    ...seasonData,
    formality: formalityData.label,
    formalityDescription: formalityData.description,
    formalityExamples: formalityData.examples
  }
}
