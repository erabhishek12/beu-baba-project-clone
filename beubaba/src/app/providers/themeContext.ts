import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'beubaba:theme'

export interface ThemeContextValue {
  theme: Theme
  /** Explicit user choice (persisted). */
  setTheme: (t: Theme) => void
  toggle: () => void
  /** True once the user has chosen explicitly; until then we follow the OS. */
  isExplicit: boolean
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
