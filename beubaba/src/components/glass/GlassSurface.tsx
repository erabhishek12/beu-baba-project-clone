import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type GlassLevel = 'subtle' | 'standard' | 'elevated' | 'floating' | 'modal'

const LEVEL_CLASS: Record<GlassLevel, string> = {
  subtle: 'glass-subtle',
  standard: 'glass-standard',
  elevated: 'glass-elevated',
  floating: 'glass-floating',
  modal: 'glass-modal',
}

interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  level?: GlassLevel
  /** Adds the subtle top inner-highlight edge. */
  highlight?: boolean
}

/**
 * The BEU BABA glass material primitive.
 * Glass is a MATERIAL, not decoration — choose the level by hierarchy, not looks.
 */
export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ level = 'standard', highlight = false, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(LEVEL_CLASS[level], highlight && 'glass-highlight', className)}
      {...rest}
    >
      {children}
    </div>
  ),
)
GlassSurface.displayName = 'GlassSurface'
