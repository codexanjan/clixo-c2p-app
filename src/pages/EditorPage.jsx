import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Lock, Unlock, Share2, Moon, Sun, ArrowLeft, Download,
  Eye, Edit3, Timer, Check, Wifi, WifiOff, Copy, Columns,
  Type, Hash, Bold, Italic, List, Code, Quote, Minus
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useNote } from '../hooks/useNotes'
import { SetPasswordModal, UnlockModal } from '../components/PasswordModal'
import ShareModal from '../components/ShareModal'
import ExpirationModal from '../components/ExpirationModal'
import MarkdownPreview from '../components/MarkdownPreview'

function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return String(hash)
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 5000) return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

const TOOLBAR_ACTIONS = [
  { icon: Bold,   label: 'Bold',        wrap: ['**', '**'],  line: false },
  { icon: Italic, label: 'Italic',      wrap: ['_', '_'],    line: false },
  { icon: Code,   label: 'Code',        wrap: ['`', '`'],    line: false },
  { icon: Hash,   label: 'Heading',     prefix: '## ',       line: true  },
  { icon: List,   label: 'List item',   prefix: '- ',        line: true  },
  { icon: Quote,  label: 'Blockquote',  prefix: '> ',        line: true  },
  { icon: Minus,  label: 'Divider',     insert: '\n---\n',   line: false },
]

