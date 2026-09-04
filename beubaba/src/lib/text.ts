/**
 * Light readability helpers for source-extracted academic text.
 * The PYQ dataset embeds simple inline LaTeX delimiters (\( ... \), $$ ... $$)
 * and a handful of common macros. We are NOT rendering math here — we only
 * strip the delimiters and convert a few common tokens so the plain text reads
 * cleanly. Full KaTeX rendering can replace this later without touching data.
 */
const MACROS: [RegExp, string][] = [
  [/\\times/g, '×'],
  [/\\div/g, '÷'],
  [/\\pm/g, '±'],
  [/\\cdot/g, '·'],
  [/\\infty/g, '∞'],
  [/\\alpha/g, 'α'],
  [/\\beta/g, 'β'],
  [/\\gamma/g, 'γ'],
  [/\\theta/g, 'θ'],
  [/\\lambda/g, 'λ'],
  [/\\mu/g, 'μ'],
  [/\\pi/g, 'π'],
  [/\\omega/g, 'ω'],
  [/\\Omega/g, 'Ω'],
  [/\\degree/g, '°'],
  [/\^\{?\\circ\}?/g, '°'],
  [/\\leq/g, '≤'],
  [/\\geq/g, '≥'],
  [/\\neq/g, '≠'],
  [/\\rightarrow/g, '→'],
  [/\\to/g, '→'],
]

export function cleanMath(input: string | null | undefined): string {
  if (!input) return ''
  let s = input
  // strip inline/display math delimiters
  s = s.replace(/\\\(|\\\)|\\\[|\\\]/g, '')
  s = s.replace(/\$\$?/g, '')
  for (const [re, rep] of MACROS) s = s.replace(re, rep)
  // \text{...}, \mathrm{...} -> inner
  s = s.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^}]*)\}/g, '$1')
  // \frac{a}{b} -> a/b
  s = s.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
  // remaining backslash macros -> drop the backslash
  s = s.replace(/\\([a-zA-Z]+)/g, '$1')
  // collapse whitespace
  s = s.replace(/\s+/g, ' ').trim()
  return s
}
