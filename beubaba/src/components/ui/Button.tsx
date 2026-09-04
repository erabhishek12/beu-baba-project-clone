import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'soft'
type Size = 'sm' | 'md' | 'lg'

// Omit DOM drag/animation handlers that collide with framer-motion's own props.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'ref'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDrop'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>

interface ButtonProps extends NativeButtonProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-accent text-white shadow-soft hover:bg-accent-strong active:bg-accent-strong disabled:bg-accent/50',
  secondary:
    'glass-standard text-ink hover:bg-chip-strong active:bg-chip-strong disabled:opacity-60',
  tertiary:
    'bg-transparent text-accent hover:bg-accent-soft active:bg-accent-soft disabled:opacity-50',
  danger:
    'bg-danger text-white shadow-soft hover:brightness-95 active:brightness-90 disabled:opacity-50',
  // Soft neumorphic: extruded pill that presses into its well.
  soft: 'neu-sm text-ink shadow-neu-sm hover:shadow-neu active:shadow-neu-inset-sm active:scale-[0.985] disabled:opacity-60',
}

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-body-sm rounded-sm gap-1.5',
  md: 'h-11 px-4 text-body rounded-md gap-2',
  lg: 'h-[52px] px-5 text-body-lg rounded-lg gap-2',
}

/** Tactile primary control. Press = subtle scale compression, no bounce/glow. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      iconLeft,
      iconRight,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.12, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        'inline-flex items-center justify-center font-semibold select-none',
        'transition-colors duration-fast disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Loader2 className="size-[1.15em] animate-spin" aria-hidden />
      ) : (
        iconLeft
      )}
      {children}
      {!loading && iconRight}
    </motion.button>
  ),
)
Button.displayName = 'Button'
