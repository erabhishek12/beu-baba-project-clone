import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Plus, History } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { AppIcon } from '@/components/ui/AppIcon'
import { cn } from '@/lib/cn'
import { contentAdminService } from '@/services/contentAdminService'
import { pyqService } from '@/services/pyqService'
import { quizService } from '@/services/quizService'
import { academicService } from '@/services/academicService'
import type { Notice } from '@/services/mock/seed_content'

type Tab = 'notices' | 'pyqs' | 'versions' | 'quizzes' | 'import'

const CATEGORIES: Notice['category'][] = ['exam', 'result', 'academic', 'general']

/** Small accessible publish switch shared by the lists below. */
function PublishSwitch({
  published,
  label,
  onToggle,
}: {
  published: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors',
        published ? 'bg-accent' : 'bg-line',
      )}
    >
      <span
        className={cn(
          'absolute top-1 size-5 rounded-full bg-white shadow transition-all',
          published ? 'left-6' : 'left-1',
        )}
      />
    </button>
  )
}

/**
 * Phase 4 — academic content control: author & publish notices, toggle PYQ
 * publication, and publish new syllabus versions. Everything students see
 * downstream (home, search, study) reads through these publication states.
 */
export function AdminAcademicPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('notices')

  // notice form
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<Notice['category']>('general')
  // version form
  const [subjectQuery, setSubjectQuery] = useState('')
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [versionNote, setVersionNote] = useState('')
  // quiz builder
  const [bSubject, setBSubject] = useState('')
  const [bDiff, setBDiff] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed')
  const [bCount, setBCount] = useState(10)
  // json import
  const [importTarget, setImportTarget] = useState<'notices' | 'holidays'>('notices')
  const [importMsg, setImportMsg] = useState('')

  const notices = useQuery({
    queryKey: ['admin', 'notices'],
    queryFn: () => contentAdminService.listAllNotices(),
  })
  const pyqs = useQuery({
    queryKey: ['admin', 'pyqs'],
    queryFn: () => pyqService.list({}),
  })
  const subjects = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: () => academicService.listSubjects(),
  })
  const bankSubjects = useQuery({
    queryKey: ['admin', 'quiz-subjects'],
    queryFn: () => quizService.listSubjects(),
  })
  const versions = useQuery({
    queryKey: ['admin', 'versions', subjectId],
    queryFn: () =>
      subjectId ? contentAdminService.listVersions(subjectId) : Promise.resolve([]),
    enabled: Boolean(subjectId),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin'] })
    qc.invalidateQueries({ queryKey: ['notices'] })
    qc.invalidateQueries({ queryKey: ['home'] })
    qc.invalidateQueries({ queryKey: ['search'] })
  }

  const filteredSubjects = (subjects.data ?? [])
    .filter((s) => s.name.toLowerCase().includes(subjectQuery.toLowerCase().trim()))
    .slice(0, 6)
  const selectedSubject = (subjects.data ?? []).find((s) => s.id === subjectId)

  return (
    <div className="page-x pb-10 pt-6">
      <button
        onClick={() => navigate('/admin')}
        className="mb-4 inline-flex items-center gap-1.5 text-body-sm font-semibold text-accent"
      >
        <ChevronLeft className="size-4" aria-hidden /> Admin
      </button>
      <h1 className="font-heading text-h2 font-extrabold tracking-tight text-ink">
        Academic content
      </h1>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Notices, PYQ publication and syllabus versioning — one editorial desk.
      </p>

      <div className="mt-4 flex gap-2">
        {(
          [
            ['notices', 'Notices'],
            ['pyqs', 'PYQs'],
            ['versions', 'Versions'],
            ['quizzes', 'Quiz builder'],
            ['import', 'Import JSON'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-pill px-4 py-2 text-caption font-bold transition-colors',
              tab === key
                ? 'bg-accent text-white shadow-[0_8px_18px_rgba(91,110,240,0.35)]'
                : 'bg-surface text-ink-secondary ring-1 ring-line hover:text-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'notices' && (
        <div className="mt-4 flex flex-col gap-3">
          <Card as="glass" className="glass-highlight">
            <h2 className="mb-3 flex items-center gap-2 text-body font-bold text-ink">
              <AppIcon name="notifications" className="size-7" /> Publish a notice
            </h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notice title"
              className="w-full rounded-xl bg-surface-secondary px-3.5 py-2.5 text-body text-ink ring-1 ring-line placeholder:text-ink-tertiary focus:ring-2 focus:ring-accent"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Details students should see…"
              rows={3}
              className="mt-2 w-full rounded-xl bg-surface-secondary px-3.5 py-2.5 text-body text-ink ring-1 ring-line placeholder:text-ink-tertiary focus:ring-2 focus:ring-accent"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'rounded-pill px-3 py-1.5 text-caption font-semibold capitalize ring-1',
                    category === c
                      ? 'bg-accent-soft text-accent ring-accent/40'
                      : 'bg-surface text-ink-tertiary ring-line',
                  )}
                >
                  {c}
                </button>
              ))}
              <button
                onClick={async () => {
                  if (!title.trim() || !body.trim()) return
                  await contentAdminService.createNotice({ title, body, category })
                  setTitle('')
                  setBody('')
                  invalidate()
                }}
                className="ml-auto inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-caption font-bold text-white shadow-[0_8px_18px_rgba(91,110,240,0.35)]"
              >
                <Plus className="size-4" aria-hidden /> Publish
              </button>
            </div>
          </Card>

          {(notices.data ?? []).map((n) => (
            <Card key={n.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-semibold text-ink">{n.title}</p>
                <p className="truncate text-caption text-ink-tertiary">{n.body}</p>
              </div>
              <Pill tone="neutral" className="capitalize">
                {n.category}
              </Pill>
              <PublishSwitch
                published={n.is_published}
                label={`Toggle notice ${n.title}`}
                onToggle={async () => {
                  await contentAdminService.setNoticePublished(n.id, !n.is_published)
                  invalidate()
                }}
              />
            </Card>
          ))}
          {(notices.data ?? []).length === 0 && (
            <p className="rounded-2xl bg-surface p-4 text-body-sm text-ink-secondary ring-1 ring-line">
              No notices yet — publish the first one above.
            </p>
          )}
        </div>
      )}

      {tab === 'pyqs' && (
        <div className="mt-4 flex flex-col gap-2">
          {(pyqs.data ?? []).slice(0, 40).map((p) => {
            const published = contentAdminService.isPyqPublished(p.id)
            return (
              <Card key={p.id} className="flex items-center gap-3">
                <AppIcon name="pyq" className="size-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-ink">{p.subject}</p>
                  <p className="text-caption text-ink-tertiary">
                    {p.year ?? '—'} · Sem {p.semester ?? '—'}
                  </p>
                </div>
                <PublishSwitch
                  published={published}
                  label={`Toggle paper ${p.subject} ${p.year ?? ''}`}
                  onToggle={async () => {
                    await contentAdminService.setPyqPublished(p.id, !published)
                    invalidate()
                  }}
                />
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'versions' && (
        <div className="mt-4 flex flex-col gap-3">
          <input
            value={subjectQuery}
            onChange={(e) => {
              setSubjectQuery(e.target.value)
              setSubjectId(null)
            }}
            placeholder="Search a subject to manage its syllabus versions…"
            className="w-full rounded-xl bg-surface px-3.5 py-2.5 text-body text-ink ring-1 ring-line placeholder:text-ink-tertiary focus:ring-2 focus:ring-accent"
          />
          {!subjectId && filteredSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filteredSubjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubjectId(s.id)}
                  className="bb-chip px-3 py-1.5 text-caption font-semibold"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
          {selectedSubject && (
            <Card as="glass" className="glass-highlight">
              <h2 className="flex items-center gap-2 text-body font-bold text-ink">
                <History className="size-4 text-accent" aria-hidden />
                {selectedSubject.name}
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {[...(versions.data ?? [])].reverse().map((v) => (
                  <li
                    key={v.version}
                    className="flex items-center gap-3 rounded-xl bg-surface-secondary/70 px-3 py-2"
                  >
                    <Pill tone={v.version === (versions.data ?? []).length ? 'accent' : 'neutral'}>
                      v{v.version}
                    </Pill>
                    <span className="min-w-0 flex-1 truncate text-body-sm text-ink-secondary">
                      {v.note}
                    </span>
                    <span className="text-caption text-ink-tertiary">
                      {new Date(v.published_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <input
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                  placeholder="Revision note (e.g. updated Unit 3 topics)"
                  className="min-w-0 flex-1 rounded-xl bg-surface-secondary px-3.5 py-2.5 text-body-sm text-ink ring-1 ring-line placeholder:text-ink-tertiary focus:ring-2 focus:ring-accent"
                />
                <button
                  onClick={async () => {
                    await contentAdminService.publishVersion(selectedSubject.id, versionNote)
                    setVersionNote('')
                    invalidate()
                  }}
                  className="rounded-pill bg-accent px-4 py-2 text-caption font-bold text-white shadow-[0_8px_18px_rgba(91,110,240,0.35)]"
                >
                  Publish version
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'quizzes' && (
        <div className="mt-4 flex flex-col gap-3">
          <Card as="glass" className="glass-highlight">
            <h2 className="mb-3 text-body font-bold text-ink">
              Build a quiz from the imported MCQ bank
            </h2>
            <select
              value={bSubject}
              onChange={(e) => setBSubject(e.target.value)}
              className="w-full rounded-xl bg-surface-secondary px-3.5 py-2.5 text-body text-ink ring-1 ring-line focus:ring-2 focus:ring-accent"
            >
              <option value="">Choose a subject…</option>
              {(bankSubjects.data ?? []).map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.count})
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(['easy', 'medium', 'hard', 'mixed'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setBDiff(d)}
                  className={cn(
                    'rounded-pill px-3 py-1.5 text-caption font-semibold capitalize ring-1',
                    bDiff === d
                      ? 'bg-accent-soft text-accent ring-accent/40'
                      : 'bg-surface text-ink-tertiary ring-line',
                  )}
                >
                  {d}
                </button>
              ))}
              <label className="ml-auto flex items-center gap-2 text-caption font-semibold text-ink-secondary">
                Questions
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={bCount}
                  onChange={(e) => setBCount(Number(e.target.value) || 10)}
                  className="w-16 rounded-xl bg-surface-secondary px-2 py-1.5 text-body-sm text-ink ring-1 ring-line"
                />
              </label>
            </div>
            <button
              onClick={async () => {
                const subj = (bankSubjects.data ?? []).find((s) => s.code === bSubject)
                if (!subj) return
                await contentAdminService.createBuilderSpec({
                  title: `${subj.name} · ${bDiff === 'mixed' ? 'mixed' : bDiff} set`,
                  subject_code: subj.code,
                  subject_name: subj.name,
                  difficulty: bDiff,
                  pick_count: Math.min(30, Math.max(5, bCount)),
                  duration_sec: Math.min(30, Math.max(5, bCount)) * 60,
                })
                invalidate()
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-caption font-bold text-white shadow-[0_8px_18px_rgba(91,110,240,0.35)]"
            >
              <Plus className="size-4" aria-hidden /> Create quiz
            </button>
          </Card>
          {contentAdminService.listBuilderSpecsSync().map((s) => (
            <Card key={s.id} className="flex items-center gap-3">
              <AppIcon name="quiz" className="size-9 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-semibold text-ink">{s.title}</p>
                <p className="text-caption text-ink-tertiary">
                  {s.pick_count} questions · {Math.round(s.duration_sec / 60)} min · {s.difficulty}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'import' && (
        <Card as="glass" className="glass-highlight mt-4">
          <h2 className="mb-1 text-body font-bold text-ink">Import JSON</h2>
          <p className="mb-3 text-caption text-ink-tertiary">
            Upload an array of records — notices ({'{title, body, category}'}) or holidays
            ({'{title, date}'}). Duplicates are skipped automatically.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {(['notices', 'holidays'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setImportTarget(t)}
                className={cn(
                  'rounded-pill px-3 py-1.5 text-caption font-semibold capitalize ring-1',
                  importTarget === t
                    ? 'bg-accent-soft text-accent ring-accent/40'
                    : 'bg-surface text-ink-tertiary ring-line',
                )}
              >
                {t}
              </button>
            ))}
            <label className="ml-auto cursor-pointer rounded-pill bg-accent px-4 py-2 text-caption font-bold text-white shadow-[0_8px_18px_rgba(91,110,240,0.35)]">
              Choose .json file
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const raw = JSON.parse(await file.text())
                    const rows = Array.isArray(raw)
                      ? raw
                      : (raw[importTarget] ?? raw.holidays ?? raw.notices ?? [])
                    const added =
                      importTarget === 'notices'
                        ? await contentAdminService.importNotices(rows)
                        : await contentAdminService.importHolidays(rows)
                    setImportMsg(`Imported ${added} ${importTarget}.`)
                    invalidate()
                  } catch {
                    setImportMsg('Could not parse that file — expected a JSON array.')
                  }
                  e.target.value = ''
                }}
              />
            </label>
          </div>
          {importMsg && <p className="mt-3 text-body-sm text-ink-secondary">{importMsg}</p>}
        </Card>
      )}
    </div>
  )
}
