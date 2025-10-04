// src/components/FavoritesPage.jsx
// Page to display all saved outfits

import { useState, useEffect } from 'react'
import { useDemoSession } from '../hooks/useDemoSession'
import { getSavedFits, deleteOutfit } from '../services/outfitAPI'
import '../styles/FavoritesPage.css'

export default function FavoritesPage() {
  const { sessionId } = useDemoSession()
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOutfit, setSelectedOutfit] = useState(null)

  useEffect(() => {
    if (sessionId) {
      loadOutfits()
    }
  }, [sessionId])

  /**
   * Load saved outfits from Supabase
   */
  const loadOutfits = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📂 Loading saved outfits...')
      
      const savedOutfits = await getSavedFits(sessionId)
      setOutfits(savedOutfits)
      
      console.log(`✅ Loaded ${savedOutfits.length} outfits`)
    } catch (err) {
      console.error('❌ Error loading outfits:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle outfit deletion
   */
  const handleDelete = async (outfitId) => {
    if (!confirm('Are you sure you want to delete this outfit?')) {
      return
    }
    
    try {
      console.log('🗑️ Deleting outfit:', outfitId)
      const success = await deleteOutfit(outfitId)
      
      if (success) {
        setOutfits(prev => prev.filter(outfit => outfit.id !== outfitId))
        if (selectedOutfit?.id === outfitId) {
          setSelectedOutfit(null)
        }
        console.log('✅ Outfit deleted')
      }
    } catch (err) {
      console.error('❌ Error deleting outfit:', err)
      setError(err.message)
    }
  }

  /**
   * Open outfit details modal
   */
  const handleViewDetails = (outfit) => {
    setSelectedOutfit(outfit)
  }

  /**
   * Close details modal
   */
  const handleCloseDetails = () => {
    setSelectedOutfit(null)
  }

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your saved fits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="favorites-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={loadOutfits}>Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1>💾 My Favorite Fits</h1>
        <p className="subtitle">
          {outfits.length === 0 
            ? 'No saved outfits yet. Start by uploading and analyzing an outfit!' 
            : `You have ${outfits.length} saved ${outfits.length === 1 ? 'outfit' : 'outfits'}`}
        </p>
      </div>

      {outfits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👗</div>
          <h2>No Favorites Yet</h2>
          <p>Upload and analyze your first outfit to get started!</p>
        </div>
      ) : (
        <div className="outfits-grid">
          {outfits.map(outfit => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedOutfit && (
        <OutfitDetailsModal
          outfit={selectedOutfit}
          onClose={handleCloseDetails}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

/**
 * OutfitCard Component - Card display for each saved outfit
 */
function OutfitCard({ outfit, onViewDetails, onDelete }) {
  const imageUrls = [
    outfit.top_url,
    outfit.top_layer_url,
    outfit.bottom_url,
    outfit.shoes_url,
    outfit.accessories_url
  ].filter(Boolean)

  const mainImage = outfit.ai_image_url || imageUrls[0]

  return (
    <div className="outfit-card">
      {/* Main Image */}
      <div className="card-image" onClick={() => onViewDetails(outfit)}>
        {mainImage ? (
          <img src={mainImage} alt="Outfit" />
        ) : (
          <div className="no-image">No Image</div>
        )}
        <div className="card-overlay">
          <button className="view-btn">View Details</button>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <div className="card-description">
          {outfit.ai_description || 'No description'}
        </div>

        {/* Aesthetic Tags */}
        {outfit.aesthetic && outfit.aesthetic.length > 0 && (
          <div className="card-tags">
            {outfit.aesthetic.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Context Badges */}
        <div className="card-context">
          <span className="context-badge">
            🌦️ {outfit.season || 'All Season'}
          </span>
          <span className="context-badge">
            👔 {outfit.formality || 'Casual'}
          </span>
        </div>

        {/* Thumbnails */}
        <div className="card-thumbnails">
          {imageUrls.slice(0, 5).map((url, index) => (
            <div key={index} className="thumbnail">
              <img src={url} alt={`Item ${index + 1}`} />
            </div>
          ))}
        </div>

        {/* Date */}
        <div className="card-date">
          {outfit.created_at && new Date(outfit.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button 
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(outfit.id)
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

/**
 * OutfitDetailsModal Component - Full details modal
 */
function OutfitDetailsModal({ outfit, onClose, onDelete }) {
  const imageUrls = [
    { url: outfit.top_url, label: '👕 Top' },
    { url: outfit.top_layer_url, label: '🧥 Top Layer' },
    { url: outfit.bottom_url, label: '👖 Bottom' },
    { url: outfit.shoes_url, label: '👟 Shoes' },
    { url: outfit.accessories_url, label: '✨ Accessories' }
  ].filter(item => item.url)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>Outfit Details</h2>
          <div className="modal-date">
            {outfit.created_at && new Date(outfit.created_at).toLocaleString()}
          </div>
        </div>

        <div className="modal-body">
          {/* Generated Image */}
          {outfit.ai_image_url && (
            <div className="modal-generated-image">
              <img src={outfit.ai_image_url} alt="Generated Outfit" />
              <span className="image-badge">AI Generated</span>
            </div>
          )}

          {/* Description */}
          <div className="modal-section">
            <h3>🤖 AI Analysis</h3>
            <p>{outfit.ai_description}</p>
            {outfit.accessories_description && (
              <p className="accessories-note">
                <span className="note-icon">✨</span>
                {outfit.accessories_description}
              </p>
            )}
          </div>

          {/* Image Gallery */}
          <div className="modal-section">
            <h3>📸 Outfit Pieces</h3>
            <div className="modal-gallery">
              {imageUrls.map((item, index) => (
                <div key={index} className="gallery-item">
                  <img src={item.url} alt={item.label} />
                  <span className="gallery-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aesthetic Tags */}
          {outfit.aesthetic && outfit.aesthetic.length > 0 && (
            <div className="modal-section">
              <h3>🎨 Aesthetic</h3>
              <div className="modal-tags">
                {outfit.aesthetic.map((tag, index) => (
                  <span key={index} className="modal-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {outfit.colors && Object.keys(outfit.colors).length > 0 && (
            <div className="modal-section">
              <h3>🎨 Color Palette</h3>
              <div className="color-list">
                {Object.entries(outfit.colors).map(([item, color]) => 
                  color ? (
                    <div key={item} className="color-item">
                      <span className="color-label">{item}:</span>
                      <span className="color-value">{color}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Context */}
          <div className="modal-section">
            <h3>📋 Context</h3>
            <div className="context-row">
              <div className="context-item">
                <span className="context-icon">🌦️</span>
                <span>{outfit.season || 'All Season'}</span>
              </div>
              <div className="context-item">
                <span className="context-icon">👔</span>
                <span>{outfit.formality || 'Casual'}</span>
              </div>
            </div>
          </div>

          {/* Accessories Tags */}
          {outfit.accessories_tags && outfit.accessories_tags.length > 0 && (
            <div className="modal-section">
              <h3>✨ Accessories</h3>
              <ul className="accessories-list">
                {outfit.accessories_tags.map((tag, index) => (
                  <li key={index}>{tag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="modal-delete-btn"
            onClick={() => {
              onDelete(outfit.id)
              onClose()
            }}
          >
            🗑️ Delete Outfit
          </button>
          <button className="modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
