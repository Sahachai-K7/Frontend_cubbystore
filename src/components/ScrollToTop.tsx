import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll to top of viewport on every pathname change.
 * Mount inside any layout that wraps routes with `<Outlet />`.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
