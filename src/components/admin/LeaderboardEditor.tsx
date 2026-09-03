import type { BoardType, LeaderboardEntry, Role } from '../../lib/types'

function RoleGroup({
  title,
  role,
  boardType,
  entries,
  accent,
  onChange,
}: {
  title: string
  role: Role
  boardType: BoardType
  entries: LeaderboardEntry[]
  accent: 'red' | 'cyan'
  onChange: (rank: number, patch: Partial<LeaderboardEntry>) => void
}) {
  const byRank = new Map(entries.filter((e) => e.role === role && e.board_type === boardType).map((e) => [e.rank, e]))
  return (
    <div
      className={`rounded-2xl border p-4 ${accent === 'red' ? 'border-red-500/40' : 'border-cyan-400/40'}`}
    >
      <h4
        className={`font-display text-base font-extrabold uppercase tracking-wide ${
          accent === 'red' ? 'text-red-400' : 'text-cyan-300'
        }`}
      >
        {title}
      </h4>
      <div className="mt-3 flex flex-col gap-2.5">
        {[1, 2, 3, 4, 5].map((rank) => {
          const entry = byRank.get(rank)
          return (
            <div key={rank} className="flex items-center gap-3">
              <span className="w-4 shrink-0 font-display text-sm font-bold text-slate-500">{rank}</span>
              <input
                type="text"
                placeholder="Employee name"
                value={entry?.employee_name ?? ''}
                onChange={(e) => onChange(rank, { employee_name: e.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[var(--panel)] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
              />
              <input
                type="number"
                placeholder="Units"
                value={entry?.units ?? ''}
                onChange={(e) => onChange(rank, { units: e.target.value === '' ? null : Number(e.target.value) })}
                className="w-24 shrink-0 rounded-lg border border-white/10 bg-[var(--panel)] px-3 py-2 text-right text-sm text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LeaderboardEditor({
  boardType,
  title,
  entries,
  onEntryChange,
  bannerMessage,
  onBannerChange,
}: {
  boardType: BoardType
  title: string
  entries: LeaderboardEntry[]
  onEntryChange: (role: Role, rank: number, patch: Partial<LeaderboardEntry>) => void
  bannerMessage?: string | null
  onBannerChange?: (v: string) => void
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--panel-2)] p-5">
      <h3 className="font-display text-lg font-extrabold uppercase tracking-wide">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">Best (or most improved) performers of the day.</p>

      {onBannerChange && (
        <div className="mt-4">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Banner message (leave blank for default)
          </label>
          <input
            type="text"
            value={bannerMessage ?? ''}
            onChange={(e) => onBannerChange(e.target.value)}
            placeholder="Well done team — outstanding work, keep it up!"
            className="mt-1 w-full rounded-lg border border-white/10 bg-[var(--panel)] px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400"
          />
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <RoleGroup
          title={`${boardType === 'top5' ? 'TOP 5' : 'BOTTOM 5'} PICKERS`}
          role="picker"
          boardType={boardType}
          entries={entries}
          accent="red"
          onChange={(rank, patch) => onEntryChange('picker', rank, patch)}
        />
        <RoleGroup
          title={`${boardType === 'top5' ? 'TOP 5' : 'BOTTOM 5'} PACKERS`}
          role="packer"
          boardType={boardType}
          entries={entries}
          accent="cyan"
          onChange={(rank, patch) => onEntryChange('packer', rank, patch)}
        />
      </div>
    </div>
  )
}
