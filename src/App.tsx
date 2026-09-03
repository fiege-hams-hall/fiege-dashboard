import { Navigate, Route, Routes } from 'react-router-dom'
import { TvBoard } from './pages/TvBoard'
import { Admin } from './pages/Admin'

// Matches the original site's real routes: a single rotating TV board at
// /top5 (which cycles Top 5 → Bottom 5/Focus 5 → Performance Board every
// 30s) plus /admin. Anything else falls back to the board, same as the
// original's 404 handling.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/top5" replace />} />
      <Route path="/top5" element={<TvBoard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/top5" replace />} />
    </Routes>
  )
}
