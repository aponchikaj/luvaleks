import clsx from 'clsx'

const colors = {
  blue: 'bg-note-blue',
  sky: 'bg-note-sky',
  yellow: 'bg-note-yellow',
  pink: 'bg-note-pink',
  mint: 'bg-note-mint',
  white: 'bg-note-white',
}

export function StickyNote({ note, className, children, ...props }) {
  return (
    <article
      className={clsx(
        'w-48 rounded-[3px] p-3 shadow-[0_1px_2px_rgb(0_0_0/0.12),0_10px_24px_-10px_rgb(0_0_0/0.35)]',
        colors[note.color] ?? colors.blue,
        className,
      )}
      {...props}
    >
      {note.recipient?.display_name && (
        <p className="mb-1 text-[11px] font-medium text-black/50">To {note.recipient.display_name}</p>
      )}
      <p className="whitespace-pre-wrap break-words font-serif text-lg leading-snug">{note.content}</p>
      <p className="mt-2 text-[10px] text-ink/60">
        — {note.author?.display_name ?? 'us'} · {new Date(note.created_at).toLocaleDateString()}
      </p>
      {children}
    </article>
  )
}
