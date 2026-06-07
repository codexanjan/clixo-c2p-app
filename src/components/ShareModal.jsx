import { useState } from 'react'
import { Share2, Copy, Check, X, Eye, Edit3 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ShareModal({ slug, content, onClose }) {
  const { theme } = useTheme()
  const [copiedEdit, setCopiedEdit] = useState(false)
  const [copiedRead, setCopiedRead] = useState(false)
  const isDark = theme === 'dark'

  const origin = window.location.origin
  const encodedContent = btoa(encodeURIComponent(content || ''))
  const editUrl = `${origin}/${slug}#data=${encodedContent}`
  const readUrl = `${origin}/${slug}?readonly=1#data=${encodedContent}`

  const copyEdit = () => {
    navigator.clipboard.writeText(editUrl)
    setCopiedEdit(true)
    setTimeout(() => setCopiedEdit(false), 2000)
  }

  const copyRead = () => {
    navigator.clipboard.writeText(readUrl)
    setCopiedRead(true)
    setTimeout(() => setCopiedRead(false), 2000)
  }

  const displayHost = 'clixoapp.vercel.app'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden ${
        isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`px-6 pt-6 pb-4 border-b ${isDark ? 'border-white/8' : 'border-gray-100'}`}>
          <button onClick={onClose} className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-gray-400 hover:bg-white/10' : 'text-gray-400 hover:bg-gray-100'
          }`}><X size={16} /></button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
              <Share2 size={17} className="text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Share this note
              </h2>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>
                {displayHost}/<span className="font-semibold">{slug}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="p-6 space-y-3">

          {/* Edit link */}
          <div className={`group rounded-2xl border transition-all ${
            isDark
              ? 'bg-white/3 border-white/8 hover:border-white/15'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}>
            <div className="px-4 pt-3.5 pb-1 flex items-center gap-2">
              <Edit3 size={12} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
              <span className={`text-xs font-semibold uppercase tracking-widest ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>Edit Link</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                isDark ? 'bg-white/6 text-gray-400' : 'bg-gray-200 text-gray-500'
              }`}>Can edit</span>
            </div>
            <div className="px-4 pb-3.5 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-1 font-mono text-sm font-medium truncate ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>{displayHost}/</span>
                  <span className="gradient-text font-bold">{slug}</span>
                </div>
              </div>
              <button
                onClick={copyEdit}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  copiedEdit
                    ? 'bg-green-500/15 text-green-400'
                    : isDark
                      ? 'bg-white/8 hover:bg-white/14 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {copiedEdit ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Read-only link */}
          <div className={`group rounded-2xl border transition-all ${
            isDark
              ? 'bg-purple-500/5 border-purple-500/20 hover:border-purple-400/30'
              : 'bg-purple-50/70 border-purple-200 hover:border-purple-300'
          }`}>
            <div className="px-4 pt-3.5 pb-1 flex items-center gap-2">
              <Eye size={12} className="text-purple-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                Read-Only Link
              </span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500/15 text-purple-400">
                View only
              </span>
            </div>
            <div className="px-4 pb-3.5 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-1 font-mono text-sm font-medium truncate ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className={isDark ? 'text-gray-600' : 'text-purple-300'}>{displayHost}/</span>
                  <span className="gradient-text font-bold">{slug}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-purple-400'}`}>&nbsp;👁</span>
                </div>
              </div>
              <button
                onClick={copyRead}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  copiedRead
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-400'
                }`}
              >
                {copiedRead ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className={`px-6 pb-5 text-center`}>
          <p className={`text-xs ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
            Read-only links let others view but never edit your note.
          </p>
        </div>
      </div>
    </div>
  )
}
