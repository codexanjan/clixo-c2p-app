import { useState } from 'react'
import { Lock, Unlock, X, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return String(hash)
}

export function SetPasswordModal({ onSet, onClose, currentHash }) {
  const { theme } = useTheme()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pw.length < 3) { setError('Password must be at least 3 characters'); return }
    if (pw !== confirm) { setError('Passwords do not match'); return }
    onSet(simpleHash(pw))
  }

  const isDark = theme === 'dark'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${
        isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'
      }`}>
        <button onClick={onClose} className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
          isDark ? 'text-gray-400 hover:bg-white/10' : 'text-gray-400 hover:bg-gray-100'
        }`}><X size={16} /></button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <Lock size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentHash ? 'Change Password' : 'Protect This Note'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Set a password to secure your note
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              placeholder="Enter password"
              className={`w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none border transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-purple-500/50'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-400'
              }`}
              autoFocus
            />
            <button type="button" onClick={() => setShow(s => !s)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <input
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError('') }}
            placeholder="Confirm password"
            className={`w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-purple-500/50'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-400'
            }`}
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit"
            className="w-full gradient-bg text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
            {currentHash ? 'Update Password' : 'Set Password'}
          </button>
          {currentHash && (
            <button type="button" onClick={() => onSet(null)}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'bg-red-50 text-red-500 hover:bg-red-100'
              }`}>
              <Unlock size={14} /> Remove Password
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

export function UnlockModal({ onUnlock, noteSlug }) {
  const { theme } = useTheme()
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const isDark = theme === 'dark'

  const handleSubmit = (e) => {
    e.preventDefault()
    const correct = onUnlock(pw)
    if (!correct) setError('Incorrect password. Try again.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 ${isDark ? 'bg-gray-950' : 'bg-white'}`} />
      <div className={`relative w-full max-w-sm rounded-2xl p-8 shadow-2xl border text-center ${
        isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'
      }`}>
        <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-5">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <h2 className={`font-bold text-xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Note Protected
        </h2>
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          /{noteSlug}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              placeholder="Enter password to unlock"
              className={`w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none border transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-purple-500/50'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-400'
              }`}
              autoFocus
            />
            <button type="button" onClick={() => setShow(s => !s)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit"
            className="w-full gradient-bg text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
            Unlock Note
          </button>
        </form>
      </div>
    </div>
  )
}
