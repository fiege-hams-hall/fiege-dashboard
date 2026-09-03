import { useClock } from '../../hooks/useClock'
import { formatClock, formatDateBadge } from '../../lib/date'

export function HeaderClock() {
  const now = useClock()
  return (
    <div className="text-center">
      <div className="font-display text-4xl font-extrabold tracking-wider text-cyan-300 tabular-nums md:text-5xl">
        {formatClock(now)}
      </div>
      <div className="font-display text-xs font-semibold tracking-[0.25em] text-slate-400">
        {formatDateBadge(now)}
      </div>
    </div>
  )
}
