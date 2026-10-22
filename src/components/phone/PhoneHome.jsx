import { Link } from 'react-router-dom'
import { APPS, APPS_BY_ID } from '@/apps/registry'
import { AppIcon } from '@/components/icons/AppIcon'
import { Glyph } from '@/components/icons/Symbol'
import { useCountdown } from '@/hooks/useCountdown'
import { daysTogether, isAnniversaryToday, monthsTogether, nextAnniversary } from '@/lib/anniversary'
import { play } from '@/lib/sound'

const DOCK = ['gallery', 'music', 'notes', 'message']

/** iOS-style widget: the next monthiversary, front and center. */
function AnniversaryWidget() {
  const c = useCountdown()
  const today = isAnniversaryToday()
  const date = nextAnniversary().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })

  return (
    <Link
      to="/countdown"
      className="block rounded-[24px] border border-white/25 bg-white/20 p-4 text-white shadow-[0_8px_30px_-10px_rgb(0_0_0/0.4)] backdrop-blur-2xl backdrop-saturate-150 transition active:scale-[0.98]"
    >
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white/85">
        <Glyph name="heart" size={13} className="text-[#ff6b95]" />
        {today ? 'Today' : 'Next anniversary'}
      </p>
      {today ? (
        <p className="mt-1 font-serif text-[40px] leading-none">Happy {monthsTogether()} months</p>
      ) : (
        <>
          <p className="mt-1 text-[44px] leading-none font-semibold tracking-tight tabular-nums">
            {c.days}
            <span className="ml-1 text-[22px] font-medium text-white/80">{c.days === 1 ? 'day' : 'days'}</span>
          </p>
          <p className="mt-1.5 text-[15px] text-white/80">
            Month {c.upcomingMonth} · {date}
          </p>
        </>
      )}
      <p className="mt-3 border-t border-white/20 pt-2 text-[13px] text-white/70">
        {daysTogether()} days together
      </p>
    </Link>
  )
}

function HomeIcon({ app, label = true }) {
  return (
    <Link
      to={app.route}
      onClick={() => play('open')}
      aria-label={app.label}
      className="flex flex-col items-center gap-1 transition active:scale-90 active:brightness-75"
    >
      <AppIcon id={app.id} size={label ? 70 : 66} />
      {label && (
        <span className="-mt-1 max-w-full truncate text-[12px] text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.45)]">
          {app.label}
        </span>
      )}
    </Link>
  )
}

/** iPhone home screen: widget, icon grid, frosted dock. */
export function PhoneHome() {
  return (
    <div className="flex flex-1 flex-col px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+10px)]">
      <AnniversaryWidget />
      <div className="mt-6 grid grid-cols-4 gap-x-2 gap-y-4">
        {APPS.filter((a) => !DOCK.includes(a.id)).map((app) => (
          <HomeIcon key={app.id} app={app} />
        ))}
      </div>
      <div className="flex-1" />
      <div className="my-3 flex justify-center gap-2" aria-hidden="true">
        <span className="size-[7px] rounded-full bg-white" />
        <span className="size-[7px] rounded-full bg-white/40" />
      </div>
      <nav
        aria-label="Dock"
        className="grid grid-cols-4 rounded-[32px] border border-white/25 bg-white/20 px-2 py-2 backdrop-blur-2xl backdrop-saturate-150"
      >
        {DOCK.map((id) => (
          <HomeIcon key={id} app={APPS_BY_ID[id]} label={false} />
        ))}
      </nav>
    </div>
  )
}
