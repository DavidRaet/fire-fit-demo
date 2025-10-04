// src/hooks/useDemoSession.js
// Hook to manage demo session ID and preferences

import { useState, useEffect } from 'react'
import { supabase } from '../lib/client'
import { getCurrentSeason } from '../utils/seasonPresets'

const SESSION_STORAGE_KEY = 'fire_fit_demo_session'

/**
 * Custom hook to manage demo session
 * Creates and persists a session ID in localStorage
 * Optionally syncs with Supabase demo_sessions table
 */
export function useDemoSession() {
  const [sessionId, setSessionId] = useState(null)
  const [preferences, setPreferences] = useState({
    season: getCurrentSeason(),
    formality: 'casual'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initializeSession()
  }, [])

  /**
   * Initialize or retrieve existing session
   */
  async function initializeSession() {
    try {
      console.log('🔄 Initializing demo session...')
      
      // Check localStorage first
      let session = localStorage.getItem(SESSION_STORAGE_KEY)
      
      if (session) {
        const sessionData = JSON.parse(session)
        setSessionId(sessionData.id)
        setPreferences(sessionData.preferences || {
          season: getCurrentSeason(),
          formality: 'casual'
        })
        console.log('✅ Existing session loaded:', sessionData.id)
      } else {
        // Create new session
        const newSessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newPreferences = {
          season: getCurrentSeason(),
          formality: 'casual'
        }
        
        const sessionData = {
          id: newSessionId,
          started_at: new Date().toISOString(),
          preferences: newPreferences
        }
        
        // Save to localStorage
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData))
        setSessionId(newSessionId)
        setPreferences(newPreferences)
        
        console.log('✅ New session created:', newSessionId)
        
        // Try to sync with Supabase (optional - fails gracefully)
        try {
          await syncSessionToSupabase(sessionData)
        } catch (syncError) {
          console.warn('⚠️ Could not sync session to Supabase (continuing with local session):', syncError.message)
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error('❌ Error initializing session:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  /**
   * Sync session to Supabase demo_sessions table
   */
  async function syncSessionToSupabase(sessionData) {
    const { error } = await supabase
      .from('demo_sessions')
      .upsert({
        id: sessionData.id,
        started_at: sessionData.started_at,
        preferences: sessionData.preferences
      })
    
    if (error) throw error
    console.log('✅ Session synced to Supabase')
  }

  /**
   * Update session preferences
   */
  async function updatePreferences(newPreferences) {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences }
      setPreferences(updatedPreferences)
      
      // Update localStorage
      const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY))
      session.preferences = updatedPreferences
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      
      // Try to sync with Supabase
      try {
        await supabase
          .from('demo_sessions')
          .update({ preferences: updatedPreferences })
          .eq('id', sessionId)
      } catch (syncError) {
        console.warn('⚠️ Could not sync preferences to Supabase:', syncError.message)
      }
      
      console.log('✅ Preferences updated:', updatedPreferences)
    } catch (err) {
      console.error('❌ Error updating preferences:', err)
    }
  }

  /**
   * Clear session and start fresh
   */
  function clearSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setSessionId(null)
    setPreferences({
      season: getCurrentSeason(),
      formality: 'casual'
    })
    console.log('🗑️ Session cleared')
    
    // Reinitialize
    initializeSession()
  }

  return {
    sessionId,
    preferences,
    loading,
    error,
    updatePreferences,
    clearSession
  }
}
