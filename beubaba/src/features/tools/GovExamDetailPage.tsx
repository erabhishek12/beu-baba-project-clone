import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Skeleton } from '@/components/feedback/Skeleton'
import { SmartSearchSheet } from '@/features/study/SmartSearchSheet'
import { toolsService } from '@/services/toolsService'
import { providers } from '@/services/smartSearch'

export function GovExamDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [assist, setAssist] = useState(false)

  const { data: exam, isLoading } = useQuery({
    queryKey: ['gov-exam', id],
    queryFn: () => toolsService.getGovExam(id),
  })

  return (
    <div className="page-x pb-10 pt-6">
      <button
        onClick={() => navigate('/tools/exams')}
        className="mb-4 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Government Exams
      </button>

      {isLoading && <Skeleton className="h-28 w-full" />}

      {!isLoading && !exam && (
        <Card className="py-10 text-center">
          <p className="text-body font-semibold text-ink">Exam not found</p>
        </Card>
      )}

      {exam && (
        <>
          <Card as="strong" className="glass-sheen">
            <Pill tone="accent">{exam.category}</Pill>
            <h1 className="mt-3 text-h1 text-ink">{exam.name}</h1>
            <p className="mt-2 text-body-sm leading-relaxed text-ink-secondary">{exam.summary}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  window.open(
                    providers.google(`${exam.name} exam official notification apply`),
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                className="glass-standard glass-highlight flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-body-sm font-semibold text-ink-secondary"
              >
                <Search className="size-4" aria-hidden />
                Official site
              </button>
              <button
                onClick={() => setAssist(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-body-sm font-semibold text-white"
              >
                <Sparkles className="size-4" aria-hidden />
                Ask AI
              </button>
            </div>
          </Card>

          <div className="mt-4 flex flex-col gap-3">
            {exam.sections.map((s, i) => (
              <Card key={i}>
                <h2 className="mb-2 text-h3 text-ink">{s.heading}</h2>
                <div className="flex flex-col gap-2">
                  {s.body.map((p, j) => (
                    <p key={j} className="text-body-sm leading-relaxed text-ink-secondary">
                      {p}
                    </p>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <SmartSearchSheet
            open={assist}
            onClose={() => setAssist(false)}
            context={{
              sourceType: 'subject',
              subject: exam.name,
              topic: `${exam.name} exam preparation`,
              level: 'competitive exam aspirant',
            }}
          />
        </>
      )}
    </div>
  )
}
