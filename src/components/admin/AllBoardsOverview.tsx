import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import Papa from 'papaparse'
import { fetchLeaderboardEntries } from '../../lib/api'
import { todayISO } from '../../lib/date'
import type { BoardType, LeaderboardEntry, Role } from '../../lib/types'

const SECTIONS: { boardType: BoardType; role: Role; title: string; accent: 'red' | 'cyan' }[] = [
  { boardType: 'top5', role: 'picker', title: 'Top 5 Pickers', accent: 'red' },
  { boardType: 'top5', role: 'packer', title: 'Top 5 Packers', accent: 'cyan' },
  { boardType: 'bottom5', role: 'picker', title: 'Bottom 5 Pickers', accent: 'red' },
  { boardType: 'bottom5', role: 'packer', title: 'Bottom 5 Packers', accent: 'cyan' },
]

function boardLabel(b: BoardType) {
  return b === 'top5' ? 'Top 5' : 'Bottom 5'
}
function roleLabel(r: Role) {
  return r === 'picker' ? 'Picker' : 'Packer'
}

/**
 * Read-only "all four sections at once" view of a single day's leaderboard,
 * with its own date picker (independent of the report date the rest of the
 * Admin panel is editing) and a CSV export of exactly what's on screen.
 */
export function AllBoardsOverview({ initialDate }: { initialDate: string }) {
  const [viewDate, setViewDate] = useState(initialDate)
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setEntries(null)
    setError('')
    fetchLeaderboardEntries(viewDate)
      .then((rows) => {
        if (!cancelled) setEntries(rows)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load that date.')
      })
    return () => {
      cancelled = true
    }
  }, [viewDate])

  function rowsFor(boardType: BoardType, role: Role) {
    return (entries ?? [])
      .filter((e) => e.board_type === boardType && e.role === role)
      .filter((e) => (e.employee_name ?? '').trim() !== '')
      .sort((a, b) => a.rank - b.rank)
  }

  const hasAnyData = (entries ?? []).some((e) => (e.employee_name ?? '').trim() !== '')

  function handleExportCsv() {
    if (!entries) return
    const rows = entries
      .filter((e) => (e.employee_name ?? '').trim() !== '')
      .sort((a, b) => {
        if (a.board_type !== b.board_type) return a.board_type === 'top5' ? -1 : 1
        if (a.role !== b.role) return a.role === 'picker' ? -1 : 1
        return a.rank - b.rank
      })
      .map((e) => ({
        Date: e.report_date,
        Board: boardLabel(e.board_type),
        Role: roleLabel(e.role),
        Rank: e.rank,
        Name: e.employee_name,
        Units: e.units ?? '',
      }))

    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leaderboards-${viewDate}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[var(--panel-2)] p-5">
        <div>
          <h3 className="font-display text-lg font-extrabold uppercase tracking-wide">All Boards</h3>
          <p className="mt-1 text-sm text-slate-400">
            Top 5 and Bottom 5 pickers &amp; packers together, for any date. Read-only — edit them from the Top 5 /
            Bottom 5 Board tabs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Date:</label>
            <input
              type="date"
              value={viewDate}
              max={todayISO()}
              onChange={(e) => setViewDate(e.target.value)}
              className="rounded-lg border border-white/10 bg-[var(--panel)] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!hasAnyData}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {!entries && !error ? (
        <div className="rounded-2xl border border-white/10 bg-[var(--panel-2)] p-8 text-center text-slate-500">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SECTIONS.map(({ boardType, role, title, accent }) => {
            const rows = rowsFor(boardType, role)
            return (
              <div
                key={`${boardType}-${role}`}
                className={`rounded-2xl border p-4 ${accent === 'red' ? 'border-red-500/40' : 'border-cyan-400/40'}`}
              >
                <h4
                  className={`font-display text-base font-extrabold uppercase tracking-wide ${
                    accent === 'red' ? 'text-red-400' : 'text-cyan-300'
                  }`}
                >
                  {title}
                </h4>
                <div className="mt-3 flex flex-col gap-2">
                  {rows.length === 0 ? (
                    <p className="text-sm text-slate-500">No data for this date.</p>
                  ) : (
                    rows.map((e) => (
                      <div
                        key={e.rank}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-[var(--panel)] px-3 py-2"
                      >
                        <span className="w-5 shrink-0 font-display text-sm font-bold text-slate-500">{e.rank}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{e.employee_name}</span>
                        <span className="shrink-0 text-sm tabular-nums text-slate-300">{e.units ?? '—'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
