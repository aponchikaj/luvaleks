import { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Window } from '@/components/ui/Window'
import { Loading } from '@/components/ui/States'
import { Glyph } from '@/components/icons/Symbol'
import { StatusBar } from '@/components/layout/MenuBar'
import { useMediaQuery, WIDE } from '@/hooks/useMediaQuery'

/**
 * Route version of an app (direct links, and every app on phones).
 * Wide screens: a static macOS window. Phones: an iOS screen with a back button.
 */
export function AppPage({ app }) {
  const navigate = useNavigate()
  const wide = useMediaQuery(WIDE)
  const Component = app.component
  const fullBleed = app.bodyClassName === 'p-0' // map + notes board run edge to edge

  const content = (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  )

  if (wide) {
    return (
      <Window title={app.title} bodyClassName={app.bodyClassName} onClose={() => navigate('/')}>
        {content}
      </Window>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#f2f2f7]">
      <header className="sticky top-0 z-[600] border-b border-black/10 bg-[#f9f9f9]/85 backdrop-blur-xl backdrop-saturate-150">
        <StatusBar tone="dark" />
        <div className="relative flex h-11 items-center px-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-0.5 rounded-md py-1 pr-2 text-[17px] text-clicky active:opacity-50"
          >
            <Glyph name="chevron.left" size={22} />
            Home
          </button>
          <h1 className="pointer-events-none absolute inset-x-24 truncate text-center text-[17px] font-semibold">
            {app.label}
          </h1>
        </div>
      </header>
      <main className={clsx('flex-1', fullBleed ? '' : 'px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+24px)]')}>
        {fullBleed ? content : <div className="rounded-[14px] bg-white p-4 shadow-card">{content}</div>}
      </main>
    </div>
  )
}
