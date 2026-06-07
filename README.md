# Clixo 📝

A premium, visually stunning, and highly secure text sharing and note editor application. Clixo allows users to create, format, and share notes with real-time database syncing, password protection, and self-destructing expiration timers.

Live URL: [https://clixoapp.vercel.app](https://clixoapp.vercel.app)

---

## ✨ Key Features

- **🌐 Real-Time Database Sync (Supabase):** Integrated with PostgreSQL on Supabase to sync your notes across devices, backed by a fast, local-first `localStorage` cache for offline-first resilience.
- **🎨 Immersive UI/UX:** Styled using Vanilla CSS and TailwindCSS featuring high-end dark/light theme options, dynamic ambient glowing backgrounds, and modern typography (Outfit/Inter).
- **🔒 Password Security:** Lock your notes with cryptographic password hashing to restrict editing and reading to authorized users.
- **⏱️ Note Expiration (Self-Destruct):** Set custom note lifespans (1 min, 4 min, 15 min, 1 hour, 4 hours). Once expired, notes automatically delete from both the remote database and local caches.
- **✍️ Interactive Markdown Toolbar:** Fully featured formatting toolbar supporting bold, italic, code block, headings, lists, blockquotes, and dividers.
- **👁️ Dual-Pane Split Preview:** Edit notes with a side-by-side live markdown preview render pane.
- **💾 Exporting & Copying:** Single-click copy to clipboard and standard `.txt` text file download exporter.

---

## 🛠️ Technology Stack

- **Frontend Core:** React 19, JavaScript (ES6+), Vite
- **Styling:** TailwindCSS v3 (curated gradient palettes, dark mode integration)
- **Routing:** React Router v7
- **Database:** Supabase Client SDK (@supabase/supabase-js)
- **Utilities:** Lucide React (icons), React Markdown & Remark GFM (formatting)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Setup Instructions

1. **Clone and Navigate:**
   ```bash
   git clone https://github.com/codexanjan/clixo-c2p-app.git
   cd clixo
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file at the root of the project:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Locally:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```
