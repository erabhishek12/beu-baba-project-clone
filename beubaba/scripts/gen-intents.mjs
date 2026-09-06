/**
 * Generate the chatbot intent catalog (spec §24: 500+ intents).
 *
 * The spec is explicit: "500+ intents must be meaningful and structured, not
 * 500 duplicated phrases." So this builds intents from real app structure —
 * every route, every tool, every external resource — and gives each one a set
 * of genuinely different ways a student might ask for it.
 *
 * Output: src/services/chatbot/intents.generated.ts
 *
 * Re-run with: node scripts/gen-intents.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs'

/** @type {{key:string,category:string,title:string,action:string,target:string,phrases:string[],answer?:string}[]} */
const intents = []

function add(key, category, title, action, target, phrases, answer) {
  intents.push({ key, category, title, action, target, phrases, answer })
}

/* ------------------------------------------------------------ navigation -- */
const NAV = [
  ['home', 'Home', '/', ['home', 'go home', 'open home', 'main screen', 'dashboard', 'take me home', 'front page']],
  ['study', 'Study', '/study', ['study', 'open study', 'study section', 'study material', 'learning', 'start studying']],
  ['quiz', 'Quizzes', '/quiz', ['quiz', 'quizzes', 'open quiz', 'practice', 'mcq', 'test', 'practise questions', 'take a quiz']],
  ['quiz_history', 'Quiz history', '/quiz/history', ['quiz history', 'my quizzes', 'past quizzes', 'previous attempts', 'my attempts', 'show my previous quizzes', 'earlier tests']],
  ['tools', 'Tools', '/tools', ['tools', 'open tools', 'toolbox', 'utilities', 'helpers']],
  ['toolbox', 'Toolbox', '/tools/toolbox', ['toolbox', 'calculators', 'open toolbox', 'all tools']],
  ['results', 'Results', '/tools/results', ['results', 'my result', 'beu result', 'check result', 'exam result', 'result portal']],
  ['portals', 'Portals', '/tools/portals', ['portals', 'official portals', 'beu website', 'university links']],
  ['exams', 'Government exams', '/tools/exams', ['government exams', 'gov exams', 'competitive exams', 'gate', 'psu exams', 'sarkari exam']],
  ['colleges', 'Colleges', '/tools/colleges', ['colleges', 'college list', 'beu colleges', 'engineering colleges', 'college directory']],
  ['resources', 'Resources', '/resources', ['resources', 'notes', 'study material', 'pdfs', 'shared notes', 'downloads', 'where are my notes']],
  ['my_uploads', 'My uploads', '/resources/mine', ['my uploads', 'my resources', 'things i uploaded', 'my shared notes']],
  ['upload', 'Upload a resource', '/resources/upload', ['upload', 'upload notes', 'share notes', 'add resource', 'contribute notes']],
  ['saved', 'Saved items', '/saved', ['saved', 'bookmarks', 'my saved', 'saved items', 'library', 'favourites', 'show my saved questions']],
  ['search', 'Search', '/search', ['search', 'find', 'look up', 'search the app']],
  ['profile', 'Profile', '/profile', ['profile', 'my profile', 'my account', 'account details']],
  ['settings', 'Settings', '/settings', ['settings', 'preferences', 'options', 'app settings', 'change settings']],
  ['notifications', 'Notifications', '/notifications', ['notifications', 'alerts', 'my notifications', 'updates', 'notices for me']],
  ['support', 'Developer support', '/support', ['support', 'help', 'contact developer', 'message developer', 'talk to developer', 'report a problem', 'how can i contact the developer']],
  ['reports', 'My reports', '/support/reports', ['my reports', 'reported items', 'my complaints']],
  ['about', 'About BEU BABA', '/about', ['about', 'about app', 'what is beu baba', 'app info']],
  ['about_dev', 'About the developer', '/about/developer', ['about developer', 'who made this', 'developer info', 'creator']],
  ['privacy', 'Privacy policy', '/privacy', ['privacy', 'privacy policy', 'data policy', 'terms']],
]
for (const [k, title, target, phrases] of NAV) {
  add(`nav.${k}`, 'navigation', title, 'navigate', target, phrases)
}

/* ------------------------------------------------- study / academic areas -- */
const STUDY = [
  ['syllabus', 'Syllabus', '/study', ['syllabus', 'open syllabus', 'course syllabus', 'show syllabus', 'btech syllabus', 'open b.tech syllabus', 'unit list', 'topics']],
  ['pyq', 'Previous year questions', '/study', ['pyq', 'previous year questions', 'past papers', 'question papers', 'old papers', 'find previous-year questions', 'previous papers']],
  ['calendar', 'Academic calendar', '/study', ['calendar', 'academic calendar', 'exam dates', 'holidays', 'show upcoming holidays', 'holiday list', 'when is the exam', 'semester dates']],
  ['subjects', 'Subjects', '/study', ['subjects', 'my subjects', 'subject list', 'papers', 'courses']],
]
for (const [k, title, target, phrases] of STUDY) {
  add(`study.${k}`, 'academic', title, 'navigate', target, phrases)
}

