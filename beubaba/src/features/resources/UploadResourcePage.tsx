import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/forms/TextField'
import { SelectField } from '@/components/forms/SelectField'
import { AttachmentPicker } from '@/components/forms/AttachmentPicker'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/app/providers/AuthProvider'
import { useUserId } from '@/features/quiz/hooks'
import { resourceService, RESOURCE_TYPES } from '@/services/resourceService'
import { IMAGE_TYPES, DOC_TYPES } from '@/lib/media'
import type { ResourceType } from '@/types/domain'
import type { Attachment } from '@/lib/media'

export function UploadResourcePage() {
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const isEdit = !!editId
  const toast = useToast()
  const userId = useUserId()
  const { user } = useAuth()
  const ownerName = user?.profile.full_name ?? 'Student'

  const [type, setType] = useState<ResourceType>('notes')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [semester, setSemester] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [url, setUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  const isLink = type === 'link'

  // Prefill in edit mode.
  useEffect(() => {
    if (!editId) return
    let alive = true
    resourceService.get(editId).then((r) => {
      if (!alive || !r) {
        setLoading(false)
        return
      }
      setType(r.type)
      setTitle(r.title)
      setSubject(r.subject_name ?? '')
      setSemester(r.semester ? String(r.semester) : '')
      setDescription(r.description)
      setTags(r.tags.join(', '))
      setAttachment(r.attachment ?? null)
      setUrl(r.url ?? '')
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [editId])

  async function submit() {
    const next: Record<string, string> = {}
    if (title.trim().length < 3) next.title = 'Give your resource a clear title.'
    if (isLink) {
      if (!/^https?:\/\/.+/i.test(url.trim())) next.url = 'Enter a valid link starting with http.'
    } else if (!attachment) {
      next.attachment = 'Attach a file to share.'
    }
    setErrors(next)
    if (Object.keys(next).length) return

    const payload = {
      title,
      type,
      subject_name: subject.trim() || null,
      semester: semester ? Number(semester) : null,
      description,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      attachment: isLink ? null : attachment,
      url: isLink ? url.trim() : null,
    }

    setSaving(true)
    try {
      if (isEdit && editId) {
        await resourceService.update(userId, editId, payload)
        toast.success('Resubmitted for review', 'Your changes are pending review.')
      } else {
        await resourceService.create(userId, ownerName, payload)
        toast.success('Submitted for review', 'We\u2019ll notify you once it\u2019s approved.')
      }
      navigate('/resources/mine')
    } catch {
      toast.error('Could not submit', 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-x pb-8 pt-6">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-x pb-8 pt-6">
      <button
        onClick={() => navigate('/resources/mine')}
        className="mb-3 flex items-center gap-1 text-body-sm font-semibold text-ink-secondary"
      >
        <ChevronLeft className="size-4" aria-hidden />
        My uploads
      </button>
      <h1 className="text-h1 text-ink">{isEdit ? 'Edit resource' : 'Share a resource'}</h1>

      <Card as="glass" className="mt-4 flex items-start gap-3 border border-accent/20 bg-accent-soft/40">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <p className="text-body-sm text-ink-secondary">
          Every submission is reviewed by the team before it appears in the library. Please share
          only content you have the right to distribute.
        </p>
      </Card>

      <div className="mt-5 flex flex-col gap-4">
        <SelectField
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          options={RESOURCE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
        />
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Data Structures — Unit 3 notes"
          error={errors.title}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Optional"
          />
          <SelectField
            label="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="Optional"
            options={Array.from({ length: 8 }, (_, i) => ({
              value: String(i + 1),
              label: `Semester ${i + 1}`,
            }))}
          />
        </div>

        {isLink ? (
          <TextField
            label="Link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            error={errors.url}
          />
        ) : (
          <div>
            <label className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
              File
            </label>
            <AttachmentPicker
              value={attachment}
              onChange={setAttachment}
              accept={[...IMAGE_TYPES, ...DOC_TYPES]}
              label="Choose a file"
              hint="JPG, PNG, WebP or PDF up to 8 MB."
            />
            {errors.attachment && (
              <p className="mt-1.5 text-caption text-danger" role="alert">
                {errors.attachment}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="res-desc"
            className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary"
          >
            Description
          </label>
          <textarea
            id="res-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this cover? Who is it useful for?"
            className="w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none placeholder:text-ink-tertiary focus:border-accent"
          />
        </div>
        <TextField
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Comma separated, e.g. unit-3, exam, important"
          hint="Optional — helps others find it."
        />

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={() => navigate('/resources')} disabled={saving}>
            Cancel
          </Button>
          <Button fullWidth onClick={submit} loading={saving}>
            {isEdit ? 'Resubmit for review' : 'Submit for review'}
          </Button>
        </div>
      </div>
    </div>
  )
}
