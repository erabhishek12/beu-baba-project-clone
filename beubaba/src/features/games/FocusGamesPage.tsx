/**
 * Focus games (spec §21).
 *
 * Three short games that support studying rather than replace it:
 *   Memory Match      remember positions, grid grows with each round
 *   Quick Focus       find the target while ignoring distractions
 *   Pattern Challenge continue a number/logic sequence
 *
 * The spec asks for 1–3 minute sessions and warns they "must not become
 * distracting entertainment", so each round is short, there is no endless mode,
 * no streak pressure and no sound.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Grid3x3, Crosshair, Hash, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type Game = 'menu' | 'memory' | 'focus' | 'pattern'

const rnd = (n: number) => Math.floor(Math.random() * n)

/* ============================================================ Memory Match */
function MemoryMatch({ onExit }: { onExit: () => void }) {
  const [round, setRound] = useState(1)
  const [pattern, setPattern] = useState<number[]>([])
  const [showing, setShowing] = useState(true)
  const [picked, setPicked] = useState<number[]>([])
  const [over, setOver] = useState(false)

  // Grid and pattern both grow, so difficulty genuinely increases.
  const size = Math.min(3 + Math.floor((round - 1) / 2), 5)
  const cells = size * size
  const count = Math.min(2 + round, Math.floor(cells / 2))

  const newRound = useCallback((r: number) => {
    const s = Math.min(3 + Math.floor((r - 1) / 2), 5)
    const c = s * s
    const n = Math.min(2 + r, Math.floor(c / 2))
    const set = new Set<number>()
    while (set.size < n) set.add(rnd(c))
    setPattern([...set])
    setPicked([])
    setShowing(true)
    setOver(false)
  }, [])

  useEffect(() => {
    newRound(round)
  }, [round, newRound])

  useEffect(() => {
    if (!showing) return
    const t = setTimeout(() => setShowing(false), 900 + count * 260)
    return () => clearTimeout(t)
  }, [showing, count])

  function tap(i: number) {
    if (showing || over || picked.includes(i)) return
    const next = [...picked, i]
    setPicked(next)
    if (!pattern.includes(i)) {
      setOver(true)
      return
    }
    if (next.filter((x) => pattern.includes(x)).length === pattern.length) {
      setTimeout(() => setRound((r) => r + 1), 550)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Pill>Round {round}</Pill>
        <Pill>{count} tiles</Pill>
      </div>
      <p className="mt-2 text-body-sm text-ink-secondary">
        {showing ? 'Remember the highlighted tiles…' : over ? 'Missed one.' : 'Tap the tiles you saw.'}
      </p>
      <div
        className="mx-auto mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, maxWidth: 340 }}
      >
        {Array.from({ length: cells }).map((_, i) => {
          const lit = showing && pattern.includes(i)
          const right = !showing && picked.includes(i) && pattern.includes(i)
          const wrong = !showing && picked.includes(i) && !pattern.includes(i)
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              aria-label={`Tile ${i + 1}`}
              className={cn(
                'aspect-square rounded-xl ring-1 transition-colors',
                lit && 'bg-accent ring-accent',
                right && 'bg-success/25 ring-success',
                wrong && 'bg-danger/25 ring-danger',
                !lit && !right && !wrong && 'bg-surface-secondary ring-line',
              )}
            />
          )
        })}
      </div>
      <div className="mt-4 flex gap-2">
        {over && (
          <Button onClick={() => setRound(1)}>
            <RotateCcw className="size-4" /> Try again
          </Button>
        )}
        <Button variant="tertiary" onClick={onExit}>
          Finish
        </Button>
      </div>
    </div>
  )
}

