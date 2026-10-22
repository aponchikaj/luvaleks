import { useId } from 'react'
import { nextAnniversary } from '@/lib/anniversary'

/**
 * Original macOS-style app icons (Big Sur grid: squircle body, top-lit gradient, soft drop shadow).
 * Drawn on a 100×100 canvas; the body sits inside with room for the shadow, like real .icns art.
 */

// Continuous-curvature "squircle", the shape macOS uses instead of a plain rounded rect.
const SQUIRCLE = 'M50 0C9 0 0 9 0 50s9 50 50 50 50-9 50-50S91 0 50 0Z'

function Body({ id, from, to, children, plate }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2.2" stdDeviation="2.2" floodColor="#000" floodOpacity="0.32" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={SQUIRCLE} />
        </clipPath>
      </defs>
      <g transform="translate(8 7) scale(0.84)" filter={`url(#${id}-shadow)`}>
        <path d={SQUIRCLE} fill={plate ?? `url(#${id}-bg)`} />
        <g clipPath={`url(#${id}-clip)`}>{children}</g>
        <path d={SQUIRCLE} fill={`url(#${id}-sheen)`} />
        <path d={SQUIRCLE} fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="0.8" />
      </g>
    </>
  )
}

const HEART = 'M50 82C27 66 14 54 14 38c0-11 8.5-19 19-19 7.5 0 13.5 4 17 10 3.5-6 9.5-10 17-10 10.5 0 19 8 19 19 0 16-13 28-36 44Z'

const icons = {
  about: (id) => (
    <Body id={id} from="#ff7aa2" to="#e3245a">
      <path d={HEART} transform="translate(13 15) scale(0.74)" fill="#000" opacity="0.18" />
      <path d={HEART} transform="translate(13 12) scale(0.74)" fill="#fff" />
    </Body>
  ),

  countdown: (id) => {
    const next = nextAnniversary()
    const month = next.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    return (
      <Body id={id} from="#ffffff" to="#ececf0">
        <text x="50" y="30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#ff3b30" fontFamily="-apple-system, Inter, sans-serif" letterSpacing="1">
          {month}
        </text>
        <text x="50" y="80" textAnchor="middle" fontSize="50" fontWeight="300" fill="#1d1d1f" fontFamily="-apple-system, Inter, sans-serif" letterSpacing="-2">
          {next.getDate()}
        </text>
      </Body>
    )
  },

  notes: (id) => (
    <Body id={id} from="#ffffff" to="#f4f4f4">
      <defs>
        <linearGradient id={`${id}-pad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe066" />
          <stop offset="1" stopColor="#ffc50f" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="27" fill={`url(#${id}-pad)`} />
      <rect x="0" y="27" width="100" height="1.5" fill="#000" opacity="0.08" />
      {[44, 58, 72, 86].map((y) => (
        <rect key={y} x="12" y={y} width="76" height="1.6" fill="#c7c7cc" />
      ))}
      <path d={HEART} transform="translate(64 34) scale(0.2)" fill="#1d6ee5" />
    </Body>
  ),

  timeline: (id) => (
    <Body id={id} from="#7d7aff" to="#3a32c8">
      <rect x="30" y="16" width="3" height="70" rx="1.5" fill="#fff" opacity="0.55" />
      {[26, 50, 74].map((y, i) => (
        <g key={y}>
          <circle cx="31.5" cy={y} r="6" fill="#fff" />
          <rect x="44" y={y - 4} width={[38, 28, 34][i]} height="8" rx="4" fill="#fff" opacity={i === 1 ? 1 : 0.7} />
        </g>
      ))}
      <path d={HEART} transform="translate(26 45.5) scale(0.11)" fill="#e3245a" />
    </Body>
  ),

  map: (id) => (
    <Body id={id} from="#e8f2df" to="#d6e8c8">
      <path d="M-5 70C20 60 35 78 60 66s30-20 50-14v60H-5Z" fill="#8fd0ff" />
      <path d="M-5 74C20 64 35 82 60 70s30-20 50-14" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" />
      <path d="M-5 30 105 46" stroke="#fff" strokeWidth="7" />
      <path d="M-5 30 105 46" stroke="#ffd34d" strokeWidth="3.5" />
      <path d="M40 -5 58 105" stroke="#fff" strokeWidth="5" />
      <path d="M64 30c0-9.4 7.6-17 17-17s17 7.6 17 17c0 12-17 28-17 28S64 42 64 30Z" transform="translate(-24 4)" fill="#ff3b30" />
      <circle cx="57" cy="34" r="6" fill="#fff" />
    </Body>
  ),

  music: (id) => (
    <Body id={id} from="#3a3a3c" to="#111113">
      <defs>
        <radialGradient id={`${id}-vinyl`}>
          <stop offset="0.3" stopColor="#2a2a2c" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="36" fill={`url(#${id}-vinyl)`} />
      {[30, 26, 22].map((r) => (
        <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="0.8" />
      ))}
      <path d="M50 14a36 36 0 0 1 30 16L50 50Z" fill="#fff" opacity="0.07" />
      <circle cx="50" cy="50" r="13" fill="#1d6ee5" />
      <path d={HEART} transform="translate(44.5 45) scale(0.11)" fill="#fff" />
      <circle cx="50" cy="50" r="1.6" fill="#111" />
    </Body>
  ),

  guestbook: (id) => (
    <Body id={id} from="#b0643a" to="#7c3a1a">
      <rect x="0" y="0" width="16" height="100" fill="#000" opacity="0.22" />
      <rect x="23" y="13" width="66" height="74" rx="6" fill="none" stroke="#f3d38a" strokeWidth="1.6" strokeDasharray="3 2.4" />
      <path d={HEART} transform="translate(39 33) scale(0.34)" fill="#f3d38a" />
      <rect x="40" y="70" width="32" height="2.4" rx="1.2" fill="#f3d38a" opacity="0.8" />
    </Body>
  ),

  message: (id) => (
    <Body id={id} from="#4fb3ff" to="#1d6ee5">
      <rect x="16" y="28" width="68" height="46" rx="5" fill="#fff" />
      <path d="M17 31 50 56 83 31" fill="none" stroke="#1d6ee5" strokeOpacity="0.35" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 72 42 50M84 72 58 50" stroke="#000" strokeOpacity="0.08" strokeWidth="2" />
    </Body>
  ),
}

/** macOS folder (folders aren't squircles — they keep the tab shape). */
function Folder({ id }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fb2f2" />
          <stop offset="1" stopColor="#3e95e0" />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd6ff" />
          <stop offset="1" stopColor="#6cbaf6" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path d="M8 24a6 6 0 0 1 6-6h22l7 7h43a6 6 0 0 1 6 6v49a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z" fill={`url(#${id}-back)`} />
        <rect x="12" y="29" width="76" height="20" rx="2" fill="#fff" opacity="0.92" />
        <path d="M8 38a5 5 0 0 1 5-5h74a5 5 0 0 1 5 5v42a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z" fill={`url(#${id}-front)`} />
        <path d="M8 38a5 5 0 0 1 5-5h74a5 5 0 0 1 5 5v1H8Z" fill="#fff" opacity="0.4" />
        <path d={HEART} transform="translate(38 46) scale(0.24)" fill="#3e95e0" opacity="0.75" />
      </g>
    </>
  )
}

export function AppIcon({ id, size = 56, className }) {
  const uid = useId().replace(/:/g, '')
  const draw = icons[id]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      {id === 'gallery' ? <Folder id={uid} /> : draw?.(uid)}
    </svg>
  )
}
