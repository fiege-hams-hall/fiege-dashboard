import { Fragment } from 'react'
import { computeRate } from '../../lib/upmh'
import type { HourlyRow, TrackingInfo, TrackingRow } from '../../lib/types'

// Matches the physical whiteboard's rolling hour cycle (starts at 10-11,
// wraps through midnight, ends at 09-10) rather than the 06:00 start used
// elsewhere in the app — same as the admin editor's board.
const TRACKING_HOURS: string[] = Array.from({ length: 24 }, (_, i) => {
  const pad = (h: number) => h.toString().padStart(2, '0')
  const start = (10 + i) % 24
  const end = (11 + i) % 24
  return `${pad(start)}-${pad(end)}`
})

// The Outbound SIC Data step's 24 hourly rows start at 06:00 (hour_index 0
// = "06:00-07:00"), while this board's rolling day starts at 10-11. Row j
// here lines up with SIC hour_index (j + 4) % 24.
const SIC_HOUR_OFFSET = 4

function sicRowFor(hourly: HourlyRow[], trackingRowIndex: number): HourlyRow | undefined {
  return hourly[(trackingRowIndex + SIC_HOUR_OFFSET) % 24]
}

const ACCENT = {
  cyan: { bg: 'bg-cyan-500/90', text: 'text-cyan-300' },
  red: { bg: 'bg-red-500/90', text: 'text-red-400' },
  amber: { bg: 'bg-amber-500/90', text: 'text-amber-300' },
  slate: { bg: 'bg-slate-600/90', text: 'text-slate-300' },
} as const
type Accent = keyof typeof ACCENT

function GroupHeader({ title, accent, span, target }: { title: string; accent: Accent; span: number; target?: string }) {
  return (
    <div
      style={{ gridColumn: `span ${span}` }}
      className={`flex items-center justify-center gap-2 border border-white/10 px-1 font-display font-extrabold text-white uppercase tracking-wide ${ACCENT[accent].bg}`}
    >
      <span style={{ fontSize: 'clamp(10px, 1.15vh, 16px)' }}>{title}</span>
      {target !== undefined && (
        <span
          className="rounded bg-black/25 px-1.5 py-0.5 font-semibold normal-case text-white/80"
          style={{ fontSize: 'clamp(8px, 0.85vh, 11px)' }}
        >
          Target {target}
        </span>
      )}
    </div>
  )
}

function SubHeader({ label, accent }: { label: string; accent: Accent }) {
  return (
    <div
      className={`flex items-center justify-center border border-white/10 bg-[var(--bg-panel)] px-1 text-center leading-tight font-bold uppercase tracking-wide ${ACCENT[accent].text}`}
      style={{ fontSize: 'clamp(8px, 0.8vh, 11px)' }}
    >
      {label}
    </div>
  )
}

function Cell({ value }: { value: string | number | null | undefined }) {
  return (
    <div
      className="flex items-center justify-center border border-white/10 bg-[var(--bg-panel)] tabular-nums text-slate-100"
      style={{ fontSize: 'clamp(9px, 1.05vh, 14px)' }}
    >
      {value === null || value === undefined || value === '' ? '—' : value}
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="shrink-0 font-bold tracking-widest text-slate-500 uppercase"
        style={{ fontSize: 'clamp(9px, 1vh, 13px)' }}
      >
        {label}:
      </span>
      <span className="font-bold text-slate-100" style={{ fontSize: 'clamp(11px, 1.3vh, 17px)' }}>
        {value || '—'}
      </span>
    </div>
  )
}

/**
 * Read-only, full-bleed TV rendition of the Admin panel's Daily Tracking
 * board — the digital replica of the shop-floor whiteboard. Uses CSS Grid
 * (rather than an HTML table) so the 24 hourly rows can flex to fill
 * whatever vertical space the rotation slot gives it with no scrollbar,
 * matching every other view on this board.
 */
