import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext, THEME_STORAGE_KEY, type Theme, type ThemeContextValue } from './themeContext'

function systemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function initialTheme(): { theme: Theme; explicit: boolean } {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return { theme: saved, explicit: true }
  } catch {
    /* private mode / blocked storage — fall through to system */
  }
  return { theme: systemTheme(), explicit: false }
}

/**
 * Theme provider — light (soft white neumorphism) / dark (soft dark
 * neumorphism). The chosen theme is applied as `data-theme` on <html>;
 * every color, shadow and material in the app resolves from CSS variables
 * that flip under `[data-theme='dark']` (see src/index.css).
 *
 * An inline script in index.html applies the stored theme before first
 * paint, so there is never a flash of the wrong theme.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [{ theme, explicit }, setState] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    // Keep the OS chrome (status bar / tab strip) in step with the surface.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#20242e' : '#eef0fb')
  }, [theme])

  // Follow the OS preference until the user chooses explicitly.
  useEffect(() => {
    if (explicit || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) =>
      setState((s) => (s.explicit ? s : { theme: e.matches ? 'dark' : 'light', explicit: false }))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [explicit])

  const setTheme = useCallback((t: Theme) => {
    setState({ theme: t, explicit: true })
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t)
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = useCallback(() => {
    setState((s) => {
      const next: Theme = s.theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      return { theme: next, explicit: true }
    })
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggle, isExplicit: explicit }),
    [theme, explicit, setTheme, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
