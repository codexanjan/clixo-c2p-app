import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, Moon, Sun, Sparkles, Trash2 } from 'lucide-react'

import { useTheme } from '../context/ThemeContext'
import { getAllNotesList, deleteNote } from '../hooks/useNotes'


function generateSlug(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || `note-${Date.now()}`
}

export default function HomePage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [noteName, setNoteName] = useState('')
  const [recentNotes, setRecentNotes] = useState(() => getAllNotesList().slice(0, 5))
  const [cursorVisible, setCursorVisible] = useState(true)
  const inputRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(interval)
  }, [])

  const handleDelete = (e, slug) => {
    e.stopPropagation()
    deleteNote(slug)
    setRecentNotes(getAllNotesList().slice(0, 5))
  }

  const handleStart = (e) => {
    e.preventDefault()
    const slug = noteName.trim() ? generateSlug(noteName) : `note-${Date.now()}`
    navigate(`/${slug}`)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gray-950 text-white'
        : 'bg-white text-gray-900'
    }`}>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          theme === 'dark' ? 'bg-purple-600' : 'bg-purple-300'
        }`} />
        <div className={`absolute top-1/3 -left-40 w-80 h-80 rounded-full blur-3xl opacity-15 ${
          theme === 'dark' ? 'bg-cyan-600' : 'bg-cyan-300'
        }`} />
        <div className={`absolute bottom-20 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-10 ${
          theme === 'dark' ? 'bg-pink-600' : 'bg-pink-300'
        }`} />
      </div>

      {/* Navbar */}
      <nav className={`relative z-10 flex items-center justify-between px-6 py-4 border-b ${
        theme === 'dark' ? 'border-white/5' : 'border-gray-100'
      }`}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-10 h-10 rounded-xl shadow-lg object-cover" alt="Clixo Logo" />
          <div className="flex items-center">
            <span className={`font-bold text-xl tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Clixo - The future of text sharing</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className={`p-2 rounded-xl transition-all ${
              theme === 'dark'
                ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => navigate(`/quick-${Date.now()}`)}
            className="gradient-bg text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            New Note
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-thin leading-tight tracking-tight mb-8">
          Copy made{' '}
          <span className="gradient-text font-normal">simple.</span>
          <span className={`inline-block w-1.5 h-12 md:h-16 lg:h-20 ml-2 -mb-2 rounded-sm gradient-bg ${
            cursorVisible ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-100`} />
        </h1>

        {/* Input form */}
        <form onSubmit={handleStart} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
          <input
            ref={inputRef}
            type="text"
            value={noteName}
            onChange={e => setNoteName(e.target.value)}
            placeholder="Enter your note name..."
            className={`flex-1 px-5 py-4 rounded-2xl text-base font-medium outline-none transition-all border-2 ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/8'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:bg-white'
            }`}
          />
          <button
            type="submit"
            className="gradient-bg text-white px-7 py-4 rounded-2xl font-semibold text-base hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Start Writing <ArrowRight size={18} />
          </button>
        </form>

        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          Or{' '}
          <button
            onClick={() => navigate(`/quick-${Date.now()}`)}
            className={`underline underline-offset-2 font-medium transition-colors ${
              theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            jump in without a name
          </button>
        </p>
      </section>

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
          <h3 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>Recent Notes</h3>
          <div className="flex flex-wrap gap-2">
            {recentNotes.map(note => (
              <div key={note.slug} className="group relative flex">
                <button
                  onClick={() => navigate(`/${note.slug}`)}
                  className={`flex items-center gap-2 pl-4 pr-10 py-2 rounded-xl text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {note.hasPassword && <Lock size={12} className="text-purple-400" />}
                  /{note.slug}
                </button>
                <button
                  onClick={(e) => handleDelete(e, note.slug)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                    theme === 'dark' ? 'hover:bg-red-500/20 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                  }`}
                  title="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Advanced features banner */}
      <section className={`relative z-10 py-12 overflow-hidden ${
        theme === 'dark' ? 'bg-white/2' : 'bg-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className={`text-center text-3xl font-black mb-10 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Advanced features built in
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: '🌙', title: 'Dark / Light themes', desc: 'Your preferred mode, always', glow: 'from-blue-500 to-cyan-400' },
              { emoji: '✍️', title: 'Markdown support', desc: 'Format with full MD syntax', glow: 'from-purple-500 to-pink-500' },
              { emoji: '📥', title: 'Export notes', desc: 'Download as TXT or copy all', glow: 'from-green-400 to-emerald-500' },
              { emoji: '⏱️', title: 'Note expiration', desc: 'Self-delete after a set time', glow: 'from-orange-400 to-red-500' },
            ].map((item, i) => (
              <div key={i} className="group relative">
                {/* Animated glow */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.glow} rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500 animate-pulse`}></div>
                
                {/* Card frontend */}
                <div className={`relative h-full p-5 rounded-2xl text-center border ${
                  theme === 'dark'
                    ? 'bg-gray-950 border-white/10'
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
                  <div className={`font-semibold text-sm mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{item.title}</div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 py-8 px-6 text-center`}>
        <p className={`text-sm flex items-center justify-center gap-1.5 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`}>
          Made with{' '}
          <span className="text-red-500 hover:scale-125 transition-transform duration-300">❤️</span>
          {' '}by{' '}
          <span className={`font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Anjan Shetty
          </span>
        </p>
      </footer>
    </div>
  )
}
