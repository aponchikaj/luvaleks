import { crud } from './crud'

export const songsApi = crud('songs', 'id, title, artist, spotify_url, note, sort_order, created_at', {
  order: [['sort_order', { ascending: true }], ['created_at', { ascending: true }]],
})

const SPOTIFY_RE = /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/

export function parseSpotifyUrl(url) {
  const m = SPOTIFY_RE.exec(url?.trim() ?? '')
  return m ? { kind: m[1], id: m[2], url: `https://open.spotify.com/${m[1]}/${m[2]}` } : null
}

export function spotifyEmbedUrl(url) {
  const p = parseSpotifyUrl(url)
  return p ? `https://open.spotify.com/embed/${p.kind}/${p.id}?utm_source=generator` : null
}

/** Best-effort title lookup via Spotify oEmbed; returns null if blocked or failing. */
export async function spotifyTitle(url) {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
    if (!res.ok) return null
    return (await res.json()).title ?? null
  } catch {
    return null
  }
}
