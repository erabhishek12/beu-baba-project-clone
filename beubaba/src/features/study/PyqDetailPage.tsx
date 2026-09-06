import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, CheckCircle2 } from 'lucide-react'
import { offlineService, offlineSupported } from '@/services/offlineService'
import { ChevronLeft, Clock, Award, ListOrdered, Wand2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { SmartSearchSheet } from '@/features/study/SmartSearchSheet'
import { BookmarkButton } from '@/features/support/BookmarkButton'
import { ReportButton } from '@/features/support/ReportButton'
import { useRecordView } from '@/features/saved/useRecordView'
import { pyqService } from '@/services/pyqService'
import { cleanMath } from '@/lib/text'
import type { StudyContext } from '@/services/smartSearch'

export function PyqDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [assist, setAssist] = useState<StudyContext | null>(null)

  // Keep a copy on the phone so the paper opens with no connection.
  const [savedOffline, setSavedOffline] = useState(false)
  useEffect(() => {
    if (!id) return
    void offlineService.has(`pyq:${id}`).then(setSavedOffline)
  }, [id])

  async function saveOffline() {
    if (!detail || !paper) return
    if (savedOffline) {
      await offlineService.remove(`pyq:${id}`)
      setSavedOffline(false)
      return
    }
    await offlineService.save({
      key: `pyq:${id}`,
      kind: 'pyq',
      title: `${paper.subject}${paper.year ? ` (${paper.year})` : ''}`,
      subtitle: paper.semester != null ? `Semester ${paper.semester}` : undefined,
      data: detail,
    })
    setSavedOffline(true)
  }

  const { data: paper, isLoading: metaLoading } = useQuery({
    queryKey: ['pyq', id],
    queryFn: () => pyqService.get(id),
  })
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['pyq-detail', id],
    queryFn: async () => {
      try {
        const d = await pyqService.detail(id)
        return d
      } catch (e) {
        // No connection: fall back to a copy the student saved for offline use.
        const saved = await offlineService.get<Awaited<ReturnType<typeof pyqService.detail>>>(
          `pyq:${id}`,
        )
        if (saved) return saved.data
        throw e
      }
    },
  })

  useRecordView('pyq', id, paper ? `${paper.subject}${paper.year ? ` (${paper.year})` : ''}` : null, {
    subtitle: paper?.semester != null ? `Semester ${paper.semester}` : null,
    url: `/study/pyq/${id}`,
  })

  return (
    <div className="page-x pb-10 pt-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back
      </button>

      {metaLoading && <Skeleton className="h-28 w-full" />}

      {!metaLoading && !paper && (
        <Card className="py-10 text-center">
          <p className="text-body font-semibold text-ink">Paper not found</p>
          <p className="mt-1 text-body-sm text-ink-secondary">
            This paper may have been moved or removed.
          </p>
        </Card>
      )}

      {paper && (
        <>
          <Card as="strong">
            <div className="flex flex-wrap items-center gap-2">
              {paper.year != null && <Pill tone="accent" className="tnum">{paper.year}</Pill>}
              {paper.semester != null && <Pill>Sem {paper.semester}</Pill>}
              {paper.code && <Pill className="tnum">{paper.code}</Pill>}
            </div>
            <h1 className="mt-3 text-h2 text-ink">{paper.subject}</h1>
            {paper.exam_title && (
              <p className="mt-1 text-body-sm text-ink-secondary">{paper.exam_title}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-body-sm text-ink-secondary">
              {paper.full_marks != null && (
                <span className="flex items-center gap-1.5">
                  <Award className="size-4 text-ink-tertiary" aria-hidden />
                  {paper.full_marks} marks
                </span>
              )}
              {paper.time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-ink-tertiary" aria-hidden />
                  {paper.time}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <ListOrdered className="size-4 text-ink-tertiary" aria-hidden />
                {paper.question_count} questions
              </span>
            </div>
            <button
              onClick={() =>
                setAssist({
                  sourceType: 'subject',
                  subject: paper.subject,
                  semester: paper.semester,
                  examYear: paper.year,
                  topic: paper.subject,
                })
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-body-sm font-semibold text-white"
            >
              <Wand2 className="size-4" aria-hidden />
              Study assist for this subject
            </button>
            <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3">
              <BookmarkButton
                variant="text"
                item={{
                  target_type: 'pyq',
                  target_id: id,
                  title: `${paper.subject}${paper.year ? ` (${paper.year})` : ''}`,
                  subtitle: paper.semester != null ? `Semester ${paper.semester}` : null,
                  url: `/study/pyq/${id}`,
                }}
              />
              {offlineSupported() && detail && (
                <button
                  onClick={saveOffline}
                  className="flex items-center gap-1.5 text-body-sm font-semibold text-ink-secondary"
                >
                  {savedOffline ? (
                    <>
                      <CheckCircle2 className="size-4 text-success" aria-hidden /> Saved offline
                    </>
                  ) : (
                    <>
                      <Download className="size-4" aria-hidden /> Save offline
                    </>
                  )}
                </button>
              )}
              <ReportButton
                targetType="pyq"
                targetId={id}
                targetLabel={`${paper.subject}${paper.year ? ` (${paper.year})` : ''}`}
              />
            </div>
          </Card>

          {detailLoading && (
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          )}

          {detail && (
            <>
              {detail.instructions.length > 0 && (
                <Card className="mt-4">
                  <h2 className="mb-2 text-label uppercase tracking-wide text-ink-tertiary">
                    Instructions
                  </h2>
                  <ul className="list-disc space-y-1 pl-5 text-body-sm text-ink-secondary">
                    {detail.instructions.map((line, i) => (
                      <li key={i}>{cleanMath(line)}</li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="mt-4 flex flex-col gap-4">
                {detail.blocks.map((b, bi) => (
                  <Card key={bi} as="strong">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-body font-semibold text-ink">
                        {cleanMath(b.title) || `Question ${b.number ?? bi + 1}`}
                      </h3>
                      {b.marks != null && (
                        <Pill tone="warning" className="shrink-0">
                          {b.marks}
                        </Pill>
                      )}
                    </div>
                    <ol className="flex flex-col gap-3">
                      {b.subquestions.map((s, si) => (
                        <li key={si} className="flex gap-3">
                          <span className="tnum mt-0.5 text-body-sm font-semibold text-accent">
                            {romanOrNum(s.number, si)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                              <p className="min-w-0 flex-1 text-body-sm text-ink">
                                {cleanMath(s.text)}
                              </p>
                              <button
                                onClick={() =>
                                  setAssist({
                                    sourceType: 'pyq',
                                    subject: paper.subject,
                                    semester: paper.semester,
                                    examYear: paper.year,
                                    marks: s.marks ?? b.marks ?? null,
                                    question: cleanMath(s.text),
                                    topic: paper.subject,
                                  })
                                }
                                aria-label="Study assist for this question"
                                className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"
                              >
                                <Wand2 className="size-3.5" aria-hidden />
                              </button>
                            </div>
                            {s.options && s.options.length > 0 && (
                              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                                {s.options.map((opt, oi) => (
                                  <li
                                    key={oi}
                                    className="flex items-baseline gap-2 rounded-md bg-surface-secondary/70 px-2.5 py-1.5 text-body-sm text-ink-secondary"
                                  >
                                    <span className="font-semibold text-ink-tertiary">
                                      {String.fromCharCode(97 + oi)}.
                                    </span>
                                    <span>{cleanMath(opt)}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <SmartSearchSheet
        open={assist != null}
        onClose={() => setAssist(null)}
        context={assist ?? {}}
      />
    </div>
  )
}

function romanOrNum(n: number | undefined, fallbackIndex: number): string {
  return `${n ?? fallbackIndex + 1}.`
}
