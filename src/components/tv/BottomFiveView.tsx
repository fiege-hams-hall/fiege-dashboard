import { LeaderboardPanel } from './LeaderboardPanel'
import type { LeaderboardEntry } from '../../lib/types'

const BOTTOM_FIVE_BANNER = "Every hour is a fresh start — push on, you've got this!"

export function BottomFiveView({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const pickers = leaderboard.filter((e) => e.board_type === 'bottom5' && e.role === 'picker')
  const packers = leaderboard.filter((e) => e.board_type === 'bottom5' && e.role === 'packer')

  return (
    <>
      <div className="rounded-2xl border border-orange-500/50 bg-[var(--panel-2)] px-6 py-5 text-center">
        <p className="font-display text-xl font-extrabold uppercase tracking-wide text-slate-50 md:text-2xl">
          {BOTTOM_FIVE_BANNER}
        </p>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
        <LeaderboardPanel title="BOTTOM 5 PICKERS" role="picker" entries={pickers} theme="bottom5" />
        <LeaderboardPanel title="BOTTOM 5 PACKERS" role="packer" entries={packers} theme="bottom5" />
      </div>
    </>
  )
}