export function DailyTrackingView({
  hourly,
  trackingInfo,
  trackingRows,
}: {
  hourly: HourlyRow[]
  trackingInfo: TrackingInfo
  trackingRows: TrackingRow[]
}) {
  const rowByIndex = new Map(trackingRows.map((r) => [r.hour_index, r]))

  return (
    <section className="grid min-h-0 gap-3" style={{ gridTemplateRows: 'auto 1fr' }}>
      <div className="panel stagger-in flex flex-wrap items-center justify-between gap-4 px-6 py-2.5">
        <span
          className="font-display font-extrabold text-white uppercase tracking-wide"
          style={{ fontSize: 'clamp(14px, 1.7vh, 22px)' }}
        >
          Daily Tracking
        </span>
        <div className="flex flex-wrap items-center gap-6">
          <InfoField label="Owner AM" value={trackingInfo.owner_am} />
          <InfoField label="Owner PM" value={trackingInfo.owner_pm} />
          <InfoField label="Target AM" value={trackingInfo.target_am} />
          <InfoField label="Target PM" value={trackingInfo.target_pm} />
        </div>
      </div>

      <div
        className="grid min-h-0 overflow-hidden rounded-2xl border border-white/10"
        style={{
          gridTemplateColumns: '7fr repeat(10, 6.5fr) 10fr 10fr',
          gridTemplateRows: 'auto auto repeat(24, 1fr)',
        }}
      >
        <div
          style={{ gridRow: 'span 2' }}
          className="flex items-center justify-center border border-white/10 bg-slate-700/90 font-display font-extrabold text-white uppercase tracking-wide"
        >
          <span style={{ fontSize: 'clamp(9px, 1vh, 13px)' }}>Hour</span>
        </div>
        <GroupHeader title="Pack" accent="cyan" span={4} target="135" />
        <GroupHeader title="Pick" accent="red" span={3} target="210" />
        <GroupHeader title="Rebin" accent="amber" span={3} target="350" />
        <GroupHeader title="Total" accent="slate" span={2} />

        <SubHeader label="Ops" accent="cyan" />
        <SubHeader label="Spiders" accent="cyan" />
        <SubHeader label="Units" accent="cyan" />
        <SubHeader label="UPH" accent="cyan" />

        <SubHeader label="Ops" accent="red" />
        <SubHeader label="Units" accent="red" />
        <SubHeader label="UPH" accent="red" />

        <SubHeader label="Ops" accent="amber" />
        <SubHeader label="Units" accent="amber" />
        <SubHeader label="UPH" accent="amber" />

        <SubHeader label="Admin+TL" accent="slate" />
        <SubHeader label="Prod. Hrs" accent="slate" />

        {TRACKING_HOURS.map((slot, i) => {
          const row = rowByIndex.get(i)
          const sic = sicRowFor(hourly, i)
          const packOps = sic?.pack_hours ?? null
          const pickOps = sic?.pick_hours ?? null
          const pickUnits = sic?.pick_units ?? null
          const packUnits = sic?.pack_units ?? null
          const pickUph = computeRate(sic?.pick_units, sic?.pick_hours)
          const packUph = computeRate(sic?.pack_units, sic?.pack_hours)
          return (
            <Fragment key={slot}>
              <div
                className="flex items-center justify-center border border-white/10 bg-slate-700/40 font-display font-bold text-slate-200"
                style={{ fontSize: 'clamp(9px, 1vh, 13px)' }}
              >
                {slot}
              </div>
              <Cell value={packOps} />
              <Cell value={row?.spiders} />
              <Cell value={packUnits} />
              <Cell value={packUph} />

              <Cell value={pickOps} />
              <Cell value={pickUnits} />
              <Cell value={pickUph} />

              <Cell value={row?.rebin_ops} />
              <Cell value={row?.rebin_units} />
              <Cell value={row?.rebin_uph} />

              <Cell value={row?.admin_tl} />
              <Cell value={row?.productive_hours} />
            </Fragment>
          )
        })}
      </div>
    </section>
  )
}
