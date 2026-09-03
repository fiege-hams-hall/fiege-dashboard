export function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-red-400/70" style={{ clipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)' }}>
        <span className="font-display text-xl font-bold text-red-400">F</span>
      </div>
      <div>
        <div className="font-display text-3xl font-extrabold tracking-wide">
          FIEG<span className="text-red-400">E</span>
        </div>
        {subtitle && (
          <div className="font-display text-xs font-semibold tracking-[0.3em] text-slate-400">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
