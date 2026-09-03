export function Logo({ size = 64 }: { size?: number }) {
  const width = size * 0.92

  return (
    <div className="logo-in group flex items-center gap-3 transition-transform hover:scale-105" aria-label="Fiege">
      <div className="logo-float relative" style={{ width, height: size }}>
        <span className="logo-halo" aria-hidden="true" />
        <svg width={width} height={size} viewBox="0 0 46 50" aria-label="Fiege" className="relative z-10">
          <polygon
            className="logo-hex"
            points="23,2 44,13 44,37 23,48 2,37 2,13"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon className="logo-chevron" points="28,15 18,25 28,35 24,35 14,25 24,15" fill="currentColor" />
        </svg>
      </div>
      <span className="brand-shine text-3xl font-black leading-none" style={{ letterSpacing: '0.14em' }}>
        FIEGE
      </span>
    </div>
  )
}
