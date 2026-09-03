import { Navigate, Route, Routes } from 'react-router-dom'
import { TvBoard } from './pages/TvBoard'
import { UnitsBoard } from './pages/UnitsBoard'
import { Admin } from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/top5" replace />} />
      <Route path="/top5" element={<TvBoard boardType="top5" />} />
      <Route path="/bottom5" element={<TvBoard boardType="bottom5" />} />
      <Route path="/units" element={<UnitsBoard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/top5" replace />} />
    </Routes>
  )
}
