import { useState } from 'react'
import { GraduationCap, Layers } from 'lucide-react'
import { Modal } from '@/components/glass/Modal'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/forms/SelectField'
import { profileService } from '@/services/profileService'
import { useAuth } from '@/app/providers/AuthProvider'
import { useToast } from '@/components/feedback/Toast'
import { useAcademicLabels } from './hooks'

/**
 * Edit academic identity (branch + current semester). Course is fixed for the
 * baseline program. In production some fields may be admin-locked with an
 * edit-request flow (spec §7.2) — here they are editable by the owner.
 */
export function EditAcademicModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const { branches, semesters } = useAcademicLabels()
  const [branchId, setBranchId] = useState(user?.student?.branch_id ?? '')
  const [semId, setSemId] = useState(user?.student?.current_semester_id ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function save() {
    if (!user) return
    const next: Record<string, string> = {}
    if (!branchId) next.branch = 'Select your branch'
    if (!semId) next.sem = 'Select your semester'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    setErrors({})
    setSaving(true)
    try {
      const updated = await profileService.updateAcademic(user.auth.id, {
        branch_id: branchId,
        current_semester_id: semId,
      })
      setUser(updated)
      toast.success('Academic details updated.')
      onClose()
    } catch {
      toast.error('Could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Academic details">
      <div className="flex flex-col gap-4">
        <SelectField
          label="Branch"
          placeholder="Select your branch"
          iconLeft={<GraduationCap className="size-5" />}
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          error={errors.branch}
        />
        <SelectField
          label="Current semester"
          placeholder="Select your semester"
          iconLeft={<Layers className="size-5" />}
          options={semesters.map((s) => ({ value: s.id, label: s.label }))}
          value={semId}
          onChange={(e) => setSemId(e.target.value)}
          error={errors.sem}
        />
      </div>
      <div className="mt-5 flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button fullWidth loading={saving} onClick={save}>
          Save
        </Button>
      </div>
    </Modal>
  )
}
