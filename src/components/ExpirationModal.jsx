import { useState } from 'react'
import { Timer, X, Trash2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const DURATIONS = [
  { label: '1 min', ms: 60 * 1000 },
  { label: '4 min', ms: 4 * 60 * 1000 },
  { label: '15 min', ms: 15 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '4 hours', ms: 4 * 60 * 60 * 1000 },
]

export default function ExpirationModal({ expiresAt, onSet, onClose }) {
  const { theme } = useTheme()
  const [selected, setSelected] = useState(null)
  const isDark = theme === 'dark'
  const [now] = useState(() => Date.now())

  const remaining = expiresAt ? expiresAt - now : null
  const formatRemaining = (ms) => {
    if (!ms || ms <= 0) return 'Expired'
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

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
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Timer size={18} className="text-orange-400" />
          </div>
          <div>
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Note Expiration</h2>
            {expiresAt && remaining && remaining > 0 ? (
              <p className="text-xs text-orange-400">Expires in {formatRemaining(remaining)}</p>
            ) : (
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Auto-delete after a set time</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {DURATIONS.map((d) => (
            <button
              key={d.ms}
              onClick={() => setSelected(d.ms)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                selected === d.ms
                  ? 'gradient-bg text-white'
                  : isDark
                    ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => selected && onSet(selected)}
          disabled={!selected}
          className="w-full gradient-bg text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 mb-2"
        >
          Set Expiration
        </button>

        {expiresAt && (
          <button
            onClick={() => onSet(null)}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-red-50 text-red-500 hover:bg-red-100'
            }`}
          >
            <Trash2 size={14} /> Remove Expiration
          </button>
        )}
      </div>
    </div>
  )
}
