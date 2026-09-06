import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  CalendarClock,
  Megaphone,
  Upload,
  Sun,
  Cloud,
  Sunset,
  Moon,
  Bookmark,
  ArrowRight,
  Play,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/themeContext'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { CircleButton } from '@/components/ui/CircleButton'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'
import { Skeleton } from '@/components/feedback/Skeleton'
import { greeting, timeOfDay } from '@/features/splash/quotes'
import { useAcademicLabels } from '@/features/profile/hooks'
import { dashboardService, type Notice } from '@/services/dashboardService'
import { calendarService } from '@/services/calendarService'
import { academicService } from '@/services/academicService'
import { quizService } from '@/services/quizService'
import { TOOLBOX } from '@/features/tools/toolbox/ToolboxPage'
import { heroService } from '@/services/heroService'
import { useUserId } from '@/features/quiz/hooks'
import { cn } from '@/lib/cn'
import type { AcademicEvent, QuizResult } from '@/types/domain'

/** Pastel 2×2 category tiles (reference-matched clay look). */
const CATEGORIES: {
  label: string
  icon: AppIconName
  to: string
  tile: string
  countKey: 'pyq' | 'syllabus' | 'quiz' | 'tools'
  unit: string
}[] = [
  { label: 'PYQs', icon: 'pyq', to: '/study', tile: 'bb-tile-lav', countKey: 'pyq', unit: 'papers' },
  {
    label: 'Syllabus',
    icon: 'syllabus',
    to: '/study/syllabus',
    tile: 'bb-tile-mint',
    countKey: 'syllabus',
    unit: 'subjects',
  },
  { label: 'Quizzes', icon: 'quiz', to: '/quiz', tile: 'bb-tile-peach', countKey: 'quiz', unit: 'live' },
  {
    label: 'Toolbox',
    icon: 'toolbox',
    to: '/tools',
    tile: 'bb-tile-pink',
    countKey: 'tools',
    unit: 'tools',
  },
]

/**
 * Small shortcut row under the category tiles.
 *
 * Deliberately only FOUR: the study loop (planner, revision), the practice
 * warm-up (Math Mind) and the external study sites. Anything more and the home
 * screen stops being a starting point and becomes a menu.
 */
const SHORTCUTS: { label: string; icon: AppIconName; to: string }[] = [
  { label: 'Planner', icon: 'planner', to: '/study/planner' },
  { label: 'Revision', icon: 'revision', to: '/revision' },
  { label: 'Math Mind', icon: 'mathmind', to: '/tools/math-mind' },
  { label: 'Sites', icon: 'collaborate', to: '/tools/collaborate' },
]

const DAILY_GOAL = 3

const TOD_ICON: Record<ReturnType<typeof timeOfDay>, LucideIcon> = {
  morning: Sun,
  afternoon: Cloud,
  evening: Sunset,
  night: Moon,
}