export default function EditorPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isReadOnly = searchParams.get('readonly') === '1'
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  const [now] = useState(() => Date.now())

  const {
    content, updateContent,
    passwordHash, setPassword, clearPassword,
    isLocked, setIsLocked,
    lastSaved, saving,
    expiresAt, setExpiration,
  } = useNote(slug)

  const [unlocked, setUnlocked] = useState(false)
  const [view, setView] = useState('edit') // 'edit' | 'preview' | 'split'
  const [showPassModal, setShowPassModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExpModal, setShowExpModal] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const textareaRef = useRef(null)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Auto-focus editor on load
  useEffect(() => {
    if (textareaRef.current && !isLocked) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
    
    // Check for shared data in URL
    const hash = window.location.hash
    if (hash.startsWith('#data=') && !isLocked) {
      try {
        const encoded = hash.slice(6)
        const decoded = decodeURIComponent(atob(encoded))
        updateContent(decoded)
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      } catch (e) {
        console.error("Failed to decode shared note", e)
      }
    }
  }, [isLocked, slug, updateContent])

  const handleUnlock = useCallback((pw) => {
    if (simpleHash(pw) === passwordHash) {
      setUnlocked(true)
      setIsLocked(false)
      return true
    }
    return false
  }, [passwordHash, setIsLocked])

  const handleSetPassword = useCallback((hash) => {
    if (hash === null) {
      clearPassword()
    } else {
      setPassword(hash)
    }
    setShowPassModal(false)
  }, [setPassword, clearPassword])

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(content)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const insertMarkdown = useCallback((action) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const val = content

    let newVal, newCursor

    if (action.insert) {
      newVal = val.slice(0, start) + action.insert + val.slice(end)
      newCursor = start + action.insert.length
    } else if (action.wrap) {
      const sel = val.slice(start, end) || 'text'
      const wrapped = action.wrap[0] + sel + action.wrap[1]
      newVal = val.slice(0, start) + wrapped + val.slice(end)
      newCursor = start + action.wrap[0].length + sel.length + action.wrap[1].length
    } else if (action.prefix) {
      const lineStart = val.lastIndexOf('\n', start - 1) + 1
      newVal = val.slice(0, lineStart) + action.prefix + val.slice(lineStart)
      newCursor = start + action.prefix.length
    }

    updateContent(newVal)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(newCursor, newCursor)
    })
  }, [content, updateContent])

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = textareaRef.current
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = content.slice(0, start) + '  ' + content.slice(end)
      updateContent(newVal)
      requestAnimationFrame(() => ta.setSelectionRange(start + 2, start + 2))
    }
  }

  // Show unlock screen
  if (isLocked && !unlocked && !isReadOnly) {
    return <UnlockModal onUnlock={handleUnlock} onClose={() => navigate('/')} noteSlug={slug} />
  }

  const words = wordCount(content)
  const chars = content.length
  const lines = content.split('\n').length

  const isExpired = expiresAt && now > expiresAt

  const bgClass = isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'
  const borderClass = isDark ? 'border-white/8' : 'border-gray-100'
  const mutedText = isDark ? 'text-gray-500' : 'text-gray-400'
  const btnBase = `p-2 rounded-lg transition-all text-sm flex items-center gap-1.5 ${
    isDark ? 'hover:bg-white/8 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
  }`

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${bgClass}`}>

      {/* Top Bar */}
      <header className={`flex items-center gap-2 px-4 py-2.5 border-b ${borderClass} shrink-0`}>
        {/* Left: back + slug */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button onClick={() => navigate('/')} className={btnBase}>
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <img src="/logo.png" className="w-7 h-7 rounded-lg object-cover shrink-0 shadow-sm" alt="Clixo Logo" />
            <span className={`text-sm font-mono font-medium truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              /{slug}
            </span>
          </div>
          {passwordHash && (
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
              isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-600'
            }`}>
              <Lock size={10} /> Protected
            </span>
          )}
          {isReadOnly && (
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
              isDark ? 'bg-green-500/15 text-green-300' : 'bg-green-50 text-green-600'
            }`}>
              <Eye size={10} /> Read-only
            </span>
          )}
          {expiresAt && !isExpired && (
            <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-orange-500/15 text-orange-400 flex items-center gap-1">
              <Timer size={10} /> Expiring
            </span>
          )}
        </div>

        {/* Center: View toggle */}
        <div className={`flex items-center gap-0.5 p-1 rounded-xl border ${
          isDark ? 'bg-white/4 border-white/8' : 'bg-gray-50 border-gray-200'
        }`}>
          {[
            { key: 'edit', icon: Edit3, label: 'Edit' },
            { key: 'split', icon: Columns, label: 'Split' },
            { key: 'preview', icon: Eye, label: 'Preview' },
          // eslint-disable-next-line no-unused-vars
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              title={label}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                view === key
                  ? 'gradient-bg text-white shadow-sm'
                  : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Save status */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${mutedText}`}>
            {saving ? (
              <><div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />Saving…</>
            ) : lastSaved ? (
              <><div className="w-1.5 h-1.5 rounded-full bg-green-400" />{timeAgo(lastSaved)}</>
            ) : (
              <><div className="w-1.5 h-1.5 rounded-full bg-gray-500" />Not saved</>
            )}
          </div>

          {!isReadOnly && (
            <>
              <button onClick={() => setShowPassModal(true)} className={btnBase} title="Password protect">
                {passwordHash ? <Lock size={15} className="text-purple-400" /> : <Unlock size={15} />}
              </button>
              <button onClick={() => setShowExpModal(true)} className={btnBase} title="Set expiration">
                <Timer size={15} className={expiresAt ? 'text-orange-400' : ''} />
              </button>
            </>
          )}

          <button onClick={() => setShowShareModal(true)} className={btnBase} title="Share">
            <Share2 size={15} />
          </button>

          <button onClick={handleCopyAll} className={btnBase} title="Copy all text">
            {showCopied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>

          <button onClick={handleExport} className={btnBase} title="Export as TXT">
            <Download size={15} />
          </button>

          <button onClick={toggle} className={btnBase} title="Toggle theme">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Markdown Toolbar (edit mode only, not read-only) */}
      {!isReadOnly && view !== 'preview' && (
        <div className={`flex items-center gap-0.5 px-4 py-1.5 border-b ${borderClass} shrink-0 overflow-x-auto`}>
          {TOOLBAR_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => insertMarkdown(action)}
                title={action.label}
                className={`p-1.5 rounded-lg transition-all shrink-0 ${
                  isDark
                    ? 'text-gray-500 hover:text-gray-200 hover:bg-white/8'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={14} />
              </button>
            )
          })}
          <div className={`w-px h-4 mx-1 shrink-0 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <span className={`text-xs shrink-0 ${mutedText}`}>Markdown supported</span>
        </div>
      )}

      {/* Expired notice */}
      {isExpired && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-red-400 text-sm text-center">
          This note has expired and will be deleted on next load.
        </div>
      )}

      {/* Editor / Preview area */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Edit pane */}
        {(view === 'edit' || view === 'split') && (
          <div className={`flex-1 flex flex-col min-w-0 ${
            view === 'split' ? `border-r ${borderClass}` : ''
          }`}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => !isReadOnly && updateContent(e.target.value)}
              onKeyDown={handleKeyDown}
              readOnly={isReadOnly}
              spellCheck
              placeholder={isReadOnly ? 'This note is empty.' : 'Start writing…\n\nSupports **Markdown** formatting.'}
              className={`flex-1 w-full resize-none outline-none font-mono text-sm leading-relaxed p-6 editor-scrollbar transition-colors ${
                isDark
                  ? 'bg-gray-950 text-gray-100 placeholder-gray-700 caret-purple-400'
                  : 'bg-white text-gray-800 placeholder-gray-300 caret-purple-500'
              } ${isReadOnly ? 'cursor-default' : ''}`}
            />
          </div>
        )}

        {/* Preview pane */}
        {(view === 'preview' || view === 'split') && (
          <div className={`flex-1 min-w-0 ${
            isDark ? 'bg-gray-950' : 'bg-white'
          }`}>
            {view === 'split' && (
              <div className={`px-6 py-2 border-b text-xs font-semibold uppercase tracking-widest ${borderClass} ${mutedText}`}>
                Preview
              </div>
            )}
            <MarkdownPreview content={content} />
          </div>
        )}
      </main>

      {/* Status bar */}
      <footer className={`flex items-center justify-between px-4 py-1.5 border-t text-xs ${borderClass} ${mutedText} shrink-0`}>
        <div className="flex items-center gap-4">
          <span>{words} words</span>
          <span>{chars} chars</span>
          <span>{lines} lines</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            {online
              ? <Wifi size={11} className="text-green-400" />
              : <WifiOff size={11} className="text-red-400" />
            }
            {online ? 'Online' : 'Offline'}
          </span>
          <span>/{slug}</span>
        </div>
      </footer>

      {/* Modals */}
      {showPassModal && (
        <SetPasswordModal
          onSet={handleSetPassword}
          onClose={() => setShowPassModal(false)}
          currentHash={passwordHash}
        />
      )}
      {showShareModal && (
        <ShareModal slug={slug} content={content} onClose={() => setShowShareModal(false)} />
      )}
      {showExpModal && (
        <ExpirationModal
          expiresAt={expiresAt}
          onSet={(d) => { setExpiration(d); setShowExpModal(false) }}
          onClose={() => setShowExpModal(false)}
        />
      )}
    </div>
  )
}
