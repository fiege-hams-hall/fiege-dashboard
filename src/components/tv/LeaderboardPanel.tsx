import { Trophy, TrendingDown } from 'lucide-react'
import type { LeaderboardEntry, Role } from '../../lib/types'

export type BoardTheme = 'top5' | 'bottom5'

const MEDAL_COLORS: Record<number, string> = {
  1: 'bg-yellow-500 text-slate-900',
  2: 'bg-slate-300 text-slate-900',
  3: 'bg-amber-700 text-slate-50',
}

function badgeClass(rank: number, theme: BoardTheme, role: Role) {
  if (theme === 'top5') {
    if (MEDAL_COLORS[rank]) return MEDAL_COLORS[rank]
    return role === 'picker' ? 'bg-red-500 text-slate-50' : 'bg-cyan-500 text-slate-900'
  }
  // bottom5 / focus5: rank 1 is a warning red, the rest a uniform orange
  return rank === 1 ? 'bg-red-700 text-slate-50' : 'bg-orange-500 text-slate-900'
}

function RankRow({
  entry,
  rank,
  theme,
  role,
}: {
  entry: LeaderboardEntry | undefined
  rank: number
  theme: BoardTheme
  role: Role
}) {
  const hasData = !!entry?.employee_name
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-extrabold ${badgeClass(rank, theme, role)}`}
      >
        #{rank}
      </div>
      <div className="min-w-0 flex-1">
        {hasData ? (
          <div className="truncate font-display text-lg font-bold tracking-wide">{entry!.employee_name}</div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="dash-placeholder w-8" />
            <span className="dash-placeholder w-4" />
            <span className="dash-placeholder w-4" />
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        <div className="font-display text-xl font-extrabold tabular-nums">
          {hasData ? entry!.units ?? '—' : '--'}
        </div>
        <div className="text-[10px] font-semibold tracking-widest text-slate-400">UNITS</div>
      </div>
    </div>
  )
}

export function LeaderboardPanel({
  title,
  role,
  entries,
  theme = 'top5',
}: {
  title: string
  role: Role
  entries: LeaderboardEntry[]
  theme?: BoardTheme
}) {
  const byRank = new Map(entries.map((e) => [e.rank, e]))

  const borderClass =
    theme === 'bottom5' ? 'border-orange-500/50 glow-orange' : role === 'picker' ? 'border-red-500/40 glow-red' : 'border-cyan-400/40 glow-cyan'
  const headerColorClass = theme === 'bottom5' ? 'text-orange-400' : role === 'picker' ? 'text-red-400' : 'text-cyan-300'
  const Icon = theme === 'bottom5' ? TrendingDown : Trophy

  return (
    <div className={`rounded-3xl border bg-[var(--panel)] p-5 ${borderClass}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon size={22} className={headerColorClass} strokeWidth={2.5} />
        <h2 className={`font-display text-2xl font-extrabold uppercase tracking-wide ${headerColorClass}`}>{title}</h2>
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((rank) => (
          <RankRow key={rank} rank={rank} entry={byRank.get(rank)} theme={theme} role={role} />
        ))}
      </div>
    </div>
  )
}
