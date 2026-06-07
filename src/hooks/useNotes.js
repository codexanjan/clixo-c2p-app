/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'clixo-notes'

function getAllNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAllNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function useNote(slug) {
  const [content, setContent] = useState('')
  const [passwordHash, setPasswordHash] = useState(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [saving, setSaving] = useState(false)
  const [expiresAt, setExpiresAt] = useState(null)
  const saveTimerRef = useRef(null)

  // 1. Initial Load from LocalStorage (Instant UI)
  useEffect(() => {
    if (!slug) return
    const notes = getAllNotes()
    const note = notes[slug]
    if (note) {
      if (note.expiresAt && Date.now() > note.expiresAt) {
        // Note expired, delete it locally
        delete notes[slug]
        saveAllNotes(notes)
        setContent('')
        setPasswordHash(null)
        setIsLocked(false)
        setLastSaved(null)
        setExpiresAt(null)
      } else {
        setContent(note.content || '')
        setPasswordHash(note.passwordHash || null)
        setIsLocked(!!note.passwordHash)
        setLastSaved(note.lastSaved || null)
        setExpiresAt(note.expiresAt || null)
      }
    } else {
      setContent('')
      setPasswordHash(null)
      setIsLocked(false)
      setLastSaved(null)
      setExpiresAt(null)
    }

    // 2. Fetch latest data from Supabase DB to synchronize
    const syncWithDatabase = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching note from Supabase:', error)
          }
          return
        }

        if (data) {
          const dbExpiresAt = data.expires_at ? new Date(data.expires_at).getTime() : null
          if (dbExpiresAt && Date.now() > dbExpiresAt) {
            // Note expired on database, delete it
            await supabase.from('notes').delete().eq('slug', slug)
            const localNotes = getAllNotes()
            delete localNotes[slug]
            saveAllNotes(localNotes)

            setContent('')
            setPasswordHash(null)
            setIsLocked(false)
            setLastSaved(null)
            setExpiresAt(null)
            return
          }

          const dbLastSaved = data.last_saved ? new Date(data.last_saved).getTime() : 0
          const localNotes = getAllNotes()
          const localNote = localNotes[slug]
          const localLastSaved = localNote ? (localNote.lastSaved || 0) : 0

          // Update local state and cache if DB version is newer
          if (dbLastSaved >= localLastSaved) {
            setContent(data.content || '')
            setPasswordHash(data.password_hash || null)
            setIsLocked(!!data.password_hash)
            setLastSaved(dbLastSaved)
            setExpiresAt(dbExpiresAt)

            localNotes[slug] = {
              content: data.content || '',
              passwordHash: data.password_hash || null,
              lastSaved: dbLastSaved,
              expiresAt: dbExpiresAt,
            }
            saveAllNotes(localNotes)
          }
        }
      } catch (err) {
        console.error('Failed to sync with Supabase:', err)
      }
    }

    syncWithDatabase()
  }, [slug])

  // 3. Save (Debounced) - updates localstorage first, then Supabase
  const save = useCallback((newContent, options = {}) => {
    if (!slug) return
    setSaving(true)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      const notes = getAllNotes()
      const localLastSaved = Date.now()
      const existing = notes[slug] || {}
      const updatedNote = {
        ...existing,
        content: newContent,
        lastSaved: localLastSaved,
        ...options,
      }
      notes[slug] = updatedNote
      saveAllNotes(notes)

      try {
        const { error } = await supabase
          .from('notes')
          .upsert({
            slug,
            content: newContent,
            password_hash: updatedNote.passwordHash || null,
            expires_at: updatedNote.expiresAt ? new Date(updatedNote.expiresAt).toISOString() : null,
            last_saved: new Date(localLastSaved).toISOString(),
          })
        if (error) {
          console.error('Error saving to Supabase:', error)
        }
      } catch (err) {
        console.error('Error in save DB request:', err)
      }

      setSaving(false)
      setLastSaved(localLastSaved)
    }, 600)
  }, [slug])

  const updateContent = useCallback((newContent) => {
    setContent(newContent)
    save(newContent)
  }, [save])

  const setPassword = useCallback(async (hash) => {
    setPasswordHash(hash)
    setIsLocked(true)
    const notes = getAllNotes()
    if (notes[slug]) {
      notes[slug].passwordHash = hash
      notes[slug].lastSaved = Date.now()
      saveAllNotes(notes)
    }

    try {
      await supabase
        .from('notes')
        .update({
          password_hash: hash,
          last_saved: new Date().toISOString(),
        })
        .eq('slug', slug)
    } catch (err) {
      console.error('Error setting password on Supabase:', err)
    }
  }, [slug])

  const clearPassword = useCallback(async () => {
    setPasswordHash(null)
    setIsLocked(false)
    const notes = getAllNotes()
    if (notes[slug]) {
      delete notes[slug].passwordHash
      notes[slug].lastSaved = Date.now()
      saveAllNotes(notes)
    }

    try {
      await supabase
        .from('notes')
        .update({
          password_hash: null,
          last_saved: new Date().toISOString(),
        })
        .eq('slug', slug)
    } catch (err) {
      console.error('Error clearing password on Supabase:', err)
    }
  }, [slug])

  const setExpiration = useCallback(async (duration) => {
    const ts = duration ? Date.now() + duration : null
    setExpiresAt(ts)
    const notes = getAllNotes()
    if (notes[slug]) {
      notes[slug].expiresAt = ts
      notes[slug].lastSaved = Date.now()
      saveAllNotes(notes)
    }

    try {
      await supabase
        .from('notes')
        .update({
          expires_at: ts ? new Date(ts).toISOString() : null,
          last_saved: new Date().toISOString(),
        })
        .eq('slug', slug)
    } catch (err) {
      console.error('Error setting expiration on Supabase:', err)
    }
  }, [slug])

  return {
    content,
    updateContent,
    passwordHash,
    setPassword,
    clearPassword,
    isLocked,
    setIsLocked,
    lastSaved,
    saving,
    expiresAt,
    setExpiration,
  }
}

export function getAllNotesList() {
  const notes = getAllNotes()
  return Object.entries(notes).map(([slug, data]) => ({
    slug,
    preview: (data.content || '').slice(0, 80),
    lastSaved: data.lastSaved,
    hasPassword: !!data.passwordHash,
  })).sort((a, b) => (b.lastSaved || 0) - (a.lastSaved || 0))
}

export async function deleteNote(slug) {
  const notes = getAllNotes()
  if (notes[slug]) {
    delete notes[slug]
    saveAllNotes(notes)
  }

  try {
    await supabase
      .from('notes')
      .delete()
      .eq('slug', slug)
  } catch (err) {
    console.error('Error deleting note from Supabase:', err)
  }
}
