import { useEffect } from 'react'
import { Logo } from '../components/tv/Logo'
import { HeaderClock } from '../components/tv/HeaderClock'
import { HeaderActions } from '../components/tv/HeaderActions'
import { useReportDay } from '../hooks/useReportDay'
import { useWakeLock } from '../hooks/useWakeLock'
import { todayISO } from '../lib/date'

function Tile({ label, value, accent }: { label: string; value: number | null | undefined; accent: string }) {
  return (
    <div className="rounded-3xl border bg-[var(--panel)] p-6 text-center" style={{ borderColor: accent }}>
      <div className="font-display text-5xl font-extrabold tabular-nums" style={{ color: accent }}>
        {value ?? '—'}
      </div>
      <div className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
    </div>
  )
}

export function UnitsBoard() {
  const reportDate = todayISO()
  const { day, loading } = useReportDay(reportDate)
  const { requestWakeLock } = useWakeLock()

  useEffect(() => {
    document.title = 'Units to Pick / Pack — Fiege Live Warehouse Dashboard'
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]" onClick={requestWakeLock}>
      <div className="top-gradient-bar" />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[var(--panel-2)] px-5 py-4">
          <Logo subtitle="LIVE WAREHOUSE DASHBOARD" />
          <HeaderClock />
          <HeaderActions />
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-slate-500">Loading…</div>
        ) : (
          <div className="grid flex-1 grid-cols-2 gap-6 md:grid-cols-3">
            <Tile label="Units to Pick" value={day?.units_to_pick} accent="#ef4444" />
            <Tile label="Units to Pack" value={day?.units_to_pack} accent="#22d3ee" />
            <Tile label="Pre-processed Failed" value={day?.pre_processed_failed} accent="#f59e0b" />
            <Tile label="Backlog Orders" value={day?.backlog_orders} accent="#eab308" />
            <Tile label="Overpicks" value={day?.overpicks} accent="#94a3b8" />
          </div>
        )}

        <footer className="flex flex-col items-center gap-1 pb-2 pt-4 text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Fiege · Units Board · Rotating every 30s
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-600">
            Tap anywhere to keep screen awake
          </p>
        </footer>
      </div>
    </div>
  )
}
