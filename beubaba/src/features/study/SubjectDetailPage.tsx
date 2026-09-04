import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Search, Sparkles, X, Wand2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { AppIcon } from '@/components/ui/AppIcon'
import { Pill } from '@/components/ui/Pill'
import { contentAdminService } from '@/services/contentAdminService'
import { Skeleton } from '@/components/feedback/Skeleton'
import { SmartSearchSheet } from '@/features/study/SmartSearchSheet'
import { BookmarkButton } from '@/features/support/BookmarkButton'
import { ReportButton } from '@/features/support/ReportButton'
import { useRecordView } from '@/features/saved/useRecordView'
import { academicService } from '@/services/academicService'
import { syllabusService, type SyllabusUnit } from '@/services/syllabusService'
import { useAcademicLabels } from '@/features/profile/hooks'
import type { StudyContext } from '@/services/smartSearch'
import { cn } from '@/lib/cn'

export function SubjectDetailPage() {
  const { id = '' } = useParams()
  const { data: syllabusVersion } = useQuery({
    queryKey: ['syllabus-version', id],
    queryFn: () => contentAdminService.currentVersion(id),
    enabled: Boolean(id),
  })
  const navigate = useNavigate()
  const [topicQuery, setTopicQuery] = useState('')
  const [assist, setAssist] = useState<StudyContext | null>(null)

  const { data: subjects = [] } = useQuery({
    queryKey: ['all-subjects'],
    queryFn: () => academicService.listSubjects(),
  })
  const subject = subjects.find((s) => s.id === id)

  const { branchName, semesterName } = useAcademicLabels(
    subject?.branch_id,
    subject?.semester_id,
  )

  const { data: detail, isLoading } = useQuery({
    queryKey: ['subject-detail', id, subject?.code],
    queryFn: () => syllabusService.getSubjectDetail(id, subject?.code),
    enabled: subjects.length > 0,
  })

  useRecordView('subject', id, subject?.name ?? null, {
    subtitle: subject?.code ?? null,
    url: `/study/subject/${id}`,
  })

  const filteredUnits = useMemo(() => {
    if (!detail) return []
    const q = topicQuery.trim().toLowerCase()
    if (!q) return detail.units
    return detail.units
      .map((u) => {
        const titleHit = u.title.toLowerCase().includes(q)
        const topics = titleHit ? u.topics : u.topics.filter((t) => t.toLowerCase().includes(q))
        return titleHit || topics.length ? { ...u, topics } : null
      })
      .filter((u): u is SyllabusUnit => u != null)
  }, [detail, topicQuery])

  function openAssist(topic: string) {
    setAssist({
      sourceType: 'syllabus_topic',
      subject: subject?.name,
      branch: branchName,
      semester: subjectSemNumber(semesterName),
      topic,
    })
  }

  return (
    <div className="page-x pb-10 pt-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back
      </button>

      {/* Subject header */}
      <Card as="strong">
        <div className="flex items-start gap-3">
          <span className="glass-standard glass-highlight flex size-11 shrink-0 items-center justify-center rounded-xl">
            <AppIcon name="syllabus" className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-h3 text-ink">{subject?.name ?? 'Subject'}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-ink-tertiary">
              {subject?.code && <span className="tnum">{subject.code}</span>}
              {branchName && <span>· {branchName}</span>}
              {semesterName && <span>· {semesterName}</span>}
              {syllabusVersion != null && (
                <Pill tone="accent">Syllabus v{syllabusVersion}</Pill>
              )}
            </p>
          </div>
        </div>
        {subject && (
          <button
            onClick={() =>
              openAssist(subject.name)
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-body-sm font-semibold text-white"
          >
            <Sparkles className="size-4" aria-hidden />
            Study assist for this subject
          </button>
        )}
        {subject && (
          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3">
            <BookmarkButton
              variant="text"
              item={{
                target_type: 'subject',
                target_id: id,
                title: subject.name,
                subtitle: subject.code ?? null,
                url: `/study/subject/${id}`,
              }}
            />
            <ReportButton targetType="subject" targetId={id} targetLabel={subject.name} />
          </div>
        )}
      </Card>

      {/* Topic search */}
      {detail && detail.units.length > 0 && (
        <div className="glass-standard glass-highlight mt-4 flex items-center gap-3 rounded-xl px-4 py-3">
          <Search className="size-5 text-ink-tertiary" aria-hidden />
          <input
            value={topicQuery}
            onChange={(e) => setTopicQuery(e.target.value)}
            placeholder="Search any topic in this subject…"
            aria-label="Search topics"
            className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-tertiary"
          />
          {topicQuery && (
            <button aria-label="Clear" onClick={() => setTopicQuery('')}>
              <X className="size-4 text-ink-tertiary" />
            </button>
          )}
        </div>
      )}

      {/* Units */}
      <div className="mt-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}

        {!isLoading && !detail && (
          <Card className="py-10 text-center">
            <p className="text-body font-semibold text-ink">Detailed syllabus not available</p>
            <p className="mt-1 text-body-sm text-ink-secondary">
              Unit-wise content for this subject isn’t in the current dataset yet. You can still use
              Study assist above.
            </p>
          </Card>
        )}

        {!isLoading && detail && filteredUnits.length === 0 && (
          <Card className="py-8 text-center">
            <p className="text-body-sm text-ink-secondary">No topics match “{topicQuery}”.</p>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {filteredUnits.map((u, i) => (
            <UnitCard
              key={i}
              index={i}
              unit={u}
              onTopicAssist={openAssist}
            />
          ))}
        </div>

        {/* Reference books */}
        {detail && detail.books.length > 0 && (
          <Card className="mt-4">
            <h2 className="mb-2 text-label uppercase tracking-wide text-ink-tertiary">
              Reference books
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-body-sm text-ink-secondary">
              {detail.books.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <SmartSearchSheet
        open={assist != null}
        onClose={() => setAssist(null)}
        context={assist ?? {}}
      />
    </div>
  )
}

function UnitCard({
  index,
  unit,
  onTopicAssist,
}: {
  index: number
  unit: SyllabusUnit
  onTopicAssist: (topic: string) => void
}) {
  const [open, setOpen] = useState(index === 0)
  return (
    <Card padded={false} className="overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-caption font-bold text-accent">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-ink">
            {unit.title && unit.title !== 'Unit' ? unit.title : `Unit ${index + 1}`}
          </span>
          <span className="text-caption text-ink-tertiary">
            {unit.topics.length} topic{unit.topics.length === 1 ? '' : 's'}
          </span>
        </span>
        <Pill tone="neutral" className="shrink-0">
          Unit {index + 1}
        </Pill>
      </button>

      {open && unit.topics.length > 0 && (
        <ul className="border-t border-line/70">
          {unit.topics.map((t, i) => (
            <li
              key={i}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5',
                i > 0 && 'border-t border-line/40',
              )}
            >
              <span className="min-w-0 flex-1 text-body-sm text-ink-secondary">{t}</span>
              <button
                onClick={() => onTopicAssist(t)}
                aria-label={`Study assist for ${t}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"
              >
                <Wand2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function subjectSemNumber(label?: string): number | null {
  if (!label) return null
  const m = label.match(/(\d+)/)
  return m ? Number(m[1]) : null
}
