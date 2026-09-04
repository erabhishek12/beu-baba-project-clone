import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')

const phone = z
  .string()
  .trim()
  .min(10, 'Enter a valid contact number')
  .max(15, 'Enter a valid contact number')
  .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid contact number')

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const accountStepSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Enter your full name'),
    email,
    phone,
    password,
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  })
export type AccountStepValues = z.infer<typeof accountStepSchema>

export const academicStepSchema = z.object({
  course_id: z.string().min(1, 'Select your course'),
  branch_id: z.string().min(1, 'Select your branch'),
  semester_id: z.string().min(1, 'Select your semester'),
})
export type AcademicStepValues = z.infer<typeof academicStepSchema>

export const profileStepSchema = z.object({
  gender: z.enum(['male', 'female', 'unspecified']),
  avatar_type: z.enum(['generated', 'uploaded']),
  avatar_character_id: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
})
export type ProfileStepValues = z.infer<typeof profileStepSchema>

export const forgotSchema = z.object({ email })

/** Utility: run a zod schema and return a field->message map. */
export function collectErrors(
  result: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of result.issues) {
    const key = String(issue.path[0] ?? '')
    if (key && !out[key]) out[key] = issue.message
  }
  return out
}