/* ============================================================= Quick Focus */
function QuickFocus({ onExit }: { onExit: () => void }) {
  const TOTAL = 12
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  // Distractors are near-identical, so it trains attention rather than luck.
  const board = useMemo(() => {
    const base = ['b', 'd', 'p', 'q'][rnd(4)]
    const target = base
    const decoys = ['b', 'd', 'p', 'q'].filter((c) => c !== base)
    const n = 12 + i * 2
    const cells = Array.from({ length: n }, () => decoys[rnd(decoys.length)])
    cells[rnd(n)] = target
    return { target, cells }
  }, [i])

  function tap(c: string) {
    if (done) return
    if (c === board.target) setScore((s) => s + 1)
    if (i + 1 >= TOTAL) setDone(true)
    else setI((x) => x + 1)
  }

  if (done) {
    return (
      <div>
        <p className="text-h2 text-ink">
          {score} / {TOTAL}
        </p>
        <p className="mt-1 text-body-sm text-ink-secondary">Nice focus work.</p>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              setI(0)
              setScore(0)
              setDone(false)
            }}
          >
            <RotateCcw className="size-4" /> Again
          </Button>
          <Button variant="tertiary" onClick={onExit}>
            Finish
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Pill>
          {i + 1} / {TOTAL}
        </Pill>
        <Pill>Score {score}</Pill>
      </div>
      <p className="mt-2 text-body text-ink">
        Find <span className="font-bold text-accent">{board.target}</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {board.cells.map((c, k) => (
          <button
            key={k}
            onClick={() => tap(c)}
            className="size-11 rounded-xl bg-surface-secondary text-body font-bold text-ink ring-1 ring-line"
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <Button variant="tertiary" onClick={onExit}>
          Finish
        </Button>
      </div>
    </div>
  )
}

/* ======================================================= Pattern Challenge */
interface Pat {
  seq: number[]
  answer: number
  rule: string
}

function makePattern(step: number): Pat {
  const kind = step < 3 ? rnd(2) : rnd(4)
  if (kind === 0) {
    const a = rnd(9) + 1, d = rnd(8) + 2
    const seq = [a, a + d, a + 2 * d, a + 3 * d]
    return { seq, answer: a + 4 * d, rule: `add ${d} each time` }
  }
  if (kind === 1) {
    const a = rnd(4) + 2, r = rnd(2) + 2
    const seq = [a, a * r, a * r * r, a * r * r * r]
    return { seq, answer: seq[3] * r, rule: `multiply by ${r} each time` }
  }
  if (kind === 2) {
    const a = rnd(5) + 1
    const seq = [a, a + 1, a + 3, a + 6]
    return { seq, answer: a + 10, rule: 'gaps grow 1, 2, 3, 4' }
  }
  const a = rnd(4) + 1, b = rnd(4) + 2
  const seq = [a, b, a + b, a + 2 * b]
  return { seq, answer: 2 * a + 3 * b, rule: 'each term adds the two before it' }
}

function PatternGame({ onExit }: { onExit: () => void }) {
  const TOTAL = 8
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const pat = useMemo(() => makePattern(i), [i])
  const choices = useMemo(() => {
    const set = new Set<number>([pat.answer])
    while (set.size < 4) set.add(pat.answer + (rnd(2) ? 1 : -1) * (rnd(6) + 1))
    return [...set].sort(() => Math.random() - 0.5)
  }, [pat])

  function tap(v: number) {
    if (picked !== null) return
    setPicked(v)
    if (v === pat.answer) setScore((s) => s + 1)
    setTimeout(() => {
      if (i + 1 >= TOTAL) setDone(true)
      else {
        setI((x) => x + 1)
        setPicked(null)
      }
    }, 1100)
  }

  if (done) {
    return (
      <div>
        <p className="text-h2 text-ink">
          {score} / {TOTAL}
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              setI(0)
              setScore(0)
              setPicked(null)
              setDone(false)
            }}
          >
            <RotateCcw className="size-4" /> Again
          </Button>
          <Button variant="tertiary" onClick={onExit}>
            Finish
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Pill>
          {i + 1} / {TOTAL}
        </Pill>
        <Pill>Score {score}</Pill>
      </div>
      <p className="mt-3 text-h3 text-ink">{pat.seq.join('  →  ')}  →  ?</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => tap(c)}
            disabled={picked !== null}
            className={cn(
              'rounded-xl px-4 py-3 text-body ring-1',
              picked === null && 'bg-surface text-ink ring-line',
              picked !== null && c === pat.answer && 'bg-success/15 text-ink ring-success',
              picked !== null && c === picked && c !== pat.answer && 'bg-danger/15 text-ink ring-danger',
              picked !== null && c !== picked && c !== pat.answer && 'bg-surface text-ink-tertiary ring-line',
            )}
          >
            {c}
          </button>
        ))}
      </div>
      {picked !== null && (
        <p className="mt-3 text-body-sm text-ink-secondary">Rule: {pat.rule}</p>
      )}
      <div className="mt-4">
        <Button variant="tertiary" onClick={onExit}>
          Finish
        </Button>
      </div>
    </div>
  )
}

/* ==================================================================== page */
export function FocusGamesPage() {
  const navigate = useNavigate()
  const [game, setGame] = useState<Game>('menu')

  const GAMES = [
    { key: 'memory' as const, icon: Grid3x3, title: 'Memory Match', desc: 'Remember the tiles. The grid grows each round.' },
    { key: 'focus' as const, icon: Crosshair, title: 'Quick Focus', desc: 'Spot the target among look-alikes.' },
    { key: 'pattern' as const, icon: Hash, title: 'Pattern Challenge', desc: 'Continue the number sequence.' },
  ]

  return (
    <div className="page-x pb-24 pt-4">
      <button
        onClick={() => (game === 'menu' ? navigate('/tools') : setGame('menu'))}
        className="mb-2 flex items-center gap-1 text-label text-ink-secondary"
      >
        <ChevronLeft className="size-4" /> {game === 'menu' ? 'Tools' : 'Games'}
      </button>

      {game === 'menu' && (
        <>
          <h1 className="text-h1 text-ink">Focus games</h1>
          <p className="mt-1 text-body-sm text-ink-secondary">
            Short brain warm-ups, one to three minutes each. Meant for a study break, not a
            time sink.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {GAMES.map((g) => (
              <Card key={g.key} className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <g.icon className="size-4 text-accent" />
                  <span className="text-body font-semibold text-ink">{g.title}</span>
                </div>
                <p className="mt-1 text-label text-ink-secondary">{g.desc}</p>
                <div className="mt-3">
                  <Button onClick={() => setGame(g.key)}>Play</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {game !== 'menu' && (
        <Card className="mt-2 px-4 py-5">
          {game === 'memory' && <MemoryMatch onExit={() => setGame('menu')} />}
          {game === 'focus' && <QuickFocus onExit={() => setGame('menu')} />}
          {game === 'pattern' && <PatternGame onExit={() => setGame('menu')} />}
        </Card>
      )}
    </div>
  )
}