/* -------------------------------------------------- external study sites -- */
add('external.doubt_desk', 'external', 'Doubt Desk', 'external', 'https://doubt-desk.onrender.com',
  ['doubt desk', 'open doubt desk', 'ask a doubt', 'doubt solving', 'clear my doubt', 'doubt help', 'solve my doubt'])
add('external.javasourcecode', 'external', 'JavaSourceCode', 'external', 'http://javasourcecode.in/',
  ['javasourcecode', 'java source code', 'open javasourcecode', 'programming notes', 'coding material', 'java notes', 'programming resources'])
add('external.study_hub', 'external', 'Study Hub', 'external', 'https://erabhi.in/studyHub/',
  ['study hub', 'open study hub', 'studyhub', 'extra study material', 'more resources'])
add('nav.collaborate', 'external', 'Study collaboration', 'navigate', '/tools/collaborate',
  ['collaborate', 'study collaboration', 'external resources', 'external sites', 'partner sites', 'other study websites', 'study links'])

/* ------------------------------------------------------------- app help --- */
const HELP = [
  ['how_quiz', 'How do I take a quiz?', 'Open Quiz, pick a subject, then press Start. You get questions one at a time with a timer; answers save automatically as you go.'],
  ['how_bookmark', 'How do I save something?', 'Tap the bookmark icon on any paper, subject or resource. Everything you save appears under Saved.'],
  ['how_upload', 'How do I upload notes?', 'Go to Resources → Upload. Your file goes to a moderation queue and appears publicly once it is approved.'],
  ['how_result', 'How do I check my result?', 'Open Tools → Results. It links to the official BEU result portal.'],
  ['how_offline', 'Does the app work offline?', 'Yes. Once installed, the app opens and works offline. New quiz questions still need internet because they come from the server.'],
  ['how_install', 'How do I install the app?', 'Open the site in your phone browser, then choose "Install app" or "Add to home screen" from the browser menu.'],
  ['how_password', 'How do I change my password?', 'Open Settings → Account, or use "Forgot password?" on the login screen.'],
  ['how_dark', 'How do I turn on dark mode?', 'Use the sun/moon button in the header, or Settings → Appearance.'],
  ['how_negative', 'Is there negative marking?', 'It depends on the quiz. The rules are shown on the quiz screen before you start.'],
  ['how_cgpa', 'How do I calculate CGPA?', 'Open Tools → Toolbox → CGPA calculator.'],
  ['how_report', 'How do I report a mistake?', 'Use the report option on the content, or open Support → Reports.'],
  ['how_revision', 'How do I revise?', 'After a quiz, open Review answers to see the correct answer and an explanation for each question.'],
]
for (const [k, title, answer] of HELP) {
  const q = title.toLowerCase().replace(/\?$/, '')
  add(`help.${k}`, 'help', title, 'answer', '', [q, q.replace(/^how do i /, ''), q.replace(/^how do i /, 'how to ')], answer)
}

