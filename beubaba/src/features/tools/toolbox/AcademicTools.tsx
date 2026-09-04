import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ToolShell, Field, Result } from './ToolShell'

const num = (v: string) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

// ---- CGPA: weighted average of semester SGPAs by credits -----------------
export function CgpaTool() {
  const [rows, setRows] = useState([
    { sgpa: '', credits: '' },
    { sgpa: '', credits: '' },
  ])
  const set = (i: number, k: 'sgpa' | 'credits', v: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)))
  const totalCredits = rows.reduce((s, r) => s + num(r.credits), 0)
  const cgpa =
    totalCredits > 0
      ? rows.reduce((s, r) => s + num(r.sgpa) * num(r.credits), 0) / totalCredits
      : 0

  return (
    <ToolShell
      title="CGPA Calculator"
      subtitle="Combine your semester SGPAs, weighted by credits."
      note="CGPA = Σ(SGPA × semester credits) ÷ Σ(credits). Confirm your university's exact rounding — this is an estimate, not an official transcript value."
    >
      <div className="space-y-3">
        {rows.map((r, i) => (
          <Card key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <Field label={`Sem ${i + 1} SGPA`} value={r.sgpa} onChange={(v) => set(i, 'sgpa', v)} inputMode="decimal" placeholder="8.5" />
            </div>
            <div className="flex-1">
              <Field label="Credits" value={r.credits} onChange={(v) => set(i, 'credits', v)} inputMode="numeric" placeholder="24" />
            </div>
            {rows.length > 1 && (
              <button
                onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                className="mb-1 flex size-11 items-center justify-center rounded-xl border border-line/70 text-danger"
                aria-label="Remove semester"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            )}
          </Card>
        ))}
      </div>
      <button
        onClick={() => setRows((r) => [...r, { sgpa: '', credits: '' }])}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line/70 bg-surface-secondary/60 py-3 text-body-sm font-semibold text-ink-secondary"
      >
        <Plus className="size-4" aria-hidden /> Add semester
      </button>
      <Result label="CGPA" value={cgpa.toFixed(2)} hint={`${totalCredits} total credits`} />
    </ToolShell>
  )
}

// ---- SGPA: grade points × credits per subject ----------------------------
export function SgpaTool() {
  const [rows, setRows] = useState([
    { gp: '', credits: '' },
    { gp: '', credits: '' },
    { gp: '', credits: '' },
  ])
  const set = (i: number, k: 'gp' | 'credits', v: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)))
  const totalCredits = rows.reduce((s, r) => s + num(r.credits), 0)
  const sgpa =
    totalCredits > 0
      ? rows.reduce((s, r) => s + num(r.gp) * num(r.credits), 0) / totalCredits
      : 0

  return (
    <ToolShell
      title="SGPA Calculator"
      subtitle="Enter each subject's grade point and credits."
      note="SGPA = Σ(grade point × credit) ÷ Σ(credits). Grade points typically range 0–10 per your grading scheme."
    >
      <div className="space-y-3">
        {rows.map((r, i) => (
          <Card key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <Field label={`Subject ${i + 1} grade pt`} value={r.gp} onChange={(v) => set(i, 'gp', v)} inputMode="decimal" placeholder="9" />
            </div>
            <div className="flex-1">
              <Field label="Credits" value={r.credits} onChange={(v) => set(i, 'credits', v)} inputMode="numeric" placeholder="4" />
            </div>
            {rows.length > 1 && (
              <button
                onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                className="mb-1 flex size-11 items-center justify-center rounded-xl border border-line/70 text-danger"
                aria-label="Remove subject"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            )}
          </Card>
        ))}
      </div>
      <button
        onClick={() => setRows((r) => [...r, { gp: '', credits: '' }])}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line/70 bg-surface-secondary/60 py-3 text-body-sm font-semibold text-ink-secondary"
      >
        <Plus className="size-4" aria-hidden /> Add subject
      </button>
      <Result label="SGPA" value={sgpa.toFixed(2)} hint={`${totalCredits} total credits`} />
    </ToolShell>
  )
}

// ---- GPA target: what CGPA is needed in remaining credits ----------------
export function GpaTargetTool() {
  const [currentCgpa, setCurrentCgpa] = useState('')
  const [doneCredits, setDoneCredits] = useState('')
  const [targetCgpa, setTargetCgpa] = useState('')
  const [remainingCredits, setRemainingCredits] = useState('')

  const needed = useMemo(() => {
    const cc = num(currentCgpa)
    const dc = num(doneCredits)
    const tc = num(targetCgpa)
    const rc = num(remainingCredits)
    if (rc <= 0) return null
    const totalPointsNeeded = tc * (dc + rc)
    const pointsSoFar = cc * dc
    return (totalPointsNeeded - pointsSoFar) / rc
  }, [currentCgpa, doneCredits, targetCgpa, remainingCredits])

  const feasible = needed != null && needed <= 10 && needed >= 0

  return (
    <ToolShell
      title="GPA Target Calculator"
      subtitle="Find the CGPA you must average in the credits you have left."
      note="Assumes a 10-point scale. Required GPA = (target × total credits − current × completed credits) ÷ remaining credits."
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Current CGPA" value={currentCgpa} onChange={setCurrentCgpa} inputMode="decimal" placeholder="7.8" />
        <Field label="Credits done" value={doneCredits} onChange={setDoneCredits} inputMode="numeric" placeholder="96" />
        <Field label="Target CGPA" value={targetCgpa} onChange={setTargetCgpa} inputMode="decimal" placeholder="8.5" />
        <Field label="Credits left" value={remainingCredits} onChange={setRemainingCredits} inputMode="numeric" placeholder="64" />
      </div>
      {needed != null && (
        <Result
          label="Required average"
          value={needed.toFixed(2)}
          tone={feasible ? 'success' : 'danger'}
          hint={
            feasible
              ? 'Achievable — keep it up.'
              : needed > 10
                ? 'Above 10 — this target is not reachable in the remaining credits.'
                : 'Below 0 — your target is already met.'
          }
        />
      )}
    </ToolShell>
  )
}

