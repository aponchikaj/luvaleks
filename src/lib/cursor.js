// Cursor sets as SVG data URIs: macOS arrow + hand, or pixel hearts (1px outline + colored fill).
const ROWS = [
  [2, 4, 8, 10], [1, 5, 7, 11], [0, 12], [0, 12], [0, 12],
  [1, 11], [2, 10], [3, 9], [4, 8], [5, 7], [6, 6],
] // pairs of [from, to] x-ranges per row

function heartSvg(fill) {
  const px = new Set()
  ROWS.forEach((r, y) => {
    for (let i = 0; i < r.length; i += 2) for (let x = r[i]; x <= r[i + 1]; x++) px.add(`${x + 1},${y + 1}`)
  })
  const outline = new Set()
  for (const p of px) {
    const [x, y] = p.split(',').map(Number)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${x + dx},${y + dy}`
      if (!px.has(k)) outline.add(k)
    }
  }
  const rect = (k, c) => {
    const [x, y] = k.split(',')
    return `<rect x='${x}' y='${y}' width='1' height='1' fill='${c}'/>`
  }
  const body = [...outline].map((k) => rect(k, '#0a0a0a')).join('') + [...px].map((k) => rect(k, fill)).join('')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='26' viewBox='0 0 15 13' shape-rendering='crispEdges'>${body}</svg>`
  return toUrl(svg)
}

const toUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

const SHADOW =
  "<filter id='s' x='-30%' y='-30%' width='160%' height='160%'><feDropShadow dx='0' dy='1' stdDeviation='0.9' flood-opacity='0.4'/></filter>"

// Black arrow with a white keyline, like the macOS system pointer.
const MAC_ARROW = toUrl(
  `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='34' viewBox='0 0 26 34'>${SHADOW}<path filter='url(#s)' d='M3 2v24.5l6-5.6 3.9 9 4.3-1.9-3.8-8.8H22Z' fill='#000' stroke='#fff' stroke-width='1.6' stroke-linejoin='round'/></svg>`,
)

// White pointing hand with a black outline.
const MAC_HAND = toUrl(
  `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='34' viewBox='0 0 32 34'>${SHADOW}<g filter='url(#s)' stroke='#000' stroke-width='1.3' stroke-linejoin='round' stroke-linecap='round'><path fill='#fff' d='M11 4.5a2 2 0 0 1 4 0V13h.5v-1.5a2 2 0 0 1 4 0v2h.3v-1a2 2 0 0 1 4 0v2h.2a2 2 0 0 1 4 0V22c0 4.5-3 8-7.5 8H16c-3 0-4.8-1.4-6.4-3.8L5.4 19.6a2 2 0 0 1 3.1-2.5L11 19.6Z'/><path fill='none' d='M15.5 13v4.5M19.8 13.5v4M24 14.5v3.5'/></g></svg>`,
)

/** kind: 'mac' | 'heart' */
export function installCursors(kind) {
  const root = document.documentElement.style
  if (kind === 'heart') {
    root.setProperty('--cursor-arrow', `${heartSvg('#ffffff')} 15 12`)
    root.setProperty('--cursor-pointer', `${heartSvg('#1d6ee5')} 15 12`)
  } else {
    root.setProperty('--cursor-arrow', `${MAC_ARROW} 3 2`)
    root.setProperty('--cursor-pointer', `${MAC_HAND} 12 3`)
  }
  document.documentElement.dataset.cursor = kind
}
