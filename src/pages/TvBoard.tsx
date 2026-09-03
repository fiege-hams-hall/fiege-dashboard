import { useEffect } from 'react'
import { Logo } from '../components/tv/Logo'
import { HeaderClock } from '../components/tv/HeaderClock'
import { HeaderActions } from '../components/tv/HeaderActions'
import { LeaderboardPanel } from '../components/tv/LeaderboardPanel'
import { useReportDay } from '../hooks/useReportDay'
import { useWakeLock } from '../hooks/useWakeLock'
import { todayISO } from '../lib/date'
import { DEFAULT_BANNER } from '../lib/constants'
import type { BoardType } from '../lib/types'

export function TvBoard({ boardType }: { boardType: BoardType }) {
  const reportDate = todayISO()
  const { day, leaderboard, loading } = useReportDay(reportDate)
  const { requestWakeLock } = useWakeLock()

  useEffect(() => {
    document.title =
      boardType === 'top5'
        ? 'Top 5 Pickers & Packers — Fiege Live Warehouse Dashboard'
        : 'Bottom 5 — Fiege Live Warehouse Dashboard'
  }, [boardType])

  const pickers = leaderboard.filter((e) => e.board_type === boardType && e.role === 'picker')
  const packers = leaderboard.filter((e) => e.board_type === boardType && e.role === 'packer')
  const banner = (boardType === 'top5' ? day?.banner_message : null) || DEFAULT_BANNER
  const label = boardType === 'top5' ? 'TOP 5' : 'BOTTOM 5'

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]" onClick={requestWakeLock}>
      <div className="top-gradient-bar" />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[var(--panel-2)] px-5 py-4">
          <Logo subtitle="LIVE WAREHOUSE DASHBOARD" />
          <HeaderClock />
          <HeaderActions />
        </header>

        <div className="rounded-2xl border border-amber-400/50 bg-[var(--panel-2)] px-6 py-5 text-center">
          <p className="font-display text-xl font-extrabold uppercase tracking-wide text-slate-50 md:text-2xl">
            {banner}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-slate-500">Loading…</div>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
            <LeaderboardPanel title={`${label} PICKERS`} role="picker" entries={pickers} />
            <LeaderboardPanel title={`${label} PACKERS`} role="packer" entries={packers} />
          </div>
        )}

        <footer className="flex flex-col items-center gap-1 pb-2 pt-4 text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Fiege · {label} · Rotating every 30s
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-600">
            Tap anywhere to keep screen awake
          </p>
        </footer>
      </div>
    </div>
  )
}