/* ----------------------------------------------- per-subject shortcut set -- */
// Common BEU subjects students ask for by name or short form. Each becomes a
// real intent that opens the quiz/search for that subject.
const SUBJECTS = [
  ['dbms', 'Database Management System', ['dbms', 'database', 'database management', 'dbms notes', 'where can i find dbms']],
  ['os', 'Operating System', ['os', 'operating system', 'operating systems']],
  ['dsa', 'Data Structure and Algorithms', ['dsa', 'data structure', 'data structures', 'algorithms']],
  ['cn', 'Computer Networks', ['cn', 'computer network', 'computer networks', 'networking']],
  ['coa', 'Computer Organization', ['coa', 'computer organization', 'computer organisation', 'computer architecture']],
  ['ai', 'Artificial Intelligence', ['ai', 'artificial intelligence']],
  ['toc', 'Theory of Computation', ['toc', 'theory of computation', 'automata']],
  ['maths1', 'Mathematics-I', ['maths 1', 'mathematics 1', 'm1', 'engineering mathematics 1', 'calculus']],
  ['maths2', 'Mathematics-II', ['maths 2', 'mathematics 2', 'm2', 'engineering mathematics 2']],
  ['physics', 'Physics', ['physics', 'engineering physics', 'ep']],
  ['chemistry', 'Chemistry', ['chemistry', 'engineering chemistry']],
  ['bee', 'Basic Electrical Engineering', ['bee', 'basic electrical', 'electrical engineering basics']],
  ['pps', 'Programming for Problem Solving', ['pps', 'programming for problem solving', 'c programming']],
  ['thermo', 'Thermodynamics', ['thermodynamics', 'thermo', 'applied thermodynamics']],
  ['som', 'Strength of Materials', ['som', 'strength of materials', 'mechanics of materials']],
  ['fm', 'Fluid Mechanics', ['fm', 'fluid mechanics', 'fluids']],
  ['surveying', 'Surveying', ['surveying', 'survey']],
  ['transportation', 'Transportation Engineering', ['transportation', 'transportation engineering', 'highway engineering']],
  ['analog', 'Analog Electronics', ['analog', 'analog electronics']],
  ['digital', 'Digital Electronics', ['digital electronics', 'dld', 'digital logic']],
  ['machine_design', 'Design of Machine Elements', ['machine design', 'design of machine elements', 'dme']],
  ['rac', 'Refrigeration and Air Conditioning', ['rac', 'refrigeration', 'air conditioning']],
  ['workshop', 'Workshop', ['workshop', 'workshop practice']],
  ['graphics', 'Engineering Graphics and Design', ['engineering graphics', 'graphics', 'engineering drawing']],
]
for (const [k, name, phrases] of SUBJECTS) {
  // "open X" / "X notes" / "X syllabus" / "start X quiz" / "X pyq"
  add(`subject.${k}.quiz`, 'subject', `${name} quiz`, 'search_quiz', name,
    [...phrases.map((p) => `${p} quiz`), `start ${k} quiz`, `practice ${k}`, `${k} mcq`, `test me on ${k}`])
  add(`subject.${k}.notes`, 'subject', `${name} notes`, 'search_resource', name,
    [...phrases.map((p) => `${p} notes`), `${k} material`, `${k} pdf`, `notes for ${k}`])
  add(`subject.${k}.syllabus`, 'subject', `${name} syllabus`, 'search_syllabus', name,
    [...phrases.map((p) => `${p} syllabus`), `${k} units`, `${k} topics`, `syllabus of ${k}`])
  add(`subject.${k}.pyq`, 'subject', `${name} previous papers`, 'search_pyq', name,
    [...phrases.map((p) => `${p} pyq`), `${k} previous year`, `${k} question paper`, `${k} past papers`])
  add(`subject.${k}.open`, 'subject', name, 'search_subject', name, phrases)
}

/* ------------------------------------------------------- unit shortcuts --- */
for (let u = 1; u <= 8; u++) {
  add(`unit.${u}`, 'academic', `Unit ${u}`, 'search_unit', String(u), [
    `unit ${u}`, `open unit ${u}`, `chapter ${u}`, `module ${u}`, `unit ${u} notes`, `unit ${u} quiz`,
  ])
}

/* ------------------------------------------------------------ semesters --- */
for (let s = 1; s <= 8; s++) {
  add(`semester.${s}`, 'academic', `Semester ${s}`, 'search_semester', String(s), [
    `semester ${s}`, `sem ${s}`, `${s}th semester`, `semester ${s} subjects`, `sem ${s} syllabus`, `sem ${s} papers`,
  ])
}

/* --------------------------------------------------------- toolbox tools -- */
// Read from the app's real TOOLBOX list, so every tool is reachable by voice.
const TOOLS = JSON.parse(readFileSync('/tmp/tools.json', 'utf8'))
for (const [slug, label] of TOOLS) {
  const short = label.replace(/ (Calculator|Calc|Generator)$/i, '').toLowerCase()
  add(`tool.${slug}`, 'tool', label, 'navigate', `/tools/toolbox/${slug}`, [
    short, label.toLowerCase(), `open ${short}`, `${short} tool`,
    `calculate ${short}`, `${short} calculator`,
  ])
}

/* ------------------------------------------------ real subjects from bank -- */
// Generated from the 144 subjects that actually have published questions, so
// "start <subject> quiz" works for every real paper rather than a curated few.
const BANK = JSON.parse(readFileSync('/tmp/subs.json', 'utf8'))
const SKIP_WORDS = new Set(['and','of','the','for','in','to','with','a','an','&','lab'])
for (const sub of BANK) {
  const name = sub.name
  const clean = name.replace(/\s*\[[^\]]*\]\s*/g, '').trim()
  const lower = clean.toLowerCase()
  const words = lower.split(/[^a-z0-9]+/).filter(Boolean)
  const acronym = words.filter((w) => !SKIP_WORDS.has(w)).map((w) => w[0]).join('')
  const key = sub.code.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const base = [lower]
  // 2-letter acronyms collide with ordinary words ('at', 'is'), so require 3+.
  if (acronym.length >= 3 && acronym.length <= 6) base.push(acronym)
  base.push(sub.code.toLowerCase())
  // one intent per subject covering quiz / notes / syllabus / papers
  add(`bank.${key}.quiz`, 'subject', `${clean} quiz`, 'search_quiz', clean,
    [...base.map((b) => `${b} quiz`), `start ${lower} quiz`, `practice ${lower}`])
  add(`bank.${key}.open`, 'subject', clean, 'search_subject', clean,
    [...base, `open ${lower}`, `${lower} notes`, `${lower} syllabus`, `${lower} pyq`])
}

