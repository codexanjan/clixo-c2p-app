import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import HomePage from './pages/HomePage'
import EditorPage from './pages/EditorPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/note/:slug" element={<EditorPage />} />
          <Route path="/:slug" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
