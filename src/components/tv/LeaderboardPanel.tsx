import type { LeaderboardEntry, Role } from '../../lib/types'

const RANK_COLORS: Record<number, string> = {
  1: 'bg-yellow-500 text-slate-900',
  2: 'bg-slate-300 text-slate-900',
  3: 'bg-amber-700 text-slate-50',
}

function badgeClass(rank: number, accent: 'red' | 'cyan') {
  if (RANK_COLORS[rank]) return RANK_COLORS[rank]
  return accent === 'red' ? 'bg-red-500 text-slate-50' : 'bg-cyan-500 text-slate-900'
}

function RankRow({ entry, rank, accent }: { entry: LeaderboardEntry | undefined; rank: number; accent: 'red' | 'cyan' }) {
  const hasData = !!entry?.employee_name
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-extrabold ${badgeClass(rank, accent)}`}>
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
}: {
  title: string
  role: Role
  entries: LeaderboardEntry[]
}) {
  const accent: 'red' | 'cyan' = role === 'picker' ? 'red' : 'cyan'
  const byRank = new Map(entries.map((e) => [e.rank, e]))

  return (
    <div
      className={`rounded-3xl border bg-[var(--panel)] p-5 ${
        accent === 'red' ? 'border-red-500/40 glow-red' : 'border-cyan-400/40 glow-cyan'
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">🏆</span>
        <h2 className={`font-display text-2xl font-extrabold uppercase tracking-wide ${accent === 'red' ? 'text-red-400' : 'text-cyan-300'}`}>
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((rank) => (
          <RankRow key={rank} rank={rank} entry={byRank.get(rank)} accent={accent} />
        ))}
      </div>
    </div>
  )
}
