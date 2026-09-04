import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/app/providers/themeContext'
import { cn } from '@/lib/cn'

/**
 * Light / dark theme switch. Soft neumorphic pill button with a cross-fading
 * Sun / Moon glyph (Lucide — never emoji). Fully keyboard accessible.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'press-tile neu-sm neu-press relative flex size-10 items-center justify-center rounded-full text-ink-secondary hover:text-ink',
        className,
      )}
    >
      <Sun
        className={cn(
          'absolute size-[18px] transition-all duration-200',
          dark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          'absolute size-[18px] transition-all duration-200',
          dark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0',
        )}
        aria-hidden
      />
    </button>
  )
}
