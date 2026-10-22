import { SITE } from '@/config/site'
import { daysTogether, monthsTogether } from '@/lib/anniversary'

export default function AboutApp() {
  return (
    <div>
      <p className="text-sm text-chrome-dark">hello, my name is</p>
      <h1 className="font-serif text-5xl leading-none sm:text-6xl">
        Lazare <span className="text-clicky italic">&</span> Aleksa
      </h1>
      <p className="mt-3 text-sm">
        together since {new Date(`${SITE.startDate}T00:00`).toLocaleDateString()} · {monthsTogether()} months ·{' '}
        {daysTogether()} days
      </p>
    </div>
  )
}
