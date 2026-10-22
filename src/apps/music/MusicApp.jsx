import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { useSongsStore } from '@/stores/collections'
import { useRealtime } from '@/hooks/useRealtime'
import { spotifyEmbedUrl } from '@/services/songs'

/** "Our songs" — a playlist window with a Spotify embed for the selected track. */
export default function MusicApp() {
  const { items, loading, error, fetch, applyChange } = useSongsStore()
  const [currentId, setCurrentId] = useState(null)

  useEffect(() => {
    fetch()
  }, [fetch])
  useRealtime('songs', applyChange)

  if (loading && !items.length) return <Loading />
  if (error) return <ErrorState error={error} onRetry={() => fetch({ force: true })} />
  if (!items.length) return <Empty>No songs yet.</Empty>

  const current = items.find((s) => s.id === currentId) ?? items[0]
  const embed = spotifyEmbedUrl(current.spotify_url)

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-md border border-black/10 bg-ink p-3 text-white">
        <p className="text-[10px] tracking-widest text-clicky-200 uppercase">now playing</p>
        <p className="truncate font-serif text-2xl">{current.title}</p>
        {current.artist && <p className="truncate text-xs text-white/70">{current.artist}</p>}
        {current.note && <p className="mt-1 font-serif text-sm text-clicky-200 italic">“{current.note}”</p>}
      </div>
      {embed && (
        <iframe
          key={embed}
          title={`Spotify: ${current.title}`}
          src={embed}
          className="h-[152px] w-full shrink-0 rounded-xl border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
      <ol className="min-h-0 flex-1 divide-y divide-chrome overflow-auto rounded-md border border-black/10">
        {items.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => setCurrentId(s.id)}
              className={clsx(
                'flex w-full items-center gap-3 px-3 py-2 text-left text-xs',
                s.id === current.id ? 'bg-clicky text-white' : 'hover:bg-clicky-100',
              )}
            >
              <span className="w-5 tabular-nums opacity-60">{s.id === current.id ? '▶' : i + 1}</span>
              <span className="flex-1 truncate">{s.title}</span>
              <span className="truncate opacity-70">{s.artist}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
