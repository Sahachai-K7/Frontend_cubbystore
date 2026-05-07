export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * Build a renderable image src.
 * - Already an absolute URL (http/https) → use as-is.
 * - Legacy relative path (`/uploads/...`) → prepend the API origin so old
 *   product rows that haven't been migrated yet still display.
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${API_BASE_URL}${url}`
}
