import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'

/**
 * When the backend says 401, the user's session expired or never existed for
 * this me-scoped query. Drop better-auth's cached session so menus/banners
 * reflect logged-out state, and bounce the user to /login only if they're on
 * a page that requires auth — public pages stay put even if a background
 * query happens to be 401.
 */
function handle401(err: unknown) {
  if (!(err instanceof ApiError) || err.status !== 401) return

  void queryClient.invalidateQueries({
    predicate: (q) => {
      const k = q.queryKey[0]
      return typeof k === 'string' && k.toLowerCase().includes('session')
    },
  })

  if (typeof window === 'undefined') return
  const path = window.location.pathname
  const protectedPrefix =
    /^\/(cart|orders|wallet|profile|wishlist|admin)(\/|$)/
  if (protectedPrefix.test(path)) {
    const next = encodeURIComponent(path + window.location.search)
    window.location.replace(`/login?next=${next}`)
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handle401 }),
  mutationCache: new MutationCache({ onError: handle401 }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, err) => {
        if (err instanceof ApiError && err.status === 401) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})
