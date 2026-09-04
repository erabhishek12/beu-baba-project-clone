import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Download, RefreshCw, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ToolShell, Field, Result } from './ToolShell'
import { cn } from '@/lib/cn'

// ---- Age calculator ------------------------------------------------------
export function AgeTool() {
  const [dob, setDob] = useState('')
  const result = useMemo(() => {
    if (!dob) return null
    const start = new Date(dob)
    const now = new Date()
    if (Number.isNaN(start.getTime()) || start > now) return null
    let years = now.getFullYear() - start.getFullYear()
    let months = now.getMonth() - start.getMonth()
    let days = now.getDate() - start.getDate()
    if (days < 0) {
      months -= 1
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    }
    if (months < 0) {
      years -= 1
      months += 12
    }
    const totalDays = Math.floor((now.getTime() - start.getTime()) / 86400000)
    return { years, months, days, totalDays }
  }, [dob])

  return (
    <ToolShell title="Age Calculator" subtitle="Your exact age from date of birth.">
      <Field label="Date of birth" value={dob} onChange={setDob} type="date" />
      {result && (
        <>
          <Result
            label="Age"
            value={`${result.years}y ${result.months}m ${result.days}d`}
            hint={`${result.totalDays.toLocaleString()} days lived`}
          />
        </>
      )}
    </ToolShell>
  )
}

// ---- Date difference -----------------------------------------------------
export function DateDiffTool() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const diff = useMemo(() => {
    if (!from || !to) return null
    const a = new Date(from)
    const b = new Date(to)
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
    const days = Math.round(Math.abs(b.getTime() - a.getTime()) / 86400000)
    return { days, weeks: (days / 7).toFixed(1) }
  }, [from, to])

  return (
    <ToolShell title="Date Difference" subtitle="Count the days between two dates.">
      <div className="grid grid-cols-2 gap-3">
        <Field label="From" value={from} onChange={setFrom} type="date" />
        <Field label="To" value={to} onChange={setTo} type="date" />
      </div>
      {diff && (
        <Result label="Difference" value={`${diff.days} days`} hint={`${diff.weeks} weeks`} />
      )}
    </ToolShell>
  )
}

// ---- Unit converter ------------------------------------------------------
const CONVERSIONS: Record<string, { units: Record<string, number>; label: string }> = {
  length: {
    label: 'Length',
    units: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.34, Foot: 0.3048, Inch: 0.0254 },
  },
  mass: {
    label: 'Mass',
    units: { Kilogram: 1, Gram: 0.001, Milligram: 1e-6, Pound: 0.453592, Ounce: 0.0283495, Tonne: 1000 },
  },
  temperature: { label: 'Temperature', units: {} }, // special-cased
  area: {
    label: 'Area',
    units: { 'Sq meter': 1, 'Sq kilometer': 1e6, 'Sq foot': 0.092903, Acre: 4046.86, Hectare: 10000 },
  },
  speed: {
    label: 'Speed',
    units: { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knot': 0.514444 },
  },
}