// ---- Percentage: marks->% and CGPA<->% ----------------------------------
export function PercentageTool() {
  const [obtained, setObtained] = useState('')
  const [total, setTotal] = useState('')
  const [cgpa, setCgpa] = useState('')

  const pct = num(total) > 0 ? (num(obtained) / num(total)) * 100 : 0
  // Widely-used approximation: % ≈ (CGPA − 0.75) × 10
  const cgpaPct = num(cgpa) > 0 ? (num(cgpa) - 0.75) * 10 : 0

  return (
    <ToolShell
      title="Percentage Calculator"
      subtitle="Marks to percentage, and a CGPA→percentage estimate."
      note="Marks %: obtained ÷ total × 100. CGPA→% uses the common (CGPA − 0.75) × 10 approximation — your university may use a different official conversion."
    >
      <Card>
        <p className="text-body-sm font-semibold text-ink">Marks → Percentage</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Marks obtained" value={obtained} onChange={setObtained} inputMode="decimal" placeholder="612" />
          <Field label="Total marks" value={total} onChange={setTotal} inputMode="decimal" placeholder="750" />
        </div>
        {num(total) > 0 && (
          <p className="mt-3 text-center text-h2 font-bold text-accent">{pct.toFixed(2)}%</p>
        )}
      </Card>
      <Card className="mt-3">
        <p className="text-body-sm font-semibold text-ink">CGPA → Percentage (estimate)</p>
        <div className="mt-3">
          <Field label="CGPA" value={cgpa} onChange={setCgpa} inputMode="decimal" placeholder="8.2" />
        </div>
        {num(cgpa) > 0 && (
          <p className="mt-3 text-center text-h2 font-bold text-gold-ink">{cgpaPct.toFixed(2)}%</p>
        )}
      </Card>
    </ToolShell>
  )
}

// ---- Marks: weighted internal + external -------------------------------
export function MarksTool() {
  const [internal, setInternal] = useState('')
  const [internalMax, setInternalMax] = useState('30')
  const [external, setExternal] = useState('')
  const [externalMax, setExternalMax] = useState('70')

  const totalObtained = num(internal) + num(external)
  const totalMax = num(internalMax) + num(externalMax)
  const pct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0

  return (
    <ToolShell
      title="Marks Calculator"
      subtitle="Combine internal and external marks into a final total."
      note="Total = internal + external. Percentage = total obtained ÷ total maximum × 100."
    >
      <Card>
        <p className="text-body-sm font-semibold text-ink">Internal</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Obtained" value={internal} onChange={setInternal} inputMode="decimal" placeholder="26" />
          <Field label="Out of" value={internalMax} onChange={setInternalMax} inputMode="decimal" />
        </div>
      </Card>
      <Card className="mt-3">
        <p className="text-body-sm font-semibold text-ink">External</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Obtained" value={external} onChange={setExternal} inputMode="decimal" placeholder="55" />
          <Field label="Out of" value={externalMax} onChange={setExternalMax} inputMode="decimal" />
        </div>
      </Card>
      <Result
        label="Total"
        value={`${totalObtained} / ${totalMax}`}
        hint={totalMax > 0 ? `${pct.toFixed(1)}%` : undefined}
      />
    </ToolShell>
  )
}

// ---- Attendance: current % + how many can be skipped / needed -----------
export function AttendanceTool() {
  const [attended, setAttended] = useState('')
  const [total, setTotal] = useState('')
  const [required, setRequired] = useState('75')

  const a = num(attended)
  const t = num(total)
  const req = num(required) / 100
  const current = t > 0 ? (a / t) * 100 : 0

  let message = ''
  if (t > 0 && req > 0 && req < 1) {
    if (current >= num(required)) {
      // classes you can still bunk while staying >= required
      const canSkip = Math.floor((a - req * t) / req)
      message = `You can skip ${Math.max(0, canSkip)} more class${canSkip === 1 ? '' : 'es'} and stay at ${required}%.`
    } else {
      // consecutive classes to attend to reach required
      const need = Math.ceil((req * t - a) / (1 - req))
      message = `Attend the next ${need} class${need === 1 ? '' : 'es'} to reach ${required}%.`
    }
  }

  return (
    <ToolShell
      title="Attendance Calculator"
      subtitle="Check your percentage and plan safe bunks."
      note="Current % = attended ÷ total × 100. The planner assumes each future class is either attended or missed and your required threshold stays fixed."
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Classes attended" value={attended} onChange={setAttended} inputMode="numeric" placeholder="58" />
        <Field label="Total classes" value={total} onChange={setTotal} inputMode="numeric" placeholder="72" />
      </div>
      <div className="mt-3">
        <Field label="Required %" value={required} onChange={setRequired} inputMode="numeric" suffix="%" />
      </div>
      {t > 0 && (
        <Result
          label="Current attendance"
          value={`${current.toFixed(1)}%`}
          tone={current >= num(required) ? 'success' : 'danger'}
          hint={message}
        />
      )}
    </ToolShell>
  )
}
