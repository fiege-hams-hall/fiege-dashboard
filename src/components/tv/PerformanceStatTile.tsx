const COLOR_CLASSES: Record<'red' | 'amber' | 'green', { border: string; text: string; glow: string }> = {
  red: { border: 'border-red-500/50', text: 'text-red-400', glow: 'glow-red' },
  amber: { border: 'border-amber-400/50', text: 'text-amber-300', glow: 'glow-amber' },
  green: { border: 'border-emerald-400/50', text: 'text-emerald-300', glow: 'glow-green' },
}

export function PerformanceStatTile({
  icon,
  label,
  value,
  unit,
  meta,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  meta: string
  color: 'red' | 'amber' | 'green'
}) {
  const c = COLOR_CLASSES[color]
  return (
    <div className={`rounded-2xl border bg-[var(--panel)] p-5 ${c.border} ${c.glow}`}>
      <div className={`mb-3 flex items-center gap-2 ${c.text}`}>
        {icon}
        <span className="font-display text-sm font-bold uppercase tracking-wide text-slate-300">{label}</span>
      </div>
      <div className={`font-display text-4xl font-extrabold tabular-nums ${c.text}`}>{value}</div>
      <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-slate-500">
        <span>{unit}</span>
        <span>{meta}</span>
      </div>
    </div>
  )
}
