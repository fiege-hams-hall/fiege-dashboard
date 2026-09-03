import { LeaderboardPanel } from './LeaderboardPanel'
import { DEFAULT_BANNER } from '../../lib/constants'
import type { LeaderboardEntry, ReportDay } from '../../lib/types'

export function TopFiveView({ day, leaderboard }: { day: ReportDay | null; leaderboard: LeaderboardEntry[] }) {
  const pickers = leaderboard.filter((e) => e.board_type === 'top5' && e.role === 'picker')
  const packers = leaderboard.filter((e) => e.board_type === 'top5' && e.role === 'packer')
  const banner = day?.banner_message || DEFAULT_BANNER

  return (
    <>
      <div className="rounded-2xl border border-amber-400/50 bg-[var(--panel-2)] px-6 py-5 text-center">
        <p className="font-display text-xl font-extrabold uppercase tracking-wide text-slate-50 md:text-2xl">
          {banner}
        </p>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
        <LeaderboardPanel title="TOP 5 PICKERS" role="picker" entries={pickers} theme="top5" />
        <LeaderboardPanel title="TOP 5 PACKERS" role="packer" entries={packers} theme="top5" />
      </div>
    </>
  )
}
