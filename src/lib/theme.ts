export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'cubby-theme'

export function getStoredTheme(): Theme {
  const t = localStorage.getItem(STORAGE_KEY)
  if (t === 'light' || t === 'dark' || t === 'system') return t
  return 'system'
}

export function setStoredTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

export function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

export function initTheme() {
  applyTheme(getStoredTheme())
  // React to system change when in system mode
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    if (getStoredTheme() === 'system') applyTheme('system')
  })
}
