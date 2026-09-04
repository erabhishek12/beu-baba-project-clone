import { Home, BookOpen, ListChecks, Wrench, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

/**
 * Primary destinations — shared by the desktop header nav and the mobile
 * bottom nav so the two never drift apart (single source of truth).
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/study', label: 'Study', icon: BookOpen },
  { to: '/quiz', label: 'Quiz', icon: ListChecks },
  { to: '/tools', label: 'Tools', icon: Wrench },
  { to: '/profile', label: 'Profile', icon: User },
]

export function isNavActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(to + '/')
}
