// src/pages/UploadFitPage.jsx
// Main page for uploading outfit images and analyzing fits

import { useState, useRef } from 'react'
import { useDemoSession } from '../hooks/useDemoSession'
import { uploadFile, analyzeFit, saveFit } from '../services/outfitAPI'
import FitDisplay from '../components/FitDisplay'
import { SEASON_PRESETS, FORMALITY_LEVELS } from '../utils/seasonPresets'
import '../styles/UploadFitPage.css'

export default function UploadFitPage() {
  const { sessionId, preferences, updatePreferences } = useDemoSession()
  
  // Upload state
  const [uploads, setUploads] = useState({
    top: null,
    topLayer: null,
    bottom: null,
    shoes: null,
    accessories: null
  })
  
  const [previewUrls, setPreviewUrls] = useState({
    top: null,
    topLayer: null,
    bottom: null,
    shoes: null,
    accessories: null
  })
  
  const [uploadedUrls, setUploadedUrls] = useState({
    top: null,
    topLayer: null,
    bottom: null,
    shoes: null,
    accessories: null
  })
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [savedSuccess, setSavedSuccess] = useState(false)
  
  // Context state
  const [season, setSeason] = useState(preferences.season || 'Fall')
  const [formality, setFormality] = useState(preferences.formality || 'casual')
  
  // File input refs
  const fileInputRefs = {
    top: useRef(null),
    topLayer: useRef(null),
    bottom: useRef(null),
    shoes: useRef(null),
    accessories: useRef(null)
  }

  /**
   * Handle file selection and preview
   */
  const handleFileSelect = (category, event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(`${category} must be an image file`)
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`${category} image must be less than 5MB`)
      return
    }
    
    // Update uploads
    setUploads(prev => ({ ...prev, [category]: file }))
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setPreviewUrls(prev => ({ ...prev, [category]: previewUrl }))
    
    setError(null)
    console.log(`📸 ${category} selected:`, file.name)
  }

  /**
   * Remove uploaded image
   */
  const handleRemoveImage = (category) => {
    // Revoke preview URL to free memory
    if (previewUrls[category]) {
      URL.revokeObjectURL(previewUrls[category])
    }
    
    setUploads(prev => ({ ...prev, [category]: null }))
    setPreviewUrls(prev => ({ ...prev, [category]: null }))
    setUploadedUrls(prev => ({ ...prev, [category]: null }))
    
    // Reset file input
    if (fileInputRefs[category].current) {
      fileInputRefs[category].current.value = ''
    }
    
    console.log(`🗑️ ${category} removed`)
  }

  /**
   * Handle analyze button click
   */
  const handleAnalyze = async () => {
    try {
      // Validate at least one image is uploaded
      const hasAnyImage = Object.values(uploads).some(file => file !== null)
      if (!hasAnyImage) {
        setError('Please upload at least one image to analyze')
        return
      }
      
      setAnalyzing(true)
      setError(null)
      setAnalysis(null)
      setSavedSuccess(false)
      
      console.log('🚀 Starting analysis flow...')
      
      // Step 1: Upload all images to Supabase Storage
      console.log('📤 Uploading images...')
      const urls = {}
      
      for (const [category, file] of Object.entries(uploads)) {
        if (file) {
          try {
            const url = await uploadFile(file, category, sessionId)
            urls[category] = url
          } catch (uploadError) {
            console.error(`Failed to upload ${category}:`, uploadError)
            // Continue with other uploads
          }
        }
      }
      
      setUploadedUrls(urls)
      console.log('✅ All images uploaded')
      
      // Step 2: Call analyze API
      console.log('🤖 Analyzing outfit...')
      const analysisPayload = {
        session_id: sessionId,
        top_url: urls.top || null,
        top_layer_url: urls.topLayer || null,
        bottom_url: urls.bottom || null,
        shoes_url: urls.shoes || null,
        accessories_url: urls.accessories || null,
        season,
        formality
      }
      
      const result = await analyzeFit(analysisPayload)
      setAnalysis(result)
      
      console.log('✅ Analysis complete:', result)
      
      // Update preferences
      await updatePreferences({ season, formality })
      
    } catch (err) {
      console.error('❌ Analysis failed:', err)
      setError(err.message || 'Failed to analyze outfit. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  /**
   * Handle save outfit
   */
  const handleSave = async () => {
    if (!analysis) return
    
    try {
      setSaving(true)
      setError(null)
      
      const savePayload = {
        session_id: sessionId,
        top_url: uploadedUrls.top,
        top_layer_url: uploadedUrls.topLayer,
        bottom_url: uploadedUrls.bottom,
        shoes_url: uploadedUrls.shoes,
        accessories_url: uploadedUrls.accessories,
        ai_description: analysis.ai_description,
        ai_image_url: analysis.ai_image_url,
        season: analysis.season,
        formality: analysis.formality,
        aesthetic: analysis.aesthetic,
        colors: analysis.colors,
        accessories_description: analysis.accessories_description,
        accessories_tags: analysis.accessories_tags
      }
      
      const saved = await saveFit(savePayload)
      console.log('✅ Outfit saved:', saved)
      
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
      
    } catch (err) {
      console.error('❌ Save failed:', err)
      setError(err.message || 'Failed to save outfit')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Handle reroll (reanalyze with same images)
   */
  const handleReroll = async () => {
    console.log('🔄 Rerolling analysis...')
    await handleAnalyze()
  }

  /**
   * Clear all uploads and start fresh
   */
  const handleClear = () => {
    // Revoke all preview URLs
    Object.values(previewUrls).forEach(url => {
      if (url) URL.revokeObjectURL(url)
    })
    
    setUploads({
      top: null,
      topLayer: null,
      bottom: null,
      shoes: null,
      accessories: null
    })
    setPreviewUrls({
      top: null,
      topLayer: null,
      bottom: null,
      shoes: null,
      accessories: null
    })
    setUploadedUrls({
      top: null,
      topLayer: null,
      bottom: null,
      shoes: null,
      accessories: null
    })
    setAnalysis(null)
    setError(null)
    setSavedSuccess(false)
    
    // Reset all file inputs
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) ref.current.value = ''
    })
    
    console.log('🧹 All uploads cleared')
  }

  return (
    <div className="upload-fit-page">
      <div className="page-header">
        <h1>🔥 Upload Your Fit</h1>
        <p className="subtitle">Upload images of your outfit pieces and let AI analyze your style</p>
      </div>

      {/* Context Selection */}
      <div className="context-section">
        <div className="context-group">
          <label htmlFor="season-select">🌦️ Season</label>
          <select 
            id="season-select"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            disabled={analyzing}
          >
            {Object.keys(SEASON_PRESETS).map(seasonName => (
              <option key={seasonName} value={seasonName}>
                {seasonName}
              </option>
            ))}
          </select>
        </div>

        <div className="context-group">
          <label htmlFor="formality-select">👔 Formality</label>
          <select 
            id="formality-select"
            value={formality}
            onChange={(e) => setFormality(e.target.value)}
            disabled={analyzing}
          >
            {Object.entries(FORMALITY_LEVELS).map(([key, data]) => (
              <option key={key} value={key}>
                {data.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Grid */}
      <div className="upload-grid">
        {/* Top */}
        <UploadCard
          category="top"
          label="👕 Top"
          description="T-shirt, blouse, sweater"
          file={uploads.top}
          previewUrl={previewUrls.top}
          onSelect={handleFileSelect}
          onRemove={handleRemoveImage}
          inputRef={fileInputRefs.top}
          disabled={analyzing}
        />

        {/* Top Layer */}
        <UploadCard
          category="topLayer"
          label="🧥 Top Layer"
          description="Jacket, coat, cardigan"
          file={uploads.topLayer}
          previewUrl={previewUrls.topLayer}
          onSelect={handleFileSelect}
          onRemove={handleRemoveImage}
          inputRef={fileInputRefs.topLayer}
          disabled={analyzing}
          optional
        />

        {/* Bottom */}
        <UploadCard
          category="bottom"
          label="👖 Bottom"
          description="Pants, skirt, shorts"
          file={uploads.bottom}
          previewUrl={previewUrls.bottom}
          onSelect={handleFileSelect}
          onRemove={handleRemoveImage}
          inputRef={fileInputRefs.bottom}
          disabled={analyzing}
        />

        {/* Shoes */}
        <UploadCard
          category="shoes"
          label="👟 Shoes"
          description="Sneakers, boots, sandals"
          file={uploads.shoes}
          previewUrl={previewUrls.shoes}
          onSelect={handleFileSelect}
          onRemove={handleRemoveImage}
          inputRef={fileInputRefs.shoes}
          disabled={analyzing}
        />

        {/* Accessories */}
        <UploadCard
          category="accessories"
          label="✨ Accessories"
          description="Jewelry, bags, hats, etc."
          file={uploads.accessories}
          previewUrl={previewUrls.accessories}
          onSelect={handleFileSelect}
          onRemove={handleRemoveImage}
          inputRef={fileInputRefs.accessories}
          disabled={analyzing}
          optional
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Success Message */}
      {savedSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          Outfit saved to favorites!
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="clear-btn"
          onClick={handleClear}
          disabled={analyzing || loading}
        >
          🧹 Clear All
        </button>
        
        <button 
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={analyzing || loading || !sessionId}
        >
          {analyzing ? '🔄 Analyzing...' : '🤖 Analyze Fit'}
        </button>
      </div>

      {/* Analysis Result */}
      {analysis && (
        <FitDisplay
          analysis={analysis}
          uploadedImages={uploadedUrls}
          onSave={handleSave}
          onReroll={handleReroll}
          saving={saving}
        />
      )}
    </div>
  )
}

/**
 * UploadCard Component - Reusable upload card for each category
 */
function UploadCard({ 
  category, 
  label, 
  description, 
  file, 
  previewUrl, 
  onSelect, 
  onRemove, 
  inputRef,
  disabled = false,
  optional = false
}) {
  return (
    <div className={`upload-card ${file ? 'has-image' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => onSelect(category, e)}
        disabled={disabled}
        style={{ display: 'none' }}
        id={`upload-${category}`}
      />
      
      {previewUrl ? (
        <div className="preview-container">
          <img src={previewUrl} alt={label} className="preview-image" />
          <div className="preview-overlay">
            <button 
              className="remove-btn"
              onClick={() => onRemove(category)}
              disabled={disabled}
            >
              ✕ Remove
            </button>
          </div>
        </div>
      ) : (
        <label htmlFor={`upload-${category}`} className="upload-placeholder">
          <div className="upload-icon">{label.split(' ')[0]}</div>
          <div className="upload-text">
            <strong>{label}</strong>
            <span className="upload-description">{description}</span>
            {optional && <span className="optional-badge">Optional</span>}
          </div>
          <div className="upload-prompt">Click to upload</div>
        </label>
      )}
    </div>
  )
}
