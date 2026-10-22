import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Loading } from '@/components/ui/States'

export function ProtectedRoute() {
  const { initialized, isAdmin } = useAuthStore()
  const location = useLocation()
  if (!initialized) return <Loading />
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ from: location }} />
  return <Outlet />
}
