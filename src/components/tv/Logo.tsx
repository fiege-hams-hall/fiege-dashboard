import logoImg from '../../assets/fiege-logo.png'

export function Logo({ size = 64 }: { size?: number }) {
  return (
    <div className="logo-in flex items-center" aria-label="Fiege">
      <img
        src={logoImg}
        alt="Fiege"
        className="rounded-md object-contain transition-transform hover:scale-105"
        style={{ height: size, width: 'auto' }}
      />
    </div>
  )
}
