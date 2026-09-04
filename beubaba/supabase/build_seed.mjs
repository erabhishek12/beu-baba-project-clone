#!/usr/bin/env node
/**
 * BEU BABA — build_seed.mjs
 * Reads the mock seed JSON (the SAME real BEU dataset the app ships with) and
 * emits a single deterministic SQL file that loads all academic + product
 * content into a fresh Supabase database.
 *
 * Usage:
 *   node supabase/build_seed.mjs
 *   psql "$SUPABASE_DB_URL" -f supabase/seed/seed_data.sql
 *
 * The generated INSERTs are idempotent (on conflict do nothing) and preserve the
 * dataset's stable UUIDs so the app's deep links keep working across backends.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MOCK = join(__dirname, '..', 'src', 'services', 'mock')
const OUT_DIR = join(__dirname, 'seed')
mkdirSync(OUT_DIR, { recursive: true })

const read = (f) => JSON.parse(readFileSync(join(MOCK, f), 'utf8'))

// ---- SQL helpers -----------------------------------------------------------
const q = (v) => {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return `'${String(v).replace(/'/g, "''")}'`
}
const jsonb = (v) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`

let sql = `-- ============================================================================
-- BEU BABA — generated seed data (do not edit by hand; run build_seed.mjs)
-- Loads the real BEU academic + product dataset into Supabase.
-- ============================================================================
begin;
`

// ---- Academic master --------------------------------------------------------
const acad = read('seed_academic.json')

sql += `\n-- courses\n`
for (const c of acad.courses) {
  sql += `insert into public.courses (id,name,short_name,slug,display_order) values (${q(c.id)},${q(c.name)},${q(c.short_name)},${q(c.slug)},${q(c.display_order ?? 0)}) on conflict (id) do nothing;\n`
}

sql += `\n-- semesters\n`
for (const s of acad.semesters) {
  sql += `insert into public.semesters (id,number,label) values (${q(s.id)},${q(s.number)},${q(s.label)}) on conflict (id) do nothing;\n`
}

sql += `\n-- branches\n`
for (const b of acad.branches) {
  sql += `insert into public.branches (id,course_id,name,short_name,slug,display_order) values (${q(b.id)},${q(b.course_id)},${q(b.name)},${q(b.short_name)},${q(b.slug)},${q(b.display_order ?? 0)}) on conflict (id) do nothing;\n`
}

// semester number lookup for subjects
const semNum = new Map(acad.semesters.map((s) => [s.id, s.number]))

sql += `\n-- subjects\n`
for (const s of acad.subjects) {
  // Empty/whitespace codes -> NULL so the (branch,sem,code) uniqueness index
  // (which excludes NULL) does not collide across code-less lab/elective rows.
  const code = s.code && String(s.code).trim() ? String(s.code).trim() : null
  sql += `insert into public.subjects (id,course_id,branch_id,semester_id,semester_number,code,name,credits,display_order) values (${q(s.id)},${q(acad.courses[0]?.id)},${q(s.branch_id)},${q(s.semester_id)},${q(semNum.get(s.semester_id) ?? null)},${q(code)},${q(s.name)},${q(s.credits ?? null)},0) on conflict (id) do nothing;\n`
}

// ---- Syllabus (unit-wise detail, keyed by subject id) -----------------------
let syl = {}
try {
  syl = read('seed_syllabus_detail.json')
} catch {
  /* optional */
}
sql += `\n-- syllabus + versions (only for subjects that exist in the dataset)\n`
const subjectIds = new Set(acad.subjects.map((s) => s.id))
for (const [subjectId, detail] of Object.entries(syl)) {
  if (!subjectIds.has(subjectId)) continue
  // one syllabus row per subject; embed units as a v1 version
  sql += `with s as (insert into public.syllabus (subject_id,current_version) select ${q(subjectId)},1 where exists (select 1 from public.subjects where id=${q(subjectId)}) on conflict do nothing returning id)\n`
  sql += `insert into public.syllabus_versions (syllabus_id,version,units) select id,1,${jsonb(detail.units ?? [])} from s;\n`
}

