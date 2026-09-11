import { useState } from 'react'

// Matches the physical whiteboard's rolling hour cycle (starts at 10-11,
// wraps through midnight, ends at 09-10) rather than the 06:00 start used
// elsewhere in the app.
const TRACKING_HOURS: string[] = Array.from({ length: 24 }, (_, i) => {
  const pad = (h: number) => h.toString().padStart(2, '0')
  const start = (10 + i) % 24
  const end = (11 + i) % 24
  return `${pad(start)}-${pad(end)}`
})

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}:</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 rounded border border-white/15 bg-transparent px-1.5 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400"
      />
    </div>
  )
}

function GroupHeaderCell({
  title,
  accent,
  colSpan,
  target,
}: {
  title: string
  accent: 'cyan' | 'red' | 'amber' | 'slate'
  colSpan: number
  target?: string
}) {
  const bg =
    accent === 'cyan'
      ? 'bg-cyan-500/90'
      : accent === 'red'
        ? 'bg-red-500/90'
        : accent === 'amber'
          ? 'bg-amber-500/90'
          : 'bg-slate-600/90'
  return (
    <th
      colSpan={colSpan}
      className={`border border-white/10 px-1 py-1 font-display text-[11px] font-extrabold uppercase tracking-wide text-white ${bg}`}
    >
      <div className="flex items-center justify-center gap-1.5">
        <span>{title}</span>
        {target !== undefined && (
          <span className="flex items-center gap-1 rounded bg-black/25 px-1 py-0.5 text-[9px] font-semibold tracking-wide normal-case text-white/80">
            Target {target}
          </span>
        )}
      </div>
    </th>
  )
}

function SubHeaderCell({ label, accent }: { label: string; accent: 'cyan' | 'red' | 'amber' | 'slate' }) {
  const text = accent === 'cyan' ? 'text-cyan-300' : accent === 'red' ? 'text-red-400' : accent === 'amber' ? 'text-amber-300' : 'text-slate-300'
  return (
    <th
      className={`border border-white/10 bg-[var(--panel)] px-1 py-1 text-[9px] font-bold uppercase tracking-wide ${text}`}
    >
      {label}
    </th>
  )
}

function BlankCell() {
  return <td className="border border-white/10 bg-[var(--panel-2)] px-1 py-0.5" />
}

/**
 * A digital replica of the shop-floor "Daily Tracking" whiteboard (Pack /
 * Pick / Rebin ops, units and UPH per hour, plus Admin+TL and Productive
 * Hours), styled with the dashboard's own colors. The info bar (owner,
 * targets, shift) is editable so it can be filled in each shift; the hourly
 * grid cells are intentionally still blank — this is the layout only. Once
 * we know which of those should pull from existing Admin data (e.g.
 * Pack/Pick Units from the Outbound SIC hourly figures) we can wire those
 * cells up instead of leaving them for manual entry. Sized compactly so the
 * whole board fits on screen without a scrollbar.
 *
 * Note: the info bar fields below are local to this tab for now (not yet
 * saved to the database), so they'll reset on page refresh or if you switch
 * report dates and back.
 */
export function DailyTrackingBoard({
  reportDate,
  onReportDateChange,
}: {
  reportDate: string
  onReportDateChange: (v: string) => void
}) {
  const [ownerAm, setOwnerAm] = useState('')
  const [ownerPm, setOwnerPm] = useState('')
  const [targetAm, setTargetAm] = useState('')
  const [targetPm, setTargetPm] = useState('')
  const [shift, setShift] = useState('')

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-white/10 bg-[var(--panel-2)] p-5">
        <h3 className="font-display text-lg font-extrabold uppercase tracking-wide">Daily Tracking</h3>
        <p className="mt-1 text-sm text-slate-400">
          Replica of the shop-floor tracking board. The grid below is still blank — it will populate from Admin data
          once that's wired up.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-white/10 bg-[var(--panel)] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date:</span>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => onReportDateChange(e.target.value)}
              className="rounded border border-white/15 bg-transparent px-1.5 py-1 text-xs font-bold text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>
          <TextField label="Owner AM" value={ownerAm} onChange={setOwnerAm} />
          <TextField label="Owner PM" value={ownerPm} onChange={setOwnerPm} />
          <TextField label="Target AM" value={targetAm} onChange={setTargetAm} />
          <TextField label="Target PM" value={targetPm} onChange={setTargetPm} />
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-500">Shift:</span>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="rounded border border-white/15 bg-[var(--panel-2)] px-1.5 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400"
            >
              <option value="">—</option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
              <option value="NS">NS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[var(--panel-2)] p-2">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[7%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[6.5%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border border-white/10 bg-slate-700/90 px-1 py-1 font-display text-[11px] font-extrabold uppercase tracking-wide text-white"
              >
                Hour
              </th>
              <GroupHeaderCell title="Pack" accent="cyan" colSpan={4} target="135" />
              <GroupHeaderCell title="Pick" accent="red" colSpan={3} target="210" />
              <GroupHeaderCell title="Rebin" accent="amber" colSpan={3} target="350" />
              <GroupHeaderCell title="Total" accent="slate" colSpan={2} />
            </tr>
            <tr>
              <SubHeaderCell label="Ops" accent="cyan" />
              <SubHeaderCell label="Spiders" accent="cyan" />
              <SubHeaderCell label="Units" accent="cyan" />
              <SubHeaderCell label="UPH" accent="cyan" />

              <SubHeaderCell label="Ops" accent="red" />
              <SubHeaderCell label="Units" accent="red" />
              <SubHeaderCell label="UPH" accent="red" />

              <SubHeaderCell label="Ops" accent="amber" />
              <SubHeaderCell label="Units" accent="amber" />
              <SubHeaderCell label="UPH" accent="amber" />

              <SubHeaderCell label="Admin + TL" accent="slate" />
              <SubHeaderCell label="Productive Hrs" accent="slate" />
            </tr>
          </thead>
          <tbody>
            {TRACKING_HOURS.map((slot) => (
              <tr key={slot}>
                <td className="border border-white/10 bg-slate-700/40 px-1 py-0.5 font-display text-[10px] font-bold text-slate-200">
                  {slot}
                </td>
                <BlankCell />
                <BlankCell />
                <BlankCell />
                <BlankCell />
                <BlankCell />
                <BlankCell />
                <BlankCell />
                <BlankCell />
                <BlankCell />
                <BlankCell />
                <BlankCell />
                <BlankCell />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
