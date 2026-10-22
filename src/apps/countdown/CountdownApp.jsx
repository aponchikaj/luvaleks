import { useCountdown } from '@/hooks/useCountdown'
import { isAnniversaryToday, monthsTogether, nextAnniversary } from '@/lib/anniversary'
import { Glyph } from '@/components/icons/Symbol'

const pad = (n) => String(n).padStart(2, '0')

export default function CountdownApp() {
  const c = useCountdown()
  if (isAnniversaryToday()) {
    return (
      <p className="font-serif text-4xl text-clicky">
        Happy {monthsTogether()}-month anniversary <Glyph name="heart" size={28} className="inline align-[-2px]" />
      </p>
    )
  }
  const units = [
    [c.days, 'days'],
    [pad(c.hours), 'hours'],
    [pad(c.minutes), 'min'],
    [pad(c.seconds), 'sec'],
  ]
  return (
    <div>
      <p className="text-[13px] text-chrome-dark">
        Month {c.upcomingMonth} ·{' '}
        {nextAnniversary().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
      </p>
      <div className="mt-1 flex gap-4">
        {units.map(([v, label]) => (
          <div key={label}>
            <p className="text-[34px] leading-none font-semibold tracking-tight tabular-nums">{v}</p>
            <p className="mt-1 text-[11px] text-chrome-dark">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
