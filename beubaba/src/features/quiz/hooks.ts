import { useAuth } from '@/app/providers/AuthProvider'

/** The current user's stable id (owner key for attempts/results). */
export function useUserId(): string {
  const { user } = useAuth()
  return user?.auth.id ?? 'anonymous'
}

export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export function difficultyTone(d: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (d === 'easy') return 'success'
  if (d === 'medium') return 'warning'
  if (d === 'hard') return 'danger'
  return 'neutral'
}
