import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { BootScreen } from '@/components/desktop/BootScreen'
import { Loading } from '@/components/ui/States'
import { useAuthStore } from '@/stores/authStore'
import { useUiEffects } from '@/hooks/useUiEffects'
import { APPS } from '@/apps/registry'
import { AppPage } from '@/apps/AppPage'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'

// Admin code is only downloaded by the two of us.
const Login = lazy(() => import('@/pages/admin/Login'))
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const Overview = lazy(() => import('@/pages/admin/Overview'))
const PhotosAdmin = lazy(() => import('@/pages/admin/PhotosAdmin'))
const NotesAdmin = lazy(() => import('@/pages/admin/NotesAdmin'))
const MessagesAdmin = lazy(() => import('@/pages/admin/MessagesAdmin'))
const TimelineAdmin = lazy(() => import('@/pages/admin/TimelineAdmin'))
const PlacesAdmin = lazy(() => import('@/pages/admin/PlacesAdmin'))
const SongsAdmin = lazy(() => import('@/pages/admin/SongsAdmin'))
const GuestbookAdmin = lazy(() => import('@/pages/admin/GuestbookAdmin'))
const WallpaperAdmin = lazy(() => import('@/pages/admin/WallpaperAdmin'))

function Boot() {
  const { pathname } = useLocation()
  return pathname.startsWith('/admin') ? null : <BootScreen />
}

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => {
    init()
  }, [init])
  useUiEffects()

  return (
    <BrowserRouter>
      <Boot />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            {APPS.map((app) => (
              <Route key={app.id} path={app.route.slice(1)} element={<AppPage app={app} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="admin/login" element={<Login />} />
          <Route path="admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="photos" element={<PhotosAdmin />} />
              <Route path="notes" element={<NotesAdmin />} />
              <Route path="messages" element={<MessagesAdmin />} />
              <Route path="timeline" element={<TimelineAdmin />} />
              <Route path="places" element={<PlacesAdmin />} />
              <Route path="music" element={<SongsAdmin />} />
              <Route path="guestbook" element={<GuestbookAdmin />} />
              <Route path="wallpaper" element={<WallpaperAdmin />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" toastOptions={{ className: 'font-sans' }} />
    </BrowserRouter>
  )
}
