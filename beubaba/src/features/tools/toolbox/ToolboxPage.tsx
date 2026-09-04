import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Search,
  X,
  GraduationCap,
  Percent,
  CalendarCheck,
  ClipboardList,
  Award,
  Cake,
  Ruler,
  Calculator,
  Timer,
  CalendarClock,
  Target,
  Hourglass,
  QrCode,
  KeyRound,
  Type,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { staggerParent, staggerChild } from '@/lib/motion'
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon'
import { CircleButton } from '@/components/ui/CircleButton'
import { PageHero } from '@/components/ui/PageHero'

export interface ToolDef {
  slug: string
  label: string
  desc: string
  icon: typeof Percent
  /** Clay icon family name (see AppIcon). Falls back to `icon` when absent. */
  clay?: AppIconName
  group: 'Academic' | 'Utility' | 'Productivity'
}

/** Soft pastel tile tint per group (matches the icon color families). */

export const TOOLBOX: ToolDef[] = [
  { slug: 'cgpa', label: 'CGPA Calculator', desc: 'Combine semester SGPAs into CGPA', icon: GraduationCap, clay: 'tool-cgpa', group: 'Academic' },
  { slug: 'sgpa', label: 'SGPA Calculator', desc: 'Grade points × credits per subject', icon: Award, clay: 'tool-sgpa', group: 'Academic' },
  { slug: 'gpa-target', label: 'GPA Target', desc: 'CGPA needed in remaining credits', icon: Target, clay: 'tool-gpa-target', group: 'Academic' },
  { slug: 'percentage', label: 'Percentage', desc: 'Marks to percentage & CGPA↔%', icon: Percent, clay: 'tool-percentage', group: 'Academic' },
  { slug: 'marks', label: 'Marks Calculator', desc: 'Weighted internal + external marks', icon: ClipboardList, clay: 'tool-marks', group: 'Academic' },
  { slug: 'attendance', label: 'Attendance', desc: 'Can I skip? Bunk / recovery planner', icon: CalendarCheck, clay: 'tool-attendance', group: 'Academic' },
  { slug: 'exam-countdown', label: 'Exam Countdown', desc: 'Days left to your exam date', icon: CalendarClock, clay: 'tool-exam-countdown', group: 'Productivity' },
  { slug: 'pomodoro', label: 'Study Timer', desc: 'Pomodoro focus timer', icon: Timer, clay: 'tool-pomodoro', group: 'Productivity' },
  { slug: 'scientific', label: 'Scientific Calc', desc: 'Full expression calculator', icon: Calculator, clay: 'tool-scientific', group: 'Utility' },
  { slug: 'unit-converter', label: 'Unit Converter', desc: 'Length, mass, temperature & more', icon: Ruler, clay: 'tool-unit-converter', group: 'Utility' },
  { slug: 'age', label: 'Age Calculator', desc: 'Exact age in years, months, days', icon: Cake, clay: 'tool-age', group: 'Utility' },
  { slug: 'date-diff', label: 'Date Difference', desc: 'Days between two dates', icon: Hourglass, clay: 'tool-date-diff', group: 'Utility' },
  { slug: 'qr', label: 'QR Generator', desc: 'Make a QR code from text/URL', icon: QrCode, clay: 'tool-qr', group: 'Utility' },
  { slug: 'password', label: 'Password Generator', desc: 'Strong random passwords', icon: KeyRound, clay: 'tool-password', group: 'Utility' },
  { slug: 'text-formatter', label: 'Text Formatter', desc: 'Case, trim, count & clean text', icon: Type, clay: 'tool-text-formatter', group: 'Utility' },
]

export function ToolboxPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = TOOLBOX.filter(
    (t) => !q || `${t.label} ${t.desc}`.toLowerCase().includes(q),
  )
  const groups: ToolDef['group'][] = ['Academic', 'Utility', 'Productivity']

  return (
    <div className="page-x pb-8 pt-6">
      <CircleButton label="Back to tools" onClick={() => navigate('/tools')} className="mb-3">
        <ChevronLeft className="size-5" aria-hidden />
      </CircleButton>
      <PageHero
        tone="pink"
        icon="toolbox"
        title="Student Toolbox"
        subtitle="Everyday calculators and utilities. Everything runs on your device."
        className="mb-4"
      />

      <div className="glass-standard glass-highlight mt-4 flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-5 text-ink-tertiary" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools…"
          aria-label="Search tools"
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-tertiary"
        />
        {query && (
          <button aria-label="Clear" onClick={() => setQuery('')}>
            <X className="size-4 text-ink-tertiary" />
          </button>
        )}
      </div>

      {groups.map((g) => {
        const items = filtered.filter((t) => t.group === g)
        if (items.length === 0) return null
        return (
          <section key={g} className="mt-6">
            <h2 className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
              {g}
            </h2>
            <motion.div
              variants={staggerParent}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-3"
            >
              {items.map((t) => (
                <motion.button
                  key={t.slug}
                  variants={staggerChild}
                  onClick={() => navigate(`/tools/toolbox/${t.slug}`)}
                  className="text-left"
                >
                  <Card className="glass-highlight h-full transition-transform active:scale-[0.98]">
                    {t.clay ? (
                      <AppIcon name={t.clay} className="size-12" />
                    ) : (
                      <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                        <t.icon className="size-5" aria-hidden />
                      </span>
                    )}
                    <p className="mt-3 text-body font-semibold text-ink">{t.label}</p>
                    <p className="mt-0.5 text-caption text-ink-tertiary">{t.desc}</p>
                  </Card>
                </motion.button>
              ))}
            </motion.div>
          </section>
        )
      })}

      {filtered.length === 0 && (
        <Card className="mt-6 py-10 text-center text-body-sm text-ink-secondary">
          No tools match “{query}”.
        </Card>
      )}
    </div>
  )
}
