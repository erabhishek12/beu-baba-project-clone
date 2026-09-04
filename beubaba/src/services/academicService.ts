/**
 * Academic taxonomy service — documented contract (docs 09, 11, 12/13).
 * Data-driven: courses/branches/semesters/subjects come from seeded content,
 * never hardcoded in components.
 */
import type { Branch, Course, Semester, Subject } from '@/types/domain'
import { academicDb } from '@/services/mock/db'
import { delay } from '@/services/storage'

export const academicService = {
  async listCourses(): Promise<Course[]> {
    await delay(80)
    return academicDb.courses()
  },
  async listBranches(courseId?: string): Promise<Branch[]> {
    await delay(80)
    return academicDb.branches(courseId)
  },
  async listSemesters(): Promise<Semester[]> {
    await delay(60)
    return academicDb.semesters()
  },
  async listSubjects(branchId?: string, semesterId?: string): Promise<Subject[]> {
    await delay(80)
    return academicDb.subjects(branchId, semesterId)
  },
  stats() {
    return academicDb.stats()
  },
}