/* ------------------------------------------------------------- branches --- */
const BRANCHES = [
  ['cse','Computer Science & Engineering',['cse','computer science','cs branch']],
  ['ce','Civil Engineering',['civil','civil engineering','ce branch']],
  ['me','Mechanical Engineering',['mechanical','mechanical engineering','me branch']],
  ['ee','Electrical Engineering',['electrical','electrical engineering','ee branch']],
  ['ece','Electronics & Communication',['ece','electronics','electronics and communication']],
  ['it','Information Technology',['it branch','information technology']],
]
for (const [k, name, phrases] of BRANCHES) {
  add(`branch.${k}`, 'academic', name, 'search_branch', name, [
    ...phrases, ...phrases.map((p) => `${p} subjects`), ...phrases.map((p) => `${p} syllabus`),
  ])
}

/* ------------------------------------------------- profile / account acts -- */
const ACCOUNT = [
  ['edit_profile','Edit profile','/profile',['edit profile','change my name','update profile','change avatar','profile picture','change photo']],
  ['change_branch','Change branch or semester','/profile',['change branch','change semester','update branch','wrong semester','set my branch']],
  ['logout','Sign out','/profile',['logout','log out','sign out','exit account']],
  ['notif_settings','Notification settings','/settings',['notification settings','turn off notifications','mute notifications','stop alerts']],
]
for (const [k, title, target, phrases] of ACCOUNT) {
  add(`account.${k}`, 'account', title, 'navigate', target, phrases)
}

/* ----------------------------------------------------- notices / updates -- */
add('content.notices', 'academic', 'Notices', 'navigate', '/notifications',
  ['notices','notice board','announcements','latest notice','university notice','new notice','circulars'])
add('content.revision', 'academic', 'Revision', 'navigate', '/quiz',
  ['revision','revise','open revision','revision center','quick revision','revise a topic'])
add('content.weak', 'academic', 'Topics to revise', 'navigate', '/quiz/history',
  ['weak topics','what should i revise','my weak areas','topics to improve','where am i weak'])
add('content.progress', 'academic', 'My progress', 'navigate', '/quiz/history',
  ['my progress','how am i doing','my scores','my performance','my marks','score history'])

/* ------------------------------------------------------------- greetings -- */
add('smalltalk.hi', 'smalltalk', 'Hello', 'answer', '',
  ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening', 'yo', 'hii'],
  'Hi! I can open any part of the app, find notes, papers and syllabus, or start a quiz for you. Try "start DBMS quiz" or "show upcoming holidays".')
add('smalltalk.thanks', 'smalltalk', 'Thanks', 'answer', '',
  ['thanks', 'thank you', 'thx', 'thankyou', 'dhanyavad'],
  'Happy to help. Ask me anything else about your studies.')
add('smalltalk.help', 'smalltalk', 'What can you do?', 'answer', '',
  ['what can you do', 'help me', 'commands', 'options', 'what do you do', 'how do you work', 'guide me'],
  'I can: open any screen, find a subject\u2019s notes, syllabus or previous papers, start a quiz, show your results and holidays, open Study Hub / JavaSourceCode / Doubt Desk, and pass a question to the developer if I do not know it.')
add('smalltalk.bye', 'smalltalk', 'Bye', 'answer', '',
  ['bye', 'goodbye', 'see you', 'exit', 'close'],
  'See you. Good luck with your studies.')

/* ------------------------------------------------------------- emit ------- */
const seen = new Set()
for (const i of intents) {
  if (seen.has(i.key)) throw new Error('duplicate intent key: ' + i.key)
  seen.add(i.key)
}
const phraseCount = intents.reduce((a, i) => a + i.phrases.length, 0)

const header = `/**
 * GENERATED by scripts/gen-intents.mjs — do not edit by hand.
 *
 * ${intents.length} intents, ${phraseCount} phrases.
 * Built from the app's real routes, subjects, units, semesters and external
 * resources, so every intent maps to something that actually exists.
 */
import type { Intent } from './types'

export const INTENTS: Intent[] = ${JSON.stringify(intents, null, 2)}
`
writeFileSync('src/services/chatbot/intents.generated.ts', header)
console.log(`[gen-intents] ${intents.length} intents, ${phraseCount} phrases`)
