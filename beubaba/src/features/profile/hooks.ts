import { useQuery } from '@tanstack/react-query'
import { academicService } from '@/services/academicService'

/** Resolves branch + semester display names for the current student. */
export function useAcademicLabels(branchId?: string | null, semesterId?: string | null) {
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => academicService.listBranches(),
  })
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => academicService.listSemesters(),
  })
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => academicService.listCourses(),
  })

  return {
    courseName: courses[0]?.name,
    branchName: branches.find((b) => b.id === branchId)?.name,
    semesterName: semesters.find((s) => s.id === semesterId)?.label,
    branches,
    semesters,
    courses,
  }
}
