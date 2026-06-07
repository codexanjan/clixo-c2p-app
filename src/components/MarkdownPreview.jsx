import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTheme } from '../context/ThemeContext'

export default function MarkdownPreview({ content }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`prose-clixo h-full overflow-y-auto editor-scrollbar px-6 py-4 text-sm leading-relaxed ${
      isDark ? 'text-gray-200' : 'text-gray-800'
    }`}>
      {content.trim() ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      ) : (
        <div className={`flex items-center justify-center h-full ${
          isDark ? 'text-gray-700' : 'text-gray-300'
        }`}>
          <p className="text-center">
            Start writing to see a preview...
          </p>
        </div>
      )}
    </div>
  )
}
