import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, FlaskConical, Layers, Award, ChevronRight } from 'lucide-react'
import type { Subject } from '@/types/domain'
import { AppIcon } from '@/components/ui/AppIcon'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { ContextPicker } from '@/features/study/ContextPicker'
import { useStudyContext } from '@/features/study/hooks'
import { academicService } from '@/services/academicService'
import { syllabusService } from '@/services/syllabusService'

export function SyllabusPage() {
  const navigate = useNavigate()
  const { branchId, semesterId, setBranchId, setSemesterId, branches, semesters, branch, semester } =
    useStudyContext()

  const ready = Boolean(branchId && semesterId)
  const { data, isLoading } = useQuery({
    queryKey: ['syllabus', branchId, semesterId],
    queryFn: () => syllabusService.getSyllabus(branchId, semesterId),
    enabled: ready,
  })

  return (
    <div>
      <ContextPicker
        branches={branches}
        semesters={semesters}
        branchId={branchId}
        semesterId={semesterId}
        onBranch={setBranchId}
        onSemester={setSemesterId}
      />

      {!ready && (
        <Card className="mt-5 flex flex-col items-center gap-2 py-10 text-center">
          <BookOpen className="size-8 text-ink-tertiary" aria-hidden />
          <p className="text-body font-semibold text-ink">Choose a branch and semester</p>
          <p className="text-body-sm text-ink-secondary">
            The published syllabus and credit structure will appear here.
          </p>
        </Card>
      )}

      {ready && isLoading && (
        <div className="mt-5 flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {ready && !isLoading && data && (
        <div className="mt-5">
          {data.subjects.length === 0 ? (
            <Card className="py-8 text-center">
              <AppIcon name="syllabus" className="mx-auto size-16" />
              <p className="mt-3 text-body font-semibold text-ink">
                No syllabus for {branch?.name} · {semester?.label}
              </p>
              <p className="mt-1 text-body-sm text-ink-secondary">
                This branch has syllabus in other semesters — jump straight there:
              </p>
              <AvailableSemesters branchId={branchId} onPick={setSemesterId} />
            </Card>
          ) : (
            <>
              {/* Summary */}
              <Card as="strong" className="mb-4">
                <p className="text-body-sm text-ink-secondary">
                  {branch?.name} · {semester?.label}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Stat icon={Award} value={data.totalCredits} label="Credits" />
                  <Stat icon={Layers} value={data.theoryCount} label="Theory" />
                  <Stat icon={FlaskConical} value={data.labCount} label="Labs" />
                </div>
              </Card>

              <p className="mb-2 px-1 text-caption text-ink-tertiary">
                Tap a subject for the unit-wise detailed syllabus.
              </p>
              <div className="flex flex-col gap-2.5">
                {data.subjects.map((s) => (
                  <SubjectRow
                    key={s.id}
                    subject={s}
                    onClick={() => navigate(`/study/subject/${s.id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Award
  value: number
  label: string
}) {
  return (
    <div className="rounded-lg bg-surface-secondary/60 px-3 py-2.5 text-center">
      <Icon className="mx-auto mb-1 size-4 text-accent" aria-hidden />
      <p className="tnum text-h3 text-ink">{value}</p>
      <p className="text-caption text-ink-tertiary">{label}</p>
    </div>
  )
}

function SubjectRow({ subject, onClick }: { subject: Subject; onClick: () => void }) {
  const isLab = subject.type === 'lab' || subject.type === 'practical'
  const ltp =
    subject.L != null || subject.T != null || subject.P != null
      ? `${subject.L ?? 0}-${subject.T ?? 0}-${subject.P ?? 0}`
      : null
  return (
    <Card as="glass" padded={false} className="glass-highlight liquid-depth flex w-full cursor-pointer items-center gap-3 p-4 text-left" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}>
      <span
        className={
          'flex size-11 shrink-0 items-center justify-center rounded-xl ' +
          (isLab ? 'bg-success-soft' : 'bg-accent-soft')
        }
      >
        <AppIcon name={isLab ? 'lab' : 'theory'} className="size-9" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body font-medium text-ink">{subject.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-caption text-ink-tertiary">
          {subject.code && <span className="tnum">{subject.code}</span>}
          {ltp && <span>· L-T-P {ltp}</span>}
        </p>
      </div>
      {subject.credits != null && (
        <Pill tone={isLab ? 'success' : 'accent'} className="shrink-0 tnum">
          {subject.credits} cr
        </Pill>
      )}
      <ChevronRight className="size-4 shrink-0 text-ink-tertiary/70" aria-hidden />
    </Card>
  )
}

function AvailableSemesters({ branchId, onPick }: { branchId: string; onPick: (id: string) => void }) {
  const { data } = useQuery({
    queryKey: ['syllabus-available', branchId],
    queryFn: () => academicService.listSubjects(branchId),
  })
  const { data: sems } = useQuery({
    queryKey: ['semesters-all'],
    queryFn: () => academicService.listSemesters(),
  })
  const withSubjects = useMemo(() => {
    if (!data || !sems) return []
    const ids = new Set(data.map((s) => s.semester_id))
    return sems.filter((sm: { id: string }) => ids.has(sm.id))
  }, [data, sems])
  if (!withSubjects.length) return null
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {withSubjects.map((sm) => (
        <button key={sm.id} onClick={() => onPick(sm.id)} className="bb-chip bb-chip-active">
          {sm.label}
        </button>
      ))}
    </div>
  )
}
