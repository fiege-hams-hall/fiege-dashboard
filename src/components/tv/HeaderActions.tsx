import { Link } from 'react-router-dom'
import { Maximize2, Lock } from 'lucide-react'

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

export function HeaderActions() {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        onClick={toggleFullscreen}
        className="flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-slate-900 transition hover:bg-cyan-400"
      >
        <Maximize2 size={16} />
        Full Screen
      </button>
      <Link
        to="/admin"
        className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-400"
      >
        <Lock size={16} />
        Admin
      </Link>
    </div>
  )
}
