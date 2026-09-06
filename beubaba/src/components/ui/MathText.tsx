/**
 * MathText — renders question text that may contain simple LaTeX.
 *
 * WHY
 * ---
 * About 470 imported questions (1.7% of the bank) are written with LaTeX, e.g.
 *   \(f(x,y)=\sqrt{1-x^2-y^2}\)
 * Those were being shown to students as raw backslash code.
 *
 * This is a deliberately SMALL converter, not a full TeX engine: it maps the
 * handful of constructs that actually occur in this dataset to Unicode and
 * HTML sub/superscripts. A real KaTeX bundle is ~280 KB and would be loaded by
 * every student for the benefit of 1.7% of questions.
 *
 * Output is built as React elements, never `dangerouslySetInnerHTML`, so a
 * malicious stem cannot inject markup.
 */
import { Fragment, type ReactNode } from 'react'

const GREEK: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ',
  eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ',
  nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ',
  phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
  Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
}

const SYMBOLS: Record<string, string> = {
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓',
  leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠',
  approx: '≈', equiv: '≡', propto: '∝', infty: '∞',
  rightarrow: '→', to: '→', leftarrow: '←', Rightarrow: '⇒', leftrightarrow: '↔',
  int: '∫', iint: '∬', iiint: '∭', oint: '∮', sum: '∑', prod: '∏',
  partial: '∂', nabla: '∇', forall: '∀', exists: '∃', in: '∈', notin: '∉',
  subset: '⊂', supset: '⊃', cup: '∪', cap: '∩', emptyset: '∅',
  ldots: '…', cdots: '⋯', dots: '…', angle: '∠', perp: '⊥', parallel: '∥',
  therefore: '∴', because: '∵', degree: '°', prime: '′',
}

const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', n: 'ⁿ', i: 'ⁱ',
}
const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', a: 'ₐ', e: 'ₑ', i: 'ᵢ', n: 'ₙ', x: 'ₓ',
}

function mapAll(s: string, table: Record<string, string>): string | null {
  let out = ''
  for (const ch of s) {
    if (!(ch in table)) return null
    out += table[ch]
  }
  return out
}

/** Convert one LaTeX fragment to a readable plain string. */
function latexToText(input: string): string {
  let s = input

  // \frac{a}{b} and \dfrac{a}{b}  ->  (a)/(b), simplified when short
  for (let i = 0; i < 4; i++) {
    s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_m, a, b) => {
      const A = a.trim(), B = b.trim()
      const simple = (v: string) => /^[A-Za-z0-9πα-ω]+$/.test(v)
      return simple(A) && simple(B) ? `${A}/${B}` : `(${A})/(${B})`
    })
  }

  // \sqrt{x} -> √(x)   \sqrt[n]{x} -> ⁿ√(x)
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}/g, (_m, n, x) => `${n}√(${x})`)
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, (_m, x) =>
      /^[A-Za-z0-9]$/.test(x.trim()) ? `√${x.trim()}` : `√(${x.trim()})`,
    )
  }

  // \lim_{x \to 0}
  s = s.replace(/\\lim\s*_\s*\{([^{}]*)\}/g, (_m, x) => `lim[${x.trim()}]`)
  // generic \name_{...}^{...} handled below after symbol substitution

  // \text{...}, \mathrm{...}, \mathbf{...} -> contents
  s = s.replace(/\\(?:text|mathrm|mathbf|mathit|operatorname)\s*\{([^{}]*)\}/g, '$1')

  // named symbols and greek letters
  s = s.replace(/\\([A-Za-z]+)/g, (m, name: string) => {
    if (name in SYMBOLS) return SYMBOLS[name]
    if (name in GREEK) return GREEK[name]
    return m
  })

  // superscripts / subscripts -> Unicode when every char maps
  s = s.replace(/\^\s*\{([^{}]*)\}|\^(\w)/g, (_m, br, one) => {
    const body = (br ?? one ?? '').trim()
    return mapAll(body, SUP) ?? `^(${body})`
  })
  s = s.replace(/_\s*\{([^{}]*)\}|_(\w)/g, (_m, br, one) => {
    const body = (br ?? one ?? '').trim()
    return mapAll(body, SUB) ?? `_(${body})`
  })

  // leftovers
  s = s.replace(/\\left|\\right/g, '')
  s = s.replace(/\\[,;:!> ]/g, ' ')
  s = s.replace(/[{}]/g, '')
  return s.replace(/\s{2,}/g, ' ').trim()
}

/** True when a string looks like it contains LaTeX worth converting. */
export function hasLatex(s: string): boolean {
  return /\\[A-Za-z]+|\\\(|\\\[|\$[^$]+\$|\^\{|_\{/.test(s)
}

/**
 * Render text, converting any \( … \), \[ … \] or $ … $ segments.
 * Plain text passes through untouched.
 */
export function renderMath(text: string): ReactNode {
  if (!text) return text
  if (!hasLatex(text)) return text

  // Split on the three delimiter styles, keeping the delimiters.
  const parts = text.split(/(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$[^$\n]+\$)/g)
  return parts.map((part, i) => {
    let inner: string | null = null
    if (part.startsWith('\\(') && part.endsWith('\\)')) inner = part.slice(2, -2)
    else if (part.startsWith('\\[') && part.endsWith('\\]')) inner = part.slice(2, -2)
    else if (part.length > 2 && part.startsWith('$') && part.endsWith('$')) inner = part.slice(1, -1)

    if (inner !== null) {
      return (
        <span key={i} className="whitespace-nowrap font-medium">
          {latexToText(inner)}
        </span>
      )
    }
    // Bare LaTeX with no delimiters (some rows have \frac outside \( \)).
    return <Fragment key={i}>{hasLatex(part) ? latexToText(part) : part}</Fragment>
  })
}

/** Convenience wrapper. */
export function MathText({ children }: { children: string }) {
  return <>{renderMath(children)}</>
}
