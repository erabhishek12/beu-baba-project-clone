import { GraduationCap, Layers } from 'lucide-react'
import type { Branch, Semester } from '@/types/domain'
import { SelectField } from '@/components/forms/SelectField'

interface ContextPickerProps {
  branches: Branch[]
  semesters: Semester[]
  branchId: string
  semesterId: string
  onBranch: (id: string) => void
  onSemester: (id: string) => void
  /** Hide the semester selector (e.g. PYQs filter by number separately). */
  showSemester?: boolean
  branchLabel?: string
  semesterLabel?: string
}

/** Shared branch/semester selector used across the Study tabs. */
export function ContextPicker({
  branches,
  semesters,
  branchId,
  semesterId,
  onBranch,
  onSemester,
  showSemester = true,
  branchLabel = 'Branch',
  semesterLabel = 'Semester',
}: ContextPickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SelectField
        label={branchLabel}
        placeholder="Select branch"
        value={branchId}
        onChange={(e) => onBranch(e.target.value)}
        iconLeft={<GraduationCap className="size-4" />}
        options={branches.map((b) => ({ value: b.id, label: b.name }))}
      />
      {showSemester && (
        <SelectField
          label={semesterLabel}
          placeholder="Select semester"
          value={semesterId}
          onChange={(e) => onSemester(e.target.value)}
          iconLeft={<Layers className="size-4" />}
          options={semesters.map((s) => ({ value: s.id, label: s.label }))}
        />
      )}
    </div>
  )
}
