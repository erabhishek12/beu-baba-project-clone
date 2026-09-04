import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Camera, ChevronRight } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { Avatar } from '@/components/ui/Avatar'
import { AppIcon } from '@/components/ui/AppIcon'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { AvatarPickerModal } from './AvatarPickerModal'
import { EditProfileModal } from './EditProfileModal'
import { EditAcademicModal } from './EditAcademicModal'
import { useAcademicLabels } from './hooks'
import { bookmarkService } from '@/services/bookmarkService'
import { resourceService } from '@/services/resourceService'
import { quizService } from '@/services/quizService'
import { useUserId } from '@/features/quiz/hooks'
import { cn } from '@/lib/cn'

export function ProfilePage() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const userId = useUserId()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [acadOpen, setAcadOpen] = useState(false)
  const { courseName, branchName, semesterName } = useAcademicLabels(
    user?.student?.branch_id,
    user?.student?.current_semester_id,
  )

  const { data: savedCount = 0 } = useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => bookmarkService.list(userId),
    select: (b) => b.length,
  })
  const { data: uploadCount = 0 } = useQuery({
    queryKey: ['my-resources', userId],
    queryFn: () => resourceService.listMine(userId),
    select: (r) => r.length,
  })
  const { data: quizCount = 0 } = useQuery({
    queryKey: ['quiz-history', userId],
    queryFn: () => quizService.history(userId),
    select: (a) => a.length,
  })

  if (!user) return null
  const p = user.profile

  // Profile completion (based on present, non-forced fields).
  const fields = [p.full_name, p.email, p.phone, user.student?.branch_id, user.student?.current_semester_id, p.bio]
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100)

  return (
    <div className="page-x pb-8 pt-6">

      {/* Identity card */}
      <Card className="mt-5" as="strong">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar profile={p} size="xl" />
            <button
              onClick={() => setAvatarOpen(true)}
              aria-label="Change profile picture"
              className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-accent text-white shadow-soft ring-2 ring-canvas"
            >
              <Camera className="size-4" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-h2 text-ink">{p.full_name}</h2>
            {p.bio ? (
              <p className="mt-0.5 line-clamp-2 text-body-sm text-ink-secondary">{p.bio}</p>
            ) : (
              <p className="mt-0.5 text-body-sm text-ink-tertiary">Add a short bio</p>
            )}
            <div className="mt-2">
              <Button size="sm" variant="secondary" iconLeft={<Pencil className="size-4" />} onClick={() => setEditOpen(true)}>
                Edit profile
              </Button>
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-body-sm">
            <span className="text-ink-secondary">Profile {completion}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-pill bg-surface-secondary">
            <div
              className="h-full rounded-pill bg-accent transition-[width] duration-slow"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard icon="trophy" tile="bb-tile-peach" label="Quizzes" value={String(quizCount)} onClick={() => navigate('/quiz/history')} />
        <StatCard icon="bookmark" tile="bb-tile-lav" label="Saved" value={String(savedCount)} onClick={() => navigate('/saved')} />
        <StatCard icon="upload" tile="bb-tile-mint" label="Uploads" value={String(uploadCount)} onClick={() => navigate('/resources/mine')} />
      </div>

      {/* Academic identity */}
      <div className="mt-6">
        <SectionHeader title="Academic" action="Edit" onAction={() => setAcadOpen(true)} />
        <Card className="mt-2 divide-y divide-line/70 !p-0">
          <InfoRow icon="crown" label="Course" value={courseName ?? '—'} />
          <InfoRow icon="branch" label="Branch" value={branchName ?? '—'} />
          <InfoRow
            icon="layers"
            label="Semester"
            value={semesterName ?? '—'}
            trailing={user.student?.admission_year ? <Pill>{`Batch ${user.student.admission_year}`}</Pill> : undefined}
          />
        </Card>
      </div>

      {/* Contact */}
      <div className="mt-6">
        <SectionHeader title="Contact" />
        <Card className="mt-2 divide-y divide-line/70 !p-0">
          <InfoRow icon="email" label="Email" value={p.email} />
          <InfoRow icon="phone" label="Phone" value={p.phone || '—'} />
        </Card>
      </div>

      {/* Library & more */}
      <div className="mt-6">
        <SectionHeader title="Library" />
        <Card className="mt-2 divide-y divide-line/70 !p-0">
          <NavRow icon="bookmark" label="Saved" onClick={() => navigate('/saved')} />
          <NavRow icon="resources" label="Resources" onClick={() => navigate('/resources')} />
          <NavRow icon="chat" label="Developer support" onClick={() => navigate('/support')} />
        </Card>
      </div>

      {isAdmin && (
        <div className="mt-6">
          <SectionHeader title="Administration" />
          <Card className="mt-2 divide-y divide-line/70 !p-0">
            <NavRow
              icon="grid"
              label="Admin panel"
              onClick={() => navigate('/admin')}
            />
          </Card>
        </div>
      )}

      <div className="mt-6">
        <SectionHeader title="More" />
        <Card className="mt-2 divide-y divide-line/70 !p-0">
          <NavRow icon="toolbox" label="Settings" onClick={() => navigate('/settings')} />
          <NavRow icon="heart" label="About the developer" onClick={() => navigate('/about/developer')} />
          <NavRow icon="info" label="About BEU BABA" onClick={() => navigate('/about')} />
          <NavRow icon="shield" label="Privacy Policy" onClick={() => navigate('/privacy')} />
        </Card>
      </div>

      {/* Account */}
      <div className="mt-6">
        <SectionHeader title="Account" />
        <Card className="mt-2 !p-0">
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left transition-colors hover:bg-danger-soft"
          >
            <AppIcon name="logout" className="size-10 shrink-0" />
            <span className="flex-1 text-body font-semibold text-danger">Sign out</span>
          </button>
        </Card>
      </div>

      <AvatarPickerModal open={avatarOpen} onClose={() => setAvatarOpen(false)} />
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <EditAcademicModal open={acadOpen} onClose={() => setAcadOpen(false)} />
    </div>
  )
}

