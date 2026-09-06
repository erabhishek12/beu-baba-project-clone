import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Target,
  Clock,
  RotateCcw,
  ListChecks,
  Download,
  Share2,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useUserId, formatClock } from '@/features/quiz/hooks'
import { quizService } from '@/services/quizService'
import type { QuizResult } from '@/types/domain'
import { stampBrand, SITE_LABEL } from '@/lib/brand'
import { revisionService } from '@/services/revisionService'
import { isBankQuizId } from '@/services/quiz/supabaseQuizAdapter'

export function ResultPage() {
  const { quizId = '', attemptId = '' } = useParams()
  const navigate = useNavigate()
  const userId = useUserId()

  const { data: result, isLoading } = useQuery({
    queryKey: ['result', userId, attemptId],
    queryFn: () => quizService.getResult(userId, attemptId),
  })

  // Spec §20: wrong answers feed the Revision Center automatically, and
  // per-topic accuracy updates the weak-topic list. Runs once per attempt;
  // failures are silent because a result page must still render offline.
  const syncedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!result || !attemptId) return
    if (!isBankQuizId(quizId)) return          // legacy quizzes use their own path
    if (syncedRef.current === attemptId) return
    syncedRef.current = attemptId
    void revisionService.syncFromAttempt(attemptId).catch(() => undefined)
  }, [result, attemptId, quizId])


  if (isLoading) {
    return (
      <div className="page-x pb-8 pt-6">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="mt-3 h-28 rounded-2xl" />
      </div>
    )
  }
  if (!result) {
    return (
      <div className="page-x pb-8 pt-6">
        <Card className="py-10 text-center">
          <p className="text-body font-semibold text-ink">Result not found</p>
          <button onClick={() => navigate('/quiz')} className="mt-4 text-body-sm font-semibold text-accent">
            Back to quizzes
          </button>
        </Card>
      </div>
    )
  }

  const weak = result.topics.filter((t) => t.answered >= 1 && t.accuracy < 60).slice(0, 3)

  return (
    <div className="page-x pb-10 pt-6">
      {/* Score hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card as="strong" className="glass-sheen flex flex-col items-center py-7 text-center">
          <ScoreRing percentage={result.percentage} />
          <p className="mt-4 text-h1 text-ink">
            {result.marks_obtained} / {result.max_marks}
          </p>
          <p className="mt-1 text-body-sm text-ink-secondary">{result.quiz_title}</p>
          <div className="mt-3">
            <Pill tone={result.passed ? 'success' : 'warning'}>
              {result.percentage >= 80
                ? 'Excellent'
                : result.percentage >= 60
                  ? 'Good attempt'
                  : result.percentage >= 40
                    ? 'Keep practising'
                    : 'Needs revision'}
            </Pill>
          </div>
        </Card>
      </motion.div>

      {/* Stat grid */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <StatTile icon={<CheckCircle2 className="size-4 text-success" />} label="Correct" value={String(result.correct)} />
        <StatTile icon={<XCircle className="size-4 text-danger" />} label="Incorrect" value={String(result.incorrect)} />
        <StatTile icon={<MinusCircle className="size-4 text-ink-tertiary" />} label="Unanswered" value={String(result.unanswered)} />
        <StatTile icon={<Target className="size-4 text-accent" />} label="Accuracy" value={`${result.accuracy}%`} />
      </div>

      <Card className="mt-2.5 flex items-center justify-center gap-2 py-3">
        <Clock className="size-4 text-ink-tertiary" aria-hidden />
        <span className="text-body-sm text-ink-secondary">
          Time used: <span className="font-semibold text-ink">{formatClock(result.time_used_sec)}</span>
        </span>
      </Card>

      {/* Weak topics */}
      {weak.length > 0 && (
        <Card className="mt-3">
          <p className="text-body-sm font-semibold text-ink">Topics to revise</p>
          <div className="mt-2.5 space-y-2.5">
            {weak.map((t) => (
              <div key={t.topic}>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-ink-secondary">{t.topic}</span>
                  <span className="font-semibold text-ink">{t.accuracy}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className="h-full rounded-full bg-danger"
                    style={{ width: `${Math.max(6, t.accuracy)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-4 space-y-2.5">
        <button
          onClick={() => navigate(`/quiz/${quizId}/review/${attemptId}`)}
          className="flex w-full items-center justify-between rounded-xl bg-accent px-4 py-3.5 text-body font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          <span className="flex items-center gap-2">
            <ListChecks className="size-5" aria-hidden />
            Review answers & explanations
          </span>
          <ChevronRight className="size-5" aria-hidden />
        </button>
        <div className="flex gap-2.5">
          <button
            onClick={() => void downloadCard(result)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line/70 bg-surface-secondary/60 py-3 text-body-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-secondary"
          >
            <Download className="size-4" aria-hidden />
            Result card
          </button>
          <button
            onClick={() => printResult(result)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line/70 bg-surface-secondary/60 py-3 text-body-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-secondary"
          >
            <FileText className="size-4" aria-hidden />
            PDF
          </button>
          <button
            onClick={() => shareResult(result)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line/70 bg-surface-secondary/60 py-3 text-body-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-secondary"
          >
            <Share2 className="size-4" aria-hidden />
            Share
          </button>
          <button
            onClick={() => navigate(`/quiz/${quizId}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line/70 bg-surface-secondary/60 py-3 text-body-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-secondary"
          >
            <RotateCcw className="size-4" aria-hidden />
            Retry quiz
          </button>
        </div>
        <button
          onClick={() => navigate('/quiz')}
          className="w-full py-2 text-body-sm font-semibold text-ink-tertiary"
        >
          Back to all quizzes
        </button>
      </div>
    </div>
  )
}

function ScoreRing({ percentage }: { percentage: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, percentage))
  const offset = c - (clamped / 100) * c
  const color =
    clamped >= 60 ? 'var(--color-success)' : clamped >= 40 ? 'var(--color-gold)' : 'var(--color-danger)'
  return (
    <div className="relative size-32">
      <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-surface-secondary)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-h1 font-bold text-ink">{clamped}%</span>
        <span className="text-caption text-ink-tertiary">Score</span>
      </div>
    </div>
  )
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3 py-3">
      <span>{icon}</span>
      <div>
        <p className="text-h3 leading-none text-ink">{value}</p>
        <p className="mt-1 text-caption text-ink-tertiary">{label}</p>
      </div>
    </Card>
  )
}


/** Share the outcome (no private data — §33): Web Share with clipboard fallback. */
async function shareResult(result: QuizResult) {
  // Always include the site link so a shared result can bring people back.
  const text = `I scored ${result.percentage}% on ${result.quiz_title ?? 'a BEU BABA quiz'} — ${result.correct}/${result.total} correct. Try it on BEU BABA — ${SITE_LABEL}`
  try {
    if (navigator.share) {
      await navigator.share({ title: 'BEU BABA result', text, url: `https://${SITE_LABEL}` })
      return
    }
  } catch {
    /* user cancelled — fall through */
  }
  await navigator.clipboard?.writeText(text)
}


/** Clean print view (save-as-PDF) — no private data beyond the score summary. */
function printResult(result: QuizResult) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>BEU BABA result</title>
<style>body{font-family:system-ui,sans-serif;padding:40px;color:#14103c}h1{margin:0 0 4px}
.meta{color:#6b6787}.grid{display:flex;gap:12px;margin:18px 0;flex-wrap:wrap}.box{border:1px solid #d9d6ee;border-radius:12px;padding:10px 14px}
ul{line-height:1.7}</style></head><body>
<h1>${result.quiz_title ?? 'Quiz result'}</h1>
<p class="meta">BEU BABA · ${new Date(result.submitted_at ?? Date.now()).toLocaleString('en-IN')}</p>
<div class="grid">
<div class="box"><b>${result.percentage}%</b> score</div>
<div class="box"><b>${result.correct}/${result.total}</b> correct</div>
<div class="box"><b>${result.accuracy}%</b> accuracy</div>
</div>
${result.topics?.length ? `<h3>Topic performance</h3><ul>${result.topics.map((t) => `<li>${t.topic}: ${t.accuracy}% (${t.answered} answered)</li>`).join('')}</ul>` : ''}
<p class="meta">Generated by BEU BABA — your campus companion.</p>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
</body></html>`
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
    return
  }
  const blob = new Blob([html], { type: 'text/html' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'beubaba-result.html'
  a.click()
}

/** Generate a shareable result card as a PNG via canvas (no private data; §33). */
async function downloadCard(result: QuizResult) {
  const w = 1080
  const h = 1350
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // background gradient
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#f5f6fc')
  g.addColorStop(1, '#e4e9f5')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // card
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  roundRect(ctx, 80, 150, w - 160, h - 300, 48)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#4560b0'
  ctx.font = 'bold 46px system-ui, sans-serif'
  ctx.fillText('BEU BABA', w / 2, 280)
  ctx.fillStyle = '#949cab'
  ctx.font = '28px system-ui, sans-serif'
  ctx.fillText('Quiz Result', w / 2, 330)

  ctx.fillStyle = '#1a2233'
  ctx.font = 'bold 40px system-ui, sans-serif'
  wrapText(ctx, result.quiz_title, w / 2, 430, w - 260, 48)

  // big score
  ctx.fillStyle = '#37509a'
  ctx.font = 'bold 180px system-ui, sans-serif'
  ctx.fillText(`${result.percentage}%`, w / 2, 720)
  ctx.fillStyle = '#5b6577'
  ctx.font = 'bold 54px system-ui, sans-serif'
  ctx.fillText(`${result.marks_obtained} / ${result.max_marks} marks`, w / 2, 800)

  // stat row
  const stats: [string, string][] = [
    ['Correct', String(result.correct)],
    ['Incorrect', String(result.incorrect)],
    ['Accuracy', `${result.accuracy}%`],
  ]
  const startX = w / 2 - 300
  stats.forEach(([label, val], i) => {
    const x = startX + i * 300
    ctx.fillStyle = '#1a2233'
    ctx.font = 'bold 64px system-ui, sans-serif'
    ctx.fillText(val, x, 970)
    ctx.fillStyle = '#949cab'
    ctx.font = '30px system-ui, sans-serif'
    ctx.fillText(label, x, 1020)
  })

  ctx.fillStyle = '#949cab'
  ctx.font = '28px system-ui, sans-serif'
  ctx.fillText(new Date(result.submitted_at).toLocaleDateString(), w / 2, 1140)

  // Logo + wordmark + site URL + diagonal watermark, so a shared or
  // re-screenshotted card always carries attribution back to the app.
  await stampBrand(ctx, w, h, { footerY: h - 110 })

  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `beubaba-result-${result.percentage}.png`
  a.click()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const word of words) {
    const test = line + word + ' '
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, yy)
      line = word + ' '
      yy += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), x, yy)
}
