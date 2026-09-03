import { useEffect, useState } from 'react'
import { Logo } from '../components/tv/Logo'
import { HeaderClock } from '../components/tv/HeaderClock'
import { HeaderActions } from '../components/tv/HeaderActions'
import { TopFiveView } from '../components/tv/TopFiveView'
import { BottomFiveView } from '../components/tv/BottomFiveView'
import { PerformanceView } from '../components/tv/PerformanceView'
import { useReportDay } from '../hooks/useReportDay'
import { useWakeLock } from '../hooks/useWakeLock'
import { todayISO } from '../lib/date'

const VIEWS = ['top5', 'bottom5', 'performance'] as const
type View = (typeof VIEWS)[number]

const ROTATE_MS = 30_000

const VIEW_META: Record<View, { title: string; footerLabel: string }> = {
  top5: { title: 'Top 5 Pickers & Packers — Fiege Live Warehouse Dashboard', footerLabel: 'Fiege · Top 5 · Rotating every 30s' },
  bottom5: {
    title: 'Bottom 5 Pickers & Packers — Fiege Live Warehouse Dashboard',
    footerLabel: 'Fiege · Focus 5 · Rotating every 30s',
  },
  performance: { title: 'Fiege Performance Board — Live Warehouse Dashboard', footerLabel: 'Fiege · Live · Auto-refresh 30s' },
}

/**
 * The public TV board. This mirrors the original site's behaviour: a single
 * screen that auto-rotates every 30s through three views — Top 5, Bottom 5
 * ("Focus 5"), and a live performance stats board — rather than three
 * separate pages.
 */
export function TvBoard() {
  const reportDate = todayISO()
  const { day, hourly, leaderboard, loading } = useReportDay(reportDate)
  const { requestWakeLock } = useWakeLock()
  const [viewIndex, setViewIndex] = useState(0)
  const view = VIEWS[viewIndex]

  useEffect(() => {
    const id = setInterval(() => {
      setViewIndex((i) => (i + 1) % VIEWS.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    document.title = VIEW_META[view].title
  }, [view])

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] bg-radial-glow" onClick={requestWakeLock}>
      <div className="top-gradient-bar" />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[var(--panel-2)] px-5 py-4">
          <Logo subtitle="LIVE WAREHOUSE DASHBOARD" />
          <HeaderClock />
          <HeaderActions />
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-slate-500">Loading…</div>
        ) : view === 'top5' ? (
          <TopFiveView day={day} leaderboard={leaderboard} />
        ) : view === 'bottom5' ? (
          <BottomFiveView leaderboard={leaderboard} />
        ) : (
          <PerformanceView hourly={hourly} />
        )}

        <footer className="flex flex-col items-center gap-1 pb-2 pt-4 text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {VIEW_META[view].footerLabel}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-600">
            Tap anywhere to keep screen awake
          </p>
        </footer>
      </div>
    </div>
  )
}