function StatCard({
  icon,
  tile,
  label,
  value,
  onClick,
}: {
  icon: string
  tile: string
  label: string
  value: string
  onClick?: () => void
}) {
  return (
    <Card
      as="glass"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
      className={cn(
        'flex flex-col items-center gap-1 !p-3 text-center',
        onClick && 'cursor-pointer transition-transform active:scale-[0.97]',
      )}
    >
      <span className={cn('flex size-14 items-center justify-center rounded-2xl', tile)}>
        <AppIcon name={icon} className="size-11" />
      </span>
      <span className="tnum font-heading text-h2 text-ink">{value}</span>
      <span className="text-caption font-semibold text-ink-secondary">{label}</span>
    </Card>
  )
}

function NavRow({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-secondary/60"
    >
      <AppIcon name={icon} className="size-10 shrink-0" />
      <span className="flex-1 text-body font-semibold text-ink">{label}</span>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft">
        <ChevronRight className="size-4 text-accent-ink" aria-hidden />
      </span>
    </button>
  )
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <h3 className="text-label uppercase tracking-wide text-ink-tertiary">{title}</h3>
      {action && (
        <button onClick={onAction} className="text-body-sm font-semibold text-accent hover:text-accent-strong">
          {action}
        </button>
      )}
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  trailing,
  className,
}: {
  icon: string
  label: string
  value: string
  trailing?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', className)}>
      <AppIcon name={icon} className="size-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-caption text-ink-tertiary">{label}</p>
        <p className="truncate text-body font-medium text-ink">{value}</p>
      </div>
      {trailing ?? <ChevronRight className="size-4 text-ink-tertiary/50" aria-hidden />}
    </div>
  )
}
