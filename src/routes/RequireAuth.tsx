import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/lib/auth-client'

export function RequireAuth({ adminOnly = false }: { adminOnly?: boolean }) {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
        กำลังโหลด…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const role = (session.user as { role?: string } | undefined)?.role
  if (adminOnly && role !== 'admin') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="mt-2 text-muted-foreground">
          หน้าจัดการนี้เปิดให้แอดมินเท่านั้น
        </p>
      </div>
    )
  }

  return <Outlet />
}
