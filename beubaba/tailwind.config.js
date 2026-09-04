/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Theme switching is token-driven (CSS variables flip under [data-theme]).
  // The class strategy is registered too so `dark:` utilities remain available
  // for the rare component that needs a structural (not color) dark tweak.
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — resolved from CSS variables (single source of truth)
        canvas: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          secondary: 'var(--color-surface-secondary)',
        },
        ink: {
          DEFAULT: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        line: 'var(--color-border)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          soft: 'var(--color-accent-soft)',
          strong: 'var(--color-accent-strong)',
          ink: 'var(--color-accent-ink)',
        },
        gold: {
          DEFAULT: 'var(--color-gold)',
          soft: 'var(--color-gold-soft)',
          ink: 'var(--color-gold-ink)',
        },
        cat: {
          blue: 'var(--cat-blue)',
          'blue-soft': 'var(--cat-blue-soft)',
          violet: 'var(--cat-violet)',
          'violet-soft': 'var(--cat-violet-soft)',
          teal: 'var(--cat-teal)',
          'teal-soft': 'var(--cat-teal-soft)',
          coral: 'var(--cat-coral)',
          'coral-soft': 'var(--cat-coral-soft)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          soft: 'var(--color-warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          soft: 'var(--color-danger-soft)',
        },
        // Interactive chip wells (header buttons, hover surfaces)
        chip: {
          DEFAULT: 'var(--chip-bg)',
          strong: 'var(--chip-bg-strong)',
        },
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '28px',
        pill: '999px',
      },
      spacing: {
        // 4-based scale from the spec (extends default; explicit for clarity)
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
      },
      maxWidth: {
        // Desktop content widths — the app is no longer a phone column only.
        shell: '72rem',
        'shell-lg': '80rem',
      },
      boxShadow: {
        'glass-sm': 'var(--glass-shadow-sm)',
        'glass-md': 'var(--glass-shadow-md)',
        'glass-lg': 'var(--glass-shadow-lg)',
        soft: '0 1px 2px rgba(24,32,43,0.04), 0 4px 12px rgba(40,60,90,0.05)',
        pop: '0 12px 32px rgba(40,60,90,0.14)',
        // Neumorphic extrusion / press levels (theme-aware via tokens)
        'neu-sm': 'var(--neu-sm)',
        neu: 'var(--neu-md)',
        'neu-lg': 'var(--neu-lg)',
        'neu-inset-sm': 'var(--neu-inset-sm)',
        'neu-inset': 'var(--neu-inset)',
      },
      backdropBlur: {
        sm: '12px',
        md: '20px',
        lg: '28px',
        xl: '36px',
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        display: [
          '"Unbounded"',
          '"Baloo 2 Var"',
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        heading: [
          '"Sora"',
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif',
        ],
        script: [
          '"Caveat"',
          '"Plus Jakarta Sans"',
          'cursive',
        ],
        hindi: [
          '"Noto Sans Devanagari Var"',
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif',
        ],
        num: [
          '"Plus Jakarta Sans"',
          'ui-rounded',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      fontSize: {
        // Typography hierarchy (size / line-height / tracking)
        display: ['34px', { lineHeight: '40px', letterSpacing: '-0.03em', fontWeight: '800' }],
        h1: ['28px', { lineHeight: '34px', letterSpacing: '-0.025em', fontWeight: '800' }],
        h2: ['22px', { lineHeight: '28px', letterSpacing: '-0.02em', fontWeight: '700' }],
        h3: ['18px', { lineHeight: '24px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'body-lg': ['17px', { lineHeight: '26px', fontWeight: '500' }],
        body: ['15px', { lineHeight: '23px', fontWeight: '450' }],
        'body-sm': ['13px', { lineHeight: '20px', fontWeight: '450' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        label: ['13px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '700' }],
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.32, 0.72, 0, 1)',
        emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      zIndex: {
        nav: '40',
        header: '30',
        sheet: '60',
        modal: '70',
        toast: '80',
      },
      keyframes: {
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        skeleton: 'skeleton-shimmer 1.6s ease-in-out infinite',
        'fade-in': 'fade-in 200ms ease-out',
      },
    },
  },
  plugins: [],
}
