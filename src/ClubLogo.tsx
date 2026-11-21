import { useState } from 'react'

export interface ClubLogoProps {
  url?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ClubLogo({
  url,
  size = 'md',
  className = ''
}: ClubLogoProps) {
  const [imgError, setImgError] = useState(false)
  const resolvedUrl = url || (import.meta.env.VITE_CLUB_LOGO_URL as string) || '/logo.png'

  if (resolvedUrl && !imgError) {
    return (
      <img
        src={resolvedUrl}
        alt="Andes Talleres Sport Club"
        className={`club-logo-img logo-${size} ${className}`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div className={`brand-shield shield-${size} basketball-shield ${className}`} aria-label="Andes Talleres Básquet">
      <div className="shield-inner">
        <span>AT</span>
        <small>SC</small>
        <div className="shield-sub">BÁSQUET</div>
      </div>
      <div className="shield-ball-accent" title="Básquetbol">🏀</div>
    </div>
  )
}

export default ClubLogo