// ---- PYQs -------------------------------------------------------------------
let pyqMeta = []
try {
  pyqMeta = read('seed_pyq_meta.json')
} catch {
  /* optional */
}
sql += `\n-- pyqs (metadata; full blocks loaded separately if needed)\n`
for (const p of pyqMeta) {
  sql += `insert into public.pyqs (id,subject_code,subject_name,semester_number,exam_year,title,source_url) values (${q(p.id)},${q(p.subject_code ?? null)},${q(p.subject_name ?? null)},${q(p.semester ?? null)},${q(p.year ?? p.exam_year ?? null)},${q(p.title ?? p.subject_name ?? 'PYQ')},${q(p.url ?? p.source_url ?? null)}) on conflict (id) do nothing;\n`
}

// ---- Quizzes + questions + options -----------------------------------------
const quizMeta = read('seed_quiz_meta.json')
const quizQ = read('seed_quiz_questions.json')
const byId = new Map(quizQ.map((x) => [x.id, x]))

sql += `\n-- quizzes\n`
for (const z of quizMeta) {
  // stable uuid via md5 of the mock id keeps deep links working
  sql += `insert into public.quizzes (id,title,subject_code,subject_name,semester_number,unit_label,difficulty,duration_seconds,negative_marking,status,current_version) values (md5(${q(z.id)})::uuid,${q(z.title)},${q(z.subject_code ?? null)},${q(z.subject_name ?? null)},${q(z.semester ?? null)},${q('Unit ' + ((z.unit_index ?? 0) + 1))},${q(z.difficulty ?? 'medium')},${q(z.duration_sec ?? 600)},${q(z.negative_marking ?? 0)},'published',1) on conflict (id) do nothing;\n`

  const qids = z.question_ids ?? []
  qids.forEach((qid, i) => {
    const question = byId.get(qid)
    if (!question) return
    sql += `insert into public.quiz_questions (id,quiz_id,version,prompt,explanation,question_type,display_order) values (md5(${q(qid)})::uuid,md5(${q(z.id)})::uuid,1,${q(question.stem)},${q(question.explanation ?? null)},${q(question.type ?? 'single')},${q(i)}) on conflict (id) do nothing;\n`
    ;(question.options ?? []).forEach((label, oi) => {
      const isCorrect = oi === question.correct_index
      sql += `insert into public.quiz_options (id,question_id,label,is_correct,display_order) values (md5(${q(qid + ':' + oi)})::uuid,md5(${q(qid)})::uuid,${q(label)},${isCorrect ? 'true' : 'false'},${q(oi)}) on conflict (id) do nothing;\n`
    })
  })
}

// ---- Product data: gov exams, portals, colleges ----------------------------
const gov = read('seed_gov_exams.json')
sql += `\n-- gov exams\n`
gov.forEach((g, i) => {
  sql += `insert into public.gov_exams (category,name,summary,content,links,display_order) values (${q(g.category)},${q(g.name)},${q(g.summary ?? null)},${jsonb(g.sections ?? g.content ?? [])},${jsonb(g.links ?? [])},${q(i)}) on conflict do nothing;\n`
})

const portals = read('seed_portals.json')
sql += `\n-- portals\n`
let pOrder = 0
for (const [groupKey, group] of Object.entries(portals)) {
  for (const item of group.items ?? []) {
    sql += `insert into public.portals (group_key,group_title,name,url,description,semester,display_order) values (${q(groupKey)},${q(group.title ?? groupKey)},${q(item.name)},${q(item.url)},${q(item.desc ?? null)},${q(item.sem ?? null)},${q(pOrder++)}) on conflict do nothing;\n`
  }
}

const colleges = read('seed_colleges.json')
sql += `\n-- colleges\n`
colleges.forEach((c, i) => {
  sql += `insert into public.colleges (name,code,location,url,display_order) values (${q(c.name)},${q(c.code ?? null)},${q(c.location ?? c.host ?? null)},${q(c.url ?? null)},${q(i)}) on conflict do nothing;\n`
})

sql += `\ncommit;\n`

const outFile = join(OUT_DIR, 'seed_data.sql')
writeFileSync(outFile, sql)

// small stats footer for the operator
const lines = sql.split('\n').length
console.log(`Wrote ${outFile}`)
console.log(`  ${acad.courses.length} courses, ${acad.branches.length} branches, ${acad.subjects.length} subjects`)
console.log(`  ${Object.keys(syl).length} syllabus subjects, ${pyqMeta.length} pyqs`)
console.log(`  ${quizMeta.length} quizzes, ${quizQ.length} questions`)
console.log(`  ${gov.length} gov exams, ${colleges.length} colleges`)
console.log(`  ${lines} SQL lines`)
