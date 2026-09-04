import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Material variant:
   *  - 'glass'  → frosted translucent surface (default, app-wide look);
   *  - 'strong' → more opaque glass for denser/longer content readability;
   *  - 'solid'  → near-solid surface for the highest-density content (tables etc);
   *  - 'neu'    → soft neumorphic extrusion (feature cards, lists, wells).
   */
  as?: 'glass' | 'strong' | 'solid' | 'neu'
  padded?: boolean
}

/**
 * Content card. Uses genuine frosted glass by default so surfaces across
 * the app share one material language; 'neu' switches to the soft extruded
 * neumorphic surface for feature/list cards. All materials are theme-aware
 * (light white-neumorphism / dark dark-neumorphism) via design tokens.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ as = 'glass', padded = true, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg',
        as === 'glass' && 'glass-standard glass-highlight',
        as === 'strong' && 'glass-elevated glass-highlight',
        as === 'solid' && 'bg-surface border border-line shadow-soft',
        as === 'neu' && 'neu',
        padded && 'p-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
)
Card.displayName = 'Card'