export function UnitConverterTool() {
  const [category, setCategory] = useState('length')
  const conv = CONVERSIONS[category]
  const unitKeys = category === 'temperature' ? ['Celsius', 'Fahrenheit', 'Kelvin'] : Object.keys(conv.units)
  const [from, setFrom] = useState(unitKeys[0])
  const [to, setTo] = useState(unitKeys[1])
  const [value, setValue] = useState('1')

  useEffect(() => {
    const keys = category === 'temperature' ? ['Celsius', 'Fahrenheit', 'Kelvin'] : Object.keys(CONVERSIONS[category].units)
    setFrom(keys[0])
    setTo(keys[1])
  }, [category])

  const output = useMemo(() => {
    const v = parseFloat(value)
    if (!Number.isFinite(v)) return ''
    if (category === 'temperature') return convertTemp(v, from, to).toFixed(2)
    const base = v * conv.units[from]
    return (base / conv.units[to]).toString()
  }, [value, from, to, category, conv])

  return (
    <ToolShell title="Unit Converter" subtitle="Convert between common engineering units.">
      <label className="block">
        <span className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
          Category
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CONVERSIONS).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={cn(
                'rounded-pill border px-3.5 py-1.5 text-body-sm font-medium transition-colors',
                category === key
                  ? 'border-accent bg-accent text-white'
                  : 'border-line/70 bg-surface-secondary/60 text-ink-secondary',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </label>

      <div className="mt-4">
        <Field label="Value" value={value} onChange={setValue} inputMode="decimal" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <SelectBox label="From" value={from} options={unitKeys} onChange={setFrom} />
        <SelectBox label="To" value={to} options={unitKeys} onChange={setTo} />
      </div>
      {output !== '' && <Result label={`${value} ${from} =`} value={`${output} ${to}`} />}
    </ToolShell>
  )
}

function convertTemp(v: number, from: string, to: string): number {
  let c = v
  if (from === 'Fahrenheit') c = ((v - 32) * 5) / 9
  else if (from === 'Kelvin') c = v - 273.15
  if (to === 'Celsius') return c
  if (to === 'Fahrenheit') return (c * 9) / 5 + 32
  return c + 273.15
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
        {label}
      </span>
      <span className="flex h-12 items-center rounded-xl border border-line/70 bg-surface-secondary/60 px-3.5 focus-within:border-accent/50 focus-within:bg-surface focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-body text-ink outline-none"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}

// ---- Scientific calculator ----------------------------------------------
export function ScientificTool() {
  const [expr, setExpr] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState(false)

  function evaluate() {
    try {
      const value = safeEval(expr)
      if (value === null || Number.isNaN(value) || !Number.isFinite(value)) {
        setError(true)
        setResult('Error')
      } else {
        setError(false)
        setResult(String(Math.round(value * 1e10) / 1e10))
      }
    } catch {
      setError(true)
      setResult('Error')
    }
  }

  const keys = ['sin', 'cos', 'tan', 'log', 'ln', '√', '^', '(', ')', 'π', 'e', '%', '7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', 'C', '+']

  function press(k: string) {
    if (k === 'C') {
      setExpr('')
      setResult('')
      setError(false)
      return
    }
    const map: Record<string, string> = {
      '√': 'sqrt(',
      π: 'pi',
      ln: 'ln(',
      log: 'log(',
      sin: 'sin(',
      cos: 'cos(',
      tan: 'tan(',
    }
    setExpr((e) => e + (map[k] ?? k))
  }

  return (
    <ToolShell
      title="Scientific Calculator"
      subtitle="Type an expression or use the keypad."
      note="Supports + − × ÷, powers (^), parentheses, sin/cos/tan (radians), log (base 10), ln, √, π and e."
    >
      <Card>
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && evaluate()}
          placeholder="e.g. 3 * (2 + sin(0.5))"
          className="w-full bg-transparent text-right text-h3 text-ink outline-none placeholder:text-ink-tertiary"
        />
        <p
          className={cn(
            'mt-2 text-right text-h1 font-bold',
            error ? 'text-danger' : 'text-accent',
          )}
        >
          {result || '0'}
        </p>
      </Card>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => (k === '=' ? evaluate() : press(k))}
            className={cn(
              'h-12 rounded-xl text-body font-semibold transition-transform active:scale-95',
              k === 'C'
                ? 'bg-danger-soft text-danger'
                : /[0-9.]/.test(k)
                  ? 'bg-surface text-ink shadow-soft'
                  : 'bg-surface-secondary text-ink-secondary',
            )}
          >
            {k}
          </button>
        ))}
        <button
          onClick={evaluate}
          className="col-span-4 h-12 rounded-xl bg-accent text-body font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          =
        </button>
      </div>
    </ToolShell>
  )
}

