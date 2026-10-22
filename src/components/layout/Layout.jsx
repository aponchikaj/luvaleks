import { Outlet, useLocation } from 'react-router-dom'
import { useMediaQuery, WIDE } from '@/hooks/useMediaQuery'
import { Wallpaper } from '@/components/desktop/Wallpaper'
import { MenuBar, StatusBar } from './MenuBar'

/** macOS shell on tablets/computers, iPhone shell on phones. */
export function Layout() {
  const { pathname } = useLocation()
  const wide = useMediaQuery(WIDE)
  const home = pathname === '/'

  if (!wide) {
    // Phone apps draw their own iOS chrome (see AppPage).
    if (!home) return <Outlet />
    return (
      <div className="flex min-h-dvh flex-col">
        <Wallpaper />
        <StatusBar />
        <Outlet />
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Wallpaper />
      <MenuBar />
      {home ? (
        <Outlet />
      ) : (
        <main className="min-h-0 flex-1 overflow-auto p-6 lg:p-10">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      )}
    </div>
  )
}
