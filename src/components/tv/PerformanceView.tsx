import { Boxes, Package, PackageCheck } from 'lucide-react'
import { PerformanceStatTile } from './PerformanceStatTile'
import { cumulativeStats, lastActiveHour } from '../../lib/performance'
import { useClock } from '../../hooks/useClock'
import { formatClock } from '../../lib/date'
import type { HourlyRow } from '../../lib/types'

// Fixed shift targets. Not currently admin-configurable — see README if you want to make these editable.
const PICK_UPMH_TARGET = 210
const PACK_UPMH_TARGET = 135

export function PerformanceView({ hourly }: { hourly: HourlyRow[] }) {
  const now = useClock()
  const last = lastActiveHour(hourly)
  const cumulative = cumulativeStats(hourly)
  const asOf = `as of ${formatClock(now)}`

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PerformanceStatTile
        icon={<Boxes size={18} strokeWidth={2.5} />}
        label="Pick UPMH · Last Hour"
        value={last.pickUpmh?.toString() ?? '—'}
        unit="Units / man-hour"
        meta={last.slot ? `${last.slot} · target ${PICK_UPMH_TARGET}` : `target ${PICK_UPMH_TARGET}`}
        color="red"
      />
      <PerformanceStatTile
        icon={<Package size={18} strokeWidth={2.5} />}
        label="Pack UPMH · Last Hour"
        value={last.packUpmh?.toString() ?? '—'}
        unit="Units / man-hour"
        meta={last.slot ? `${last.slot} · target ${PACK_UPMH_TARGET}` : `target ${PACK_UPMH_TARGET}`}
        color="red"
      />
      <PerformanceStatTile
        icon={<PackageCheck size={18} strokeWidth={2.5} />}
        label="Units Packed · Last Hour"
        value={last.packUnits?.toLocaleString() ?? '—'}
        unit="Units"
        meta={last.slot ?? '—'}
        color="amber"
      />
      <PerformanceStatTile
        icon={<Boxes size={18} strokeWidth={2.5} />}
        label="Pick UPMH · Cumulative"
        value={cumulative.pickUpmh?.toString() ?? '—'}
        unit="Units / man-hour"
        meta={asOf}
        color="red"
      />
      <PerformanceStatTile
        icon={<Package size={18} strokeWidth={2.5} />}
        label="Pack UPMH · Cumulative"
        value={cumulative.packUpmh?.toString() ?? '—'}
        unit="Units / man-hour"
        meta={asOf}
        color="red"
      />
      <PerformanceStatTile
        icon={<PackageCheck size={18} strokeWidth={2.5} />}
        label="Units Packed · Running Total"
        value={cumulative.packUnitsTotal.toLocaleString()}
        unit="Units"
        meta={asOf}
        color="green"
      />
    </div>
  )
}
