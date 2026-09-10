const STEPS = [
  { id: 1, label: 'Outbound SIC Data' },
  { id: 2, label: 'Units to Pick / Pack' },
  { id: 3, label: 'Top 5 Board' },
  { id: 4, label: 'Bottom 5 Board' },
  { id: 5, label: 'All Boards' },
]

export function StepTabs({ step, onStepChange }: { step: number; onStepChange: (s: number) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[var(--panel-2)] p-2">
      {STEPS.map((s) => (
        <button
          key={s.id}
          onClick={() => onStepChange(s.id)}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide transition ${
            step === s.id ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{s.id}</span>
          {s.label}
        </button>
      ))}
    </div>
  )
}
