import { useState } from 'react'
import { useDemoSession } from './hooks/useDemoSession'
import UploadFitPage from './pages/UploadFitPage'
import FavoritesPage from './components/FavoritesPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('upload')
  const { sessionId, loading } = useDemoSession()

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Initializing Fire Fit Demo...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Demo Banner */}
      <div className="demo-banner">
        <div className="banner-content">
          <span className="banner-icon">🔥</span>
          <span className="banner-text">
            <strong>FIRE FIT</strong> — Demo Mode (No Login Required)
          </span>
          {sessionId && (
            <span className="session-id">Session: {sessionId.slice(0, 15)}...</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <h1 className="app-title">🔥 FIRE FIT</h1>
          <div className="nav-links">
            <button 
              className={`nav-link ${currentPage === 'upload' ? 'active' : ''}`}
              onClick={() => setCurrentPage('upload')}
            >
              📤 Upload Fit
            </button>
            <button 
              className={`nav-link ${currentPage === 'favorites' ? 'active' : ''}`}
              onClick={() => setCurrentPage('favorites')}
            >
              💾 Favorites
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {currentPage === 'upload' && <UploadFitPage />}
          {currentPage === 'favorites' && <FavoritesPage />}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Powered by React + Supabase + Google AI Studio</p>
        <p className="footer-note">
          AI-assisted outfit analyzer and recommender demo
        </p>
      </footer>
    </div>
  )
}

export default App
