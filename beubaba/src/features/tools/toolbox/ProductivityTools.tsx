import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ToolShell, Field } from './ToolShell'
import { cn } from '@/lib/cn'

// ---- Pomodoro study timer ------------------------------------------------
type Phase = 'focus' | 'break'

export function PomodoroTool() {
  const [focusMin, setFocusMin] = useState(25)
  const [breakMin, setBreakMin] = useState(5)
  const [phase, setPhase] = useState<Phase>('focus')
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = (phase === 'focus' ? focusMin : breakMin) * 60

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // switch phase
          const nextPhase: Phase = phase === 'focus' ? 'break' : 'focus'
          if (phase === 'focus') setCycles((c) => c + 1)
          setPhase(nextPhase)
          return (nextPhase === 'focus' ? focusMin : breakMin) * 60
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, phase, focusMin, breakMin])

  function reset() {
    setRunning(false)
    setPhase('focus')
    setSecondsLeft(focusMin * 60)
    setCycles(0)
  }

  // keep timer in sync when durations change while stopped
  useEffect(() => {
    if (!running) setSecondsLeft((phase === 'focus' ? focusMin : breakMin) * 60)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMin, breakMin])

  const mm = Math.floor(secondsLeft / 60)
  const ss = secondsLeft % 60
  const progress = total > 0 ? ((total - secondsLeft) / total) * 100 : 0
  const r = 54
  const c = 2 * Math.PI * r
  const offset = c - (progress / 100) * c

  return (
    <ToolShell
      title="Study Timer"
      subtitle="Pomodoro focus cycles to stay productive."
      note="Classic Pomodoro: focus, then a short break, repeat. Adjust the durations, then press start."
    >
      <Card as="strong" className="glass-sheen flex flex-col items-center py-7">
        <span
          className={cn(
            'rounded-pill px-3 py-1 text-caption font-semibold uppercase tracking-wide',
            phase === 'focus' ? 'bg-accent-soft text-accent' : 'bg-success-soft text-success',
          )}
        >
          {phase === 'focus' ? 'Focus' : 'Break'}
        </span>
        <div className="relative mt-4 size-40">
          <svg viewBox="0 0 120 120" className="size-40 -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-surface-secondary)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={phase === 'focus' ? 'var(--color-accent)' : 'var(--color-success)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[2.75rem] font-bold tabular-nums text-ink">
              {mm}:{ss.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <p className="mt-2 text-body-sm text-ink-secondary">Completed focus sessions: {cycles}</p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-body font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            {running ? <Pause className="size-5" /> : <Play className="size-5" />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl border border-line/70 bg-surface px-4 py-3 text-body font-semibold text-ink-secondary"
          >
            <RotateCcw className="size-5" />
          </button>
        </div>
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Focus (min)" value={String(focusMin)} onChange={(v) => setFocusMin(Math.max(1, Number(v) || 0))} inputMode="numeric" />
        <Field label="Break (min)" value={String(breakMin)} onChange={(v) => setBreakMin(Math.max(1, Number(v) || 0))} inputMode="numeric" />
      </div>
    </ToolShell>
  )
}

// ---- Exam countdown ------------------------------------------------------
export function ExamCountdownTool() {
  const [label, setLabel] = useState('')
  const [date, setDate] = useState('')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const remaining = useMemo(() => {
    if (!date) return null
    const target = new Date(date + 'T00:00:00').getTime()
    const diff = target - now
    if (diff <= 0) return { done: true, d: 0, h: 0, m: 0, s: 0 }
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { done: false, d, h, m, s }
  }, [date, now])

  return (
    <ToolShell title="Exam Countdown" subtitle="Track the time left to your next exam.">
      <div className="space-y-3">
        <Field label="Exam name" value={label} onChange={setLabel} placeholder="End-sem: Data Structures" />
        <Field label="Exam date" value={date} onChange={setDate} type="date" />
      </div>

      {remaining && (
        <Card as="strong" className="glass-sheen mt-4 text-center">
          {label && <p className="text-body-sm font-semibold text-ink">{label}</p>}
          {remaining.done ? (
            <p className="mt-2 text-h2 font-bold text-success">It's exam day — good luck!</p>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                ['Days', remaining.d],
                ['Hrs', remaining.h],
                ['Min', remaining.m],
                ['Sec', remaining.s],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-surface-secondary/70 py-3">
                  <p className="text-h2 font-bold tabular-nums text-accent">{v}</p>
                  <p className="text-caption text-ink-tertiary">{l}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </ToolShell>
  )
}
