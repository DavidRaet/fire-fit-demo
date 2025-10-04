// src/components/FitDisplay.jsx
// Component to display AI-analyzed outfit results

import { useState } from 'react'
import '../styles/FitDisplay.css'

/**
 * FitDisplay - Shows analyzed outfit with AI-generated insights
 * @param {Object} props
 * @param {Object} props.analysis - AI analysis result
 * @param {Object} props.uploadedImages - Object containing uploaded image URLs
 * @param {Function} props.onSave - Callback when user saves the outfit
 * @param {Function} props.onReroll - Callback when user wants to reanalyze
 * @param {boolean} props.saving - Whether save operation is in progress
 */
export default function FitDisplay({ 
  analysis, 
  uploadedImages, 
  onSave, 
  onReroll,
  saving = false 
}) {
  const [showDetails, setShowDetails] = useState(false)

  if (!analysis) return null

  return (
    <div className="fit-display">
      <div className="fit-display-header">
        <h2>🔥 Your Fit Analysis</h2>
        <div className="confidence-badge">
          {analysis.confidence ? `${Math.round(analysis.confidence * 100)}% Match` : 'AI Generated'}
        </div>
      </div>

      <div className="fit-display-content">
        {/* Main Generated Image */}
        {analysis.ai_image_url && (
          <div className="generated-outfit-preview">
            <img 
              src={analysis.ai_image_url} 
              alt="AI Generated Outfit" 
              className="generated-image"
              onError={(e) => {
                console.warn('Failed to load AI image, hiding preview')
                e.target.parentElement.style.display = 'none'
              }}
            />
            <div className="image-overlay">
              <span>AI Generated Preview</span>
            </div>
          </div>
        )}

        {/* Uploaded Images Grid */}
        <div className="uploaded-images-grid">
          {uploadedImages.top && (
            <div className="image-card">
              <img src={uploadedImages.top} alt="Top" />
              <div className="image-label">
                <span className="label-icon">👕</span>
                <span>{analysis.top || 'Top'}</span>
              </div>
            </div>
          )}

          {uploadedImages.topLayer && (
            <div className="image-card">
              <img src={uploadedImages.topLayer} alt="Top Layer" />
              <div className="image-label">
                <span className="label-icon">🧥</span>
                <span>{analysis.topLayer || 'Top Layer'}</span>
              </div>
            </div>
          )}

          {uploadedImages.bottom && (
            <div className="image-card">
              <img src={uploadedImages.bottom} alt="Bottom" />
              <div className="image-label">
                <span className="label-icon">👖</span>
                <span>{analysis.bottom || 'Bottom'}</span>
              </div>
            </div>
          )}

          {uploadedImages.shoes && (
            <div className="image-card">
              <img src={uploadedImages.shoes} alt="Shoes" />
              <div className="image-label">
                <span className="label-icon">👟</span>
                <span>{analysis.shoes || 'Shoes'}</span>
              </div>
            </div>
          )}

          {uploadedImages.accessories && (
            <div className="image-card">
              <img src={uploadedImages.accessories} alt="Accessories" />
              <div className="image-label">
                <span className="label-icon">✨</span>
                <span>{analysis.accessories?.[0] || 'Accessories'}</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Description */}
        <div className="ai-description">
          <h3>🤖 AI Analysis</h3>
          <p className="description-text">{analysis.ai_description}</p>
          
          {analysis.accessories_description && (
            <p className="accessories-note">
              <span className="note-icon">✨</span>
              {analysis.accessories_description}
            </p>
          )}
        </div>

        {/* Aesthetic Tags */}
        {analysis.aesthetic && analysis.aesthetic.length > 0 && (
          <div className="aesthetic-tags">
            <h4>🎨 Style Aesthetic</h4>
            <div className="tags-container">
              {analysis.aesthetic.map((tag, index) => (
                <span key={index} className="aesthetic-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Color Palette */}
        {analysis.colors && Object.keys(analysis.colors).length > 0 && (
          <div className="color-palette">
            <h4>🎨 Color Palette</h4>
            <div className="color-chips">
              {Object.entries(analysis.colors).map(([item, color]) => 
                color ? (
                  <div key={item} className="color-chip">
                    <div className="color-swatch" style={{ background: getColorValue(color) }}></div>
                    <span className="color-label">{item}: {color}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Context Info */}
        <div className="context-info">
          <div className="context-badge">
            <span className="badge-icon">🌦️</span>
            <span>{analysis.season || 'All Season'}</span>
          </div>
          <div className="context-badge">
            <span className="badge-icon">👔</span>
            <span>{analysis.formality || 'Casual'}</span>
          </div>
        </div>

        {/* Toggle Details */}
        <button 
          className="toggle-details-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▲ Hide Details' : '▼ Show More Details'}
        </button>

        {showDetails && (
          <div className="extended-details">
            {analysis.accessories_tags && analysis.accessories_tags.length > 0 && (
              <div className="detail-section">
                <h5>Accessories Breakdown</h5>
                <ul>
                  {analysis.accessories_tags.map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysis.timestamp && (
              <div className="detail-section">
                <h5>Analysis Date</h5>
                <p>{new Date(analysis.timestamp).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fit-display-actions">
        <button 
          className="reroll-btn"
          onClick={onReroll}
          disabled={saving}
        >
          🔄 Reroll Fit
        </button>
        
        <button 
          className="save-btn"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? '💾 Saving...' : '💾 Save to Favorites'}
        </button>
      </div>
    </div>
  )
}

/**
 * Get CSS color value from color name
 * Simple mapping for demo - would use more sophisticated color library in production
 */
function getColorValue(colorName) {
  const colorMap = {
    // Basic colors
    'white': '#FFFFFF',
    'black': '#000000',
    'gray': '#808080',
    'grey': '#808080',
    'navy': '#000080',
    'blue': '#0000FF',
    'red': '#FF0000',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#8B4513',
    
    // Extended colors
    'beige': '#F5F5DC',
    'cream': '#FFFDD0',
    'rust': '#B7410E',
    'olive': '#808000',
    'burgundy': '#800020',
    'mustard': '#FFDB58',
    'turquoise': '#40E0D0',
    'coral': '#FF7F50',
    'lavender': '#E6E6FA',
    'mint green': '#98FF98',
    'pastel pink': '#FFD1DC',
    'forest green': '#228B22',
    'light wash': '#A4C2D8',
    'neutral': '#D3D3D3',
    'mixed metals': 'linear-gradient(135deg, #D4AF37 0%, #C0C0C0 50%, #B87333 100%)'
  }
  
  const lowerName = colorName.toLowerCase()
  return colorMap[lowerName] || '#CCCCCC'
}