const NOTICE_TONE: Record<Notice['category'], 'accent' | 'success' | 'warning' | 'neutral'> = {
  exam: 'warning',
  result: 'success',
  academic: 'accent',
  general: 'neutral',
}

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  const userId = useUserId()
  const { branchName, semesterName } = useAcademicLabels(
    user?.student?.branch_id,
    user?.student?.current_semester_id,
  )

  const { data: notices, isLoading: noticesLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: () => dashboardService.listNotices(),
  })
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['home-upcoming'],
    queryFn: () => calendarService.upcoming(new Date(), 4),
  })
  const { data: counts } = useQuery({
    queryKey: ['home-counts'],
    queryFn: async () => {
      const [stats, quizzes] = await Promise.all([
        Promise.resolve(academicService.stats()),
        quizService.listQuizzes(),
      ])
      return {
        pyq: stats.pyq_papers ?? 0,
        syllabus: stats.subjects ?? 0,
        quiz: quizzes.length,
        tools: TOOLBOX.length,
      }
    },
  })
  const { data: history } = useQuery({
    queryKey: ['home-recent', userId],
    queryFn: () => quizService.history(userId),
  })

  const hero = heroService.get()

  if (!user) return null
  const firstName = user.profile.full_name.split(' ')[0]
  const TodIcon = TOD_ICON[timeOfDay()]

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todayAttempts = (history ?? []).filter(
    (r) => new Date(r.submitted_at).getTime() >= startOfToday.getTime(),
  ).length
  const lastResult: QuizResult | undefined = history?.[0]

  return (
    <div className="page-x pb-8 pt-5">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_336px] lg:items-start lg:gap-7 xl:grid-cols-[minmax(0,1fr)_368px]">
        <div className="min-w-0">
          {/* Greeting row */}
          <header className="flex items-center gap-3">
            <Avatar profile={user.profile} size="md" className="shadow-neu-sm" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-body-sm text-ink-secondary">
                {greeting()}
                <TodIcon className="size-3.5 text-ink-tertiary" aria-hidden />
              </p>
              <h1 className="font-script truncate text-[30px] font-bold leading-tight text-ink md:text-[36px]">
                Hi, {firstName}!
              </h1>
            </div>
            <CircleButton
              label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggle}
            >
              {theme === 'dark' ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
            </CircleButton>
          </header>

          {(branchName || semesterName) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {branchName && <Pill tone="accent">{branchName}</Pill>}
              {semesterName && <Pill>{semesterName}</Pill>}
            </div>
          )}

          {/* Hero banner */}
          <section className="bb-hero relative mt-4 overflow-hidden rounded-[28px] p-5 pr-28 shadow-[0_18px_38px_rgba(114,92,240,0.35)] sm:p-6 sm:pr-36">
            <h2 className="font-display max-w-[16ch] text-h2 leading-snug text-white sm:text-h1">
              {hero.title}
            </h2>
            <p className="mt-1.5 max-w-[26ch] text-body-sm text-white/85">{hero.subtitle}</p>
            <button
              onClick={() => navigate(hero.to)}
              className="mt-4 flex items-center gap-2 rounded-pill bg-canvas py-2 pl-4 pr-2 text-body-sm font-bold text-ink shadow-[0_10px_22px_rgba(20,16,60,0.25)] active:scale-[0.98] motion-reduce:active:scale-100"
            >
              {hero.cta}
              <span className="flex size-6 items-center justify-center rounded-full bg-[#f27bb2] dark:bg-[#d1609a]">
                <ArrowRight className="size-3.5 text-white" strokeWidth={3} aria-hidden />
              </span>
            </button>
            <img
              src="/assets/char-hero.webp"
              alt=""
              className="bb-float pointer-events-none absolute -bottom-2 right-2 h-32 w-auto object-contain drop-shadow-[0_14px_22px_rgba(30,20,80,0.35)] sm:right-4 sm:h-40"
            />
          </section>

          {/* Category tiles with real counts */}
          <section className="mt-4 grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                onClick={() => navigate(c.to)}
                className={cn(
                  'relative flex min-h-[104px] flex-col items-start overflow-hidden rounded-3xl p-4 text-left shadow-neu-sm ring-1 ring-line transition-shadow hover:shadow-neu',
                  c.tile,
                )}
              >
                <span className="font-heading text-body-lg text-ink">{c.label}</span>
                <span className="tnum mt-0.5 text-caption font-semibold text-ink-secondary">
                  {counts ? counts[c.countKey].toLocaleString('en-IN') : '—'} {c.unit}
                </span>
                <AppIcon
                  name={c.icon}
                  className="pointer-events-none absolute -bottom-1 -right-1 size-16 drop-shadow-[0_8px_14px_rgba(40,30,90,0.18)] sm:size-20"
                />
              </button>
            ))}
          </section>

          {/* Quick shortcuts — kept to four so home stays uncluttered */}
          <section className="mt-3 grid grid-cols-4 gap-2">
            {SHORTCUTS.map((sc) => (
              <button
                key={sc.label}
                onClick={() => navigate(sc.to)}
                className="flex flex-col items-center gap-1 rounded-2xl bg-surface px-1.5 py-2.5 ring-1 ring-line transition-shadow hover:shadow-neu-sm"
              >
                <AppIcon name={sc.icon} className="size-9" />
                <span className="text-center text-label leading-tight text-ink-secondary">
                  {sc.label}
                </span>
              </button>
            ))}
          </section>

          {/* Daily goal (real attempts today) */}
          <section className="bb-hero relative mt-4 overflow-hidden rounded-3xl p-5 pr-24 shadow-[0_16px_34px_rgba(114,92,240,0.3)]">
            <h2 className="font-heading text-h3 text-white">Today&apos;s Goal</h2>
            <p className="mt-1 text-body-sm text-white/85">
              {todayAttempts > 0
                ? 'Keep it up! You are doing great.'
                : 'No quiz attempts yet today — start one!'}
            </p>
            <div className="mt-3 h-2 w-full max-w-[220px] overflow-hidden rounded-pill bg-white/25">
              <div
                className="h-full rounded-pill bg-white transition-all"
                style={{ width: `${Math.min(100, (todayAttempts / DAILY_GOAL) * 100)}%` }}
              />
            </div>
            <p className="tnum mt-1.5 text-caption font-semibold text-white/90">
              {todayAttempts} / {DAILY_GOAL} quizzes
            </p>
            <AppIcon
              name="star"
              className="pointer-events-none absolute -bottom-2 right-1 size-20 rotate-6 drop-shadow-[0_10px_18px_rgba(30,20,80,0.3)]"
            />
          </section>

          {/* Continue learning */}
          <section className="mt-6">
            <SectionHeader title="Continue learning" icon={Bookmark} />
            <div className="mt-3">
              {lastResult ? (
                <Card as="neu" className="flex items-center gap-4">
                  <span className="bb-tile-lav flex size-14 shrink-0 items-center justify-center rounded-2xl">
                    <AppIcon name="quiz" className="size-10" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-ink">
                      {lastResult.quiz_title}
                    </p>
                    <p className="truncate text-caption text-ink-tertiary">
                      {lastResult.subject_name} · {Math.round(lastResult.percentage)}% last score
                    </p>
                    <div className="mt-2 h-1.5 w-full max-w-[180px] overflow-hidden rounded-pill bg-line">
                      <div
                        className="h-full rounded-pill bg-accent"
                        style={{ width: `${Math.min(100, lastResult.percentage)}%` }}
                      />
                    </div>
                  </div>
                  <CircleButton
                    tone="accent"
                    label={`Retake ${lastResult.quiz_title}`}
                    onClick={() => navigate(`/quiz/${lastResult.quiz_id}`)}
                  >
                    <Play className="size-4 fill-white" aria-hidden />
                  </CircleButton>
                </Card>
              ) : (
                <Card as="neu" className="flex items-center gap-4">
                  <span className="bb-tile-peach flex size-14 shrink-0 items-center justify-center rounded-2xl">
                    <AppIcon name="quiz" className="size-10" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-semibold text-ink">Start your first quiz</p>
                    <p className="text-caption text-ink-tertiary">
                      Finished quizzes appear here for quick revision.
                    </p>
                  </div>
                  <CircleButton tone="accent" label="Browse quizzes" onClick={() => navigate('/quiz')}>
                    <ArrowRight className="size-4" aria-hidden />
                  </CircleButton>
                </Card>
              )}
            </div>
          </section>

          {/* Resources — always-visible primary entry point */}
          <button
            onClick={() => navigate('/resources')}
            className="neu neu-press glass-highlight liquid-depth mt-4 flex w-full items-center gap-4 overflow-hidden rounded-2xl p-4 text-left hover:shadow-neu-lg"
          >
            <AppIcon name="resources" className="size-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-body-lg text-ink">Resources</p>
              <p className="mt-0.5 text-body-sm text-ink-secondary">
                Notes, PDFs &amp; links shared by students
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-pill bg-accent px-3 py-1.5 text-caption font-semibold text-white">
              <Upload className="size-3.5" aria-hidden />
              Share
            </span>
          </button>

          {/* Important portals — quick entry */}
          <button
            onClick={() => navigate('/tools/portals')}
            className="mt-4 flex w-full items-center gap-4 rounded-2xl bg-surface p-4 text-left shadow-neu-sm ring-1 ring-line hover:shadow-neu"
          >
            <AppIcon name="portals" className="size-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-body-lg text-ink">Important Portals</p>
              <p className="mt-0.5 text-body-sm text-ink-secondary">
                BEU official, NPTEL, scholarships &amp; more
              </p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent shadow-[0_8px_18px_rgba(91,110,240,0.35)]">
              <ChevronRight className="size-4 text-white" aria-hidden />
            </span>
          </button>

          {/* Notices */}
          <section className="mt-7">
            <SectionHeader title="Notices" icon={Megaphone} />
            <div className="mt-3 flex flex-col gap-3">
              {noticesLoading &&
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              {notices?.length === 0 && !noticesLoading && (
                <EmptyLine text="No notices right now." />
              )}
              {notices?.map((n) => (
                <NoticeCard key={n.id} notice={n} />
              ))}
            </div>
          </section>
        </div>

        {/* Right rail (desktop) / trailing stack (mobile) */}
        <aside className="mt-8 flex min-w-0 flex-col gap-5 lg:mt-1">
          {/* Upcoming events */}
          <section>
            <SectionHeader title="Upcoming" icon={CalendarClock} />
            <div className="mt-3 flex flex-col gap-3">
              {eventsLoading &&
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              {events?.length === 0 && !eventsLoading && (
                <EmptyLine text="Nothing scheduled soon." />
              )}
              {events?.map((e) => (
                <button
                  key={e.id}
                  onClick={() => navigate('/study/calendar')}
                  className="w-full text-left"
                >
                  <EventRow event={e} />
                </button>
              ))}
            </div>
          </section>

          <p className="flex items-center justify-center gap-1.5 px-2 text-caption text-ink-tertiary">
            Community content is always labelled until verified.
          </p>
        </aside>
      </div>
    </div>
  )
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-ink-tertiary" aria-hidden />
        <h2 className="font-heading text-body-lg text-ink">{title}</h2>
      </div>
    </div>
  )
}