/** Safe arithmetic evaluator — no eval/Function on raw input. */
function safeEval(input: string): number | null {
  let s = input
    .replace(/π/g, 'pi')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**')
  // tokenize allowed identifiers
  const allowed = ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'pi', 'e']
  // validate characters
  if (!/^[0-9+\-*/().%\s a-z]*$/.test(s)) return null
  // replace functions/constants with Math equivalents
  s = s
    .replace(/\bln\(/g, 'Math.log(')
    .replace(/\blog\(/g, 'Math.log10(')
    .replace(/\bsqrt\(/g, 'Math.sqrt(')
    .replace(/\bsin\(/g, 'Math.sin(')
    .replace(/\bcos\(/g, 'Math.cos(')
    .replace(/\btan\(/g, 'Math.tan(')
    .replace(/\bpi\b/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
  // any remaining bare identifier that isn't Math.* is disallowed
  const stripped = s.replace(/Math\.[A-Za-z0-9]+/g, '')
  if (/[a-zA-Z]/.test(stripped)) return null
  void allowed
  // eslint-disable-next-line no-new-func
  const fn = new Function(`"use strict"; return (${s});`)
  const out = fn()
  return typeof out === 'number' ? out : null
}

// ---- Text formatter ------------------------------------------------------
export function TextFormatterTool() {
  const [text, setText] = useState('')
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const chars = text.length
    const lines = text ? text.split('\n').length : 0
    return { words, chars, lines }
  }, [text])
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const actions: [string, () => void][] = [
    ['UPPERCASE', () => setText((t) => t.toUpperCase())],
    ['lowercase', () => setText((t) => t.toLowerCase())],
    ['Title Case', () => setText((t) => t.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()))],
    ['Sentence case', () => setText((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())],
    ['Trim spaces', () => setText((t) => t.replace(/\s+/g, ' ').trim())],
    ['Remove line breaks', () => setText((t) => t.replace(/\n+/g, ' '))],
  ]

  return (
    <ToolShell title="Text Formatter" subtitle="Clean, transform and measure text.">
      <Card>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste or type text here…"
          className="w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-ink-tertiary"
        />
        <div className="mt-2 flex gap-4 border-t border-line/60 pt-2 text-caption text-ink-tertiary">
          <span>{stats.words} words</span>
          <span>{stats.chars} chars</span>
          <span>{stats.lines} lines</span>
          <button onClick={copy} className="ml-auto flex items-center gap-1 font-semibold text-accent">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </Card>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {actions.map(([label, fn]) => (
          <button
            key={label}
            onClick={fn}
            className="rounded-xl border border-line/70 bg-surface-secondary/60 py-2.5 text-body-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-secondary"
          >
            {label}
          </button>
        ))}
      </div>
    </ToolShell>
  )
}

// ---- Password generator --------------------------------------------------
export function PasswordTool() {
  const [length, setLength] = useState(16)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [pw, setPw] = useState('')
  const [copied, setCopied] = useState(false)

  function generate() {
    let pool = ''
    if (upper) pool += 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    if (lower) pool += 'abcdefghijkmnpqrstuvwxyz'
    if (digits) pool += '23456789'
    if (symbols) pool += '!@#$%^&*()-_=+[]{}'
    if (!pool) {
      setPw('')
      return
    }
    const arr = new Uint32Array(length)
    crypto.getRandomValues(arr)
    let out = ''
    for (let i = 0; i < length; i++) out += pool[arr[i] % pool.length]
    setPw(out)
  }

  useEffect(() => {
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function copy() {
    if (!pw) return
    navigator.clipboard?.writeText(pw)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const toggles: [string, boolean, (v: boolean) => void][] = [
    ['Uppercase', upper, setUpper],
    ['Lowercase', lower, setLower],
    ['Digits', digits, setDigits],
    ['Symbols', symbols, setSymbols],
  ]

  return (
    <ToolShell
      title="Password Generator"
      subtitle="Strong random passwords, generated locally."
      note="Uses your device's cryptographic random generator. Nothing is sent anywhere."
    >
      <Card className="flex items-center gap-3">
        <span className="min-w-0 flex-1 break-all font-mono text-body text-ink">{pw || '—'}</span>
        <button onClick={copy} aria-label="Copy" className="text-accent">
          {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
        </button>
        <button onClick={generate} aria-label="Regenerate" className="text-ink-secondary">
          <RefreshCw className="size-5" />
        </button>
      </Card>

      <div className="mt-4">
        <label className="mb-2 flex items-center justify-between text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
          <span>Length</span>
          <span className="text-accent">{length}</span>
        </label>
        <input
          type="range"
          min={6}
          max={40}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {toggles.map(([label, val, set]) => (
          <button
            key={label}
            onClick={() => set(!val)}
            className={cn(
              'flex items-center justify-between rounded-xl border px-3.5 py-3 text-body-sm font-semibold transition-colors',
              val
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line/70 bg-surface-secondary/60 text-ink-secondary',
            )}
          >
            {label}
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-md border',
                val ? 'border-accent bg-accent text-white' : 'border-line',
              )}
            >
              {val && <Check className="size-3.5" />}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={generate}
        className="mt-4 w-full rounded-xl bg-accent py-3.5 text-body font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        Generate password
      </button>
    </ToolShell>
  )
}

// ---- QR generator --------------------------------------------------------
export function QrTool() {
  const [text, setText] = useState('https://beu-bih.ac.in')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!text.trim()) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
      return
    }
    QRCode.toCanvas(canvas, text, { width: 240, margin: 2, color: { dark: '#1a2233', light: '#ffffff' } }).catch(
      () => {},
    )
  }, [text])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'beubaba-qr.png'
    a.click()
  }

  return (
    <ToolShell title="QR Generator" subtitle="Turn any text or link into a QR code.">
      <Field label="Text or URL" value={text} onChange={setText} placeholder="https://…" />
      <Card className="mt-4 flex flex-col items-center py-6">
        <canvas ref={canvasRef} className="rounded-xl" />
        {text.trim() && (
          <button
            onClick={download}
            className="mt-4 flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-body-sm font-semibold text-white"
          >
            <Download className="size-4" aria-hidden />
            Download PNG
          </button>
        )}
      </Card>
    </ToolShell>
  )
}
