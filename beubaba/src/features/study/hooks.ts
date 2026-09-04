import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/providers/AuthProvider'
import { academicService } from '@/services/academicService'

/**
 * Study-area academic context. Defaults to the signed-in student's branch and
 * current semester, but is locally overridable (a student may browse another
 * branch/semester without changing their profile).
 */
export function useStudyContext() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const defaultBranch = user?.student?.branch_id ?? ''
  const defaultSemester = user?.student?.current_semester_id ?? ''
  // Deep links (e.g. /study/syllabus?branch=<id>&sem=<id>) preselect context.
  const initialBranch = params.get('branch') || defaultBranch
  const initialSemester = params.get('sem') || defaultSemester

  const [branchId, setBranchId] = useState(initialBranch)
  const [semesterId, setSemesterId] = useState(initialSemester)

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => academicService.listBranches(),
  })
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => academicService.listSemesters(),
  })

  const branch = useMemo(() => branches.find((b) => b.id === branchId), [branches, branchId])
  const semester = useMemo(
    () => semesters.find((s) => s.id === semesterId),
    [semesters, semesterId],
  )

  return {
    branchId,
    semesterId,
    setBranchId,
    setSemesterId,
    branch,
    semester,
    branches,
    semesters,
    isProfileDefault: branchId === defaultBranch && semesterId === defaultSemester,
  }
}