function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <Card as="neu" className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <Pill tone={NOTICE_TONE[notice.category]} className="capitalize">
            {notice.category}
          </Pill>
          <span className="text-caption text-ink-tertiary">{formatDate(notice.published_at)}</span>
        </div>
        <h3 className="text-body font-semibold text-ink">{notice.title}</h3>
        <p className="mt-0.5 line-clamp-2 text-body-sm text-ink-secondary">{notice.body}</p>
      </div>
      <ChevronRight className="mt-1 size-4 shrink-0 text-ink-tertiary/60" aria-hidden />
    </Card>
  )
}

function EventRow({ event }: { event: AcademicEvent }) {
  const d = new Date(event.date)
  return (
    <Card as="neu" className="flex w-full items-center gap-3 !py-3">
      <div className="neu-inset-sm flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
        <span className="text-caption font-semibold uppercase leading-none">
          {d.toLocaleString('en', { month: 'short' })}
        </span>
        <span className="tnum text-h3 leading-tight">{d.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-ink">{event.title}</p>
        <p className="text-caption capitalize text-ink-tertiary">{event.type}</p>
      </div>
    </Card>
  )
}

function EmptyLine({ text }: { text: string }) {
  return (
    <Card as="neu" className="text-center !py-6">
      <p className="text-body-sm text-ink-tertiary">{text}</p>
    </Card>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short' })
}
