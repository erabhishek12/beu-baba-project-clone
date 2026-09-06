import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, FileStack, Flag, ChevronRight, ChevronLeft, LayoutDashboard, Megaphone, BookOpen, FileJson, ClipboardCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { useAuth } from '@/app/providers/AuthProvider'
import { resourceService } from '@/services/resourceService'
import { reportService } from '@/services/reportService'
import { adminService } from '@/services/adminService'
import { Users, Activity } from 'lucide-react'

/**
 * Admin panel home (spec §17 Moderation, §22 Administrative Content Control).
 * Privileged route (RequireAdmin). A calm operations hub — surfaces the two
 * moderation queues with live pending counts and links into each.
 */
export function AdminHomePage() {
  const navigate = useNavigate()
  const { user, roles } = useAuth()

  // Real counts, straight from the database (head-only queries, no row downloads).
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.stats(),
  })

  const { data: pendingResources } = useQuery({
    queryKey: ['admin', 'resources', 'pending'],
    queryFn: () => resourceService.listQueue('pending'),
  })
  const { data: openReports } = useQuery({
    queryKey: ['admin', 'reports', 'open'],
    queryFn: async () => (await reportService.listAll()).filter((r) => r.status === 'open'),
  })

  const cards = [
    {
      key: 'resources',
      title: 'Resource moderation',
      desc: 'Review student-submitted resources before they go live.',
      icon: FileStack,
      count: pendingResources?.length ?? 0,
      countLabel: 'pending',
      to: '/admin/resources',
    },
    {
      key: 'hero',
      title: 'Home hero',
      desc: 'Edit the banner students see on the home page.',
      icon: Megaphone,
      count: 0,
      countLabel: '',
      to: '/admin/hero',
    },
    {
      key: 'import',
      title: 'Import center',
      desc: 'Validate & commit quiz / bank / syllabus / calendar JSON.',
      icon: FileJson,
      count: 0,
      countLabel: '',
      to: '/admin/import',
    },
    {
      key: 'academic',
      title: 'Academic content',
      desc: 'Notices, PYQ publication states and syllabus versions.',
      icon: BookOpen,
      count: 0,
      countLabel: '',
      to: '/admin/academic',
    },
    {
      key: 'review',
      title: 'MCQ review',
      desc: 'Verify imported questions before students ever see them.',
      icon: ClipboardCheck,
      count: 0,
      countLabel: '',
      to: '/admin/review',
    },
    {
      key: 'bulk-review',
      title: 'Bulk review',
      desc: 'Publish a whole subject at once — only questions that pass safety checks.',
      icon: ClipboardCheck,
      count: 0,
      countLabel: '',
      to: '/admin/bulk-review',
    },
    {
      key: 'users',
      title: 'Users',
      desc: 'Students, roles and account access.',
      icon: Users,
      count: stats?.students ?? 0,
      countLabel: 'accounts',
      to: '/admin/users',
    },
    {
      key: 'questions',
      title: 'Question bank',
      desc: 'Browse, filter and triage all imported questions.',
      icon: FileStack,
      count: stats?.mcqTotal ?? 0,
      countLabel: 'questions',
      to: '/admin/questions',
    },
    {
      key: 'content',
      title: 'Academic content',
      desc: 'Subjects, previous year papers and the calendar.',
      icon: BookOpen,
      count: stats?.subjects ?? 0,
      countLabel: 'subjects',
      to: '/admin/content',
    },
    {
      key: 'analytics',
      title: 'Analytics',
      desc: 'Students, questions, quiz performance and links.',
      icon: LayoutDashboard,
      count: stats?.attempts ?? 0,
      countLabel: 'attempts',
      to: '/admin/analytics',
    },
    {
      key: 'support',
      title: 'Support inbox',
      desc: 'Reply to student conversations.',
      icon: Flag,
      count: stats?.supportOpen ?? 0,
      countLabel: 'open',
      to: '/admin/support',
    },
    {
      key: 'assistant',
      title: 'AI assistant',
      desc: 'Intents and unanswered questions.',
      icon: LayoutDashboard,
      count: 0,
      countLabel: '',
      to: '/admin/assistant',
    },
    {
      key: 'notices',
      title: 'Notices',
      desc: 'Short announcements for students.',
      icon: Megaphone,
      count: stats?.notices ?? 0,
      countLabel: '',
      to: '/admin/notices',
    },
    {
      key: 'system',
      title: 'System',
      desc: 'Health checks and the audit log.',
      icon: Activity,
      count: 0,
      countLabel: '',
      to: '/admin/system',
    },
    {
      key: 'banners',
      title: 'Banners',
      desc: 'Announcements shown when students open the app.',
      icon: ClipboardCheck,
      count: 0,
      countLabel: '',
      to: '/admin/banners',
    },
    {
      key: 'reports',
      title: 'Reports',
      desc: 'Content and bug reports raised by students.',
      icon: Flag,
      count: openReports?.length ?? 0,
      countLabel: 'open',
      to: '/admin/reports',
    },
  ]

  return (
    <div className="page-x pb-8 pt-6">
      <header className="mb-5">
        <button
          onClick={() => navigate('/profile')}
          className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Profile
        </button>
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <LayoutDashboard className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-h1 text-ink">Admin panel</h1>
            <p className="mt-0.5 text-body-sm text-ink-secondary">
              Signed in as {user?.profile.full_name}
            </p>
          </div>
        </div>
      </header>

      {/* Role badges */}
      <Card as="glass" className="mb-4 flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold text-ink">Your access</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <Pill key={r} tone="accent">
                {r.replace(/_/g, ' ')}
              </Pill>
            ))}
          </div>
          <p className="mt-2 text-caption text-ink-tertiary">
            Actions here are mirrored server-side by role-based access control and RLS. The client
            guard is a convenience, never the authority.
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card
              key={c.key}
              as="glass"
              role="button"
              tabIndex={0}
              onClick={() => navigate(c.to)}
              onKeyDown={(e: React.KeyboardEvent) =>
                (e.key === 'Enter' || e.key === ' ') && navigate(c.to)
              }
              className="glass-highlight liquid-depth flex cursor-pointer items-center gap-4"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Icon className="size-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-body font-semibold text-ink">{c.title}</p>
                  {c.count > 0 && (
                    <Pill tone="warning">
                      {c.count} {c.countLabel}
                    </Pill>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-body-sm text-ink-secondary">{c.desc}</p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-ink-tertiary" aria-hidden />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
