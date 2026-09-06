/**
 * Math Mind question generator (spec §19).
 *
 * The spec is explicit: "The difficulty should genuinely increase. Do not
 * simply change labels while keeping identical questions." So each level uses
 * DIFFERENT mathematics, not the same sum with bigger numbers:
 *
 *   1 Beginner  single-step arithmetic on small whole numbers
 *   2 Easy      two-step arithmetic, order of operations, simple fractions
 *   3 Medium    percentages, ratios, averages, linear equations
 *   4 Hard      quadratics, powers/roots, simultaneous equations, series
 *   5 Expert    logarithms, trigonometry, derivatives, permutations
 *
 * Every question carries a worked `steps` explanation, because §19 requires
 * step-by-step solutions — not just a correct answer.
 *
 * Questions are generated, so a student never memorises a fixed set.
 */
export interface MathQuestion {
  prompt: string
  options: string[]
  correct: number
  steps: string[]
  topic: string
}

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

/** Build 4 options around the right answer, all distinct. */
function options(correct: number, spread: number): { options: string[]; correct: number } {
  const set = new Set<number>([correct])
  let guard = 0
  while (set.size < 4 && guard++ < 60) {
    const delta = rnd(1, Math.max(2, spread))
    const cand = Math.random() < 0.5 ? correct + delta : correct - delta
    // Avoid negatives when the answer itself is positive — they read as obvious.
    if (correct >= 0 && cand < 0) continue
    set.add(Number(cand.toFixed(2)))
  }
  const arr = [...set].slice(0, 4)
  // Shuffle so the answer is not always first.
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return { options: arr.map((n) => String(n)), correct: arr.indexOf(correct) }
}

function fromNumber(prompt: string, answer: number, steps: string[], topic: string, spread = 8): MathQuestion {
  const o = options(Number(answer.toFixed(2)), spread)
  return { prompt, options: o.options, correct: o.correct, steps, topic }
}

/* ------------------------------------------------------------- level 1 ---- */
function level1(): MathQuestion {
  const kind = pick(['add', 'sub', 'mul', 'div'])
  if (kind === 'add') {
    const a = rnd(5, 40), b = rnd(5, 40)
    return fromNumber(`${a} + ${b} = ?`, a + b, [`Add the units and tens.`, `${a} + ${b} = ${a + b}`], 'Addition')
  }
  if (kind === 'sub') {
    const a = rnd(20, 60), b = rnd(1, 19)
    return fromNumber(`${a} − ${b} = ?`, a - b, [`Take ${b} away from ${a}.`, `${a} − ${b} = ${a - b}`], 'Subtraction')
  }
  if (kind === 'mul') {
    const a = rnd(2, 12), b = rnd(2, 12)
    return fromNumber(`${a} × ${b} = ?`, a * b, [`${a} times ${b}.`, `${a} × ${b} = ${a * b}`], 'Multiplication')
  }
  const b = rnd(2, 12), ans = rnd(2, 12)
  return fromNumber(`${b * ans} ÷ ${b} = ?`, ans, [`How many ${b}s make ${b * ans}?`, `${b * ans} ÷ ${b} = ${ans}`], 'Division')
}

/* ------------------------------------------------------------- level 2 ---- */
function level2(): MathQuestion {
  const kind = pick(['bodmas', 'fraction', 'twostep'])
  if (kind === 'bodmas') {
    const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9)
    const ans = a + b * c
    return fromNumber(`${a} + ${b} × ${c} = ?`, ans, [
      'Multiplication comes before addition (BODMAS).',
      `${b} × ${c} = ${b * c}`,
      `${a} + ${b * c} = ${ans}`,
    ], 'Order of operations', 12)
  }
  if (kind === 'fraction') {
    const d = pick([2, 4, 5, 10]), n = rnd(1, d - 1), whole = d * rnd(2, 9)
    const ans = (whole / d) * n
    return fromNumber(`What is ${n}/${d} of ${whole}?`, ans, [
      `One part = ${whole} ÷ ${d} = ${whole / d}`,
      `${n} parts = ${whole / d} × ${n} = ${ans}`,
    ], 'Fractions', 10)
  }
  const a = rnd(10, 40), b = rnd(2, 9), c = rnd(2, 9)
  const ans = (a - b) * c
  return fromNumber(`(${a} − ${b}) × ${c} = ?`, ans, [
    'Brackets first.',
    `${a} − ${b} = ${a - b}`,
    `${a - b} × ${c} = ${ans}`,
  ], 'Two-step arithmetic', 20)
}

/* ------------------------------------------------------------- level 3 ---- */
function level3(): MathQuestion {
  const kind = pick(['percent', 'ratio', 'average', 'linear'])
  if (kind === 'percent') {
    const p = pick([5, 10, 12, 15, 20, 25, 40]), base = rnd(2, 20) * 20
    const ans = (base * p) / 100
    return fromNumber(`What is ${p}% of ${base}?`, ans, [
      `${p}% means ${p} out of 100.`,
      `${base} × ${p} ÷ 100 = ${ans}`,
    ], 'Percentage', 12)
  }
  if (kind === 'ratio') {
    const a = rnd(2, 6), b = rnd(2, 6), total = (a + b) * rnd(3, 12)
    const ans = (total / (a + b)) * a
    return fromNumber(`Split ${total} in the ratio ${a}:${b}. What is the first share?`, ans, [
      `Total parts = ${a} + ${b} = ${a + b}`,
      `One part = ${total} ÷ ${a + b} = ${total / (a + b)}`,
      `First share = ${total / (a + b)} × ${a} = ${ans}`,
    ], 'Ratio', 15)
  }
  if (kind === 'average') {
    const nums = Array.from({ length: 4 }, () => rnd(10, 60))
    const sum = nums.reduce((x, y) => x + y, 0)
    const ans = sum / 4
    return fromNumber(`Find the average of ${nums.join(', ')}.`, ans, [
      `Sum = ${nums.join(' + ')} = ${sum}`,
      `Average = ${sum} ÷ 4 = ${ans}`,
    ], 'Averages', 10)
  }
  const m = rnd(2, 9), x = rnd(2, 12), c = rnd(1, 20)
  return fromNumber(`Solve for x:  ${m}x + ${c} = ${m * x + c}`, x, [
    `Subtract ${c} from both sides: ${m}x = ${m * x}`,
    `Divide by ${m}: x = ${x}`,
  ], 'Linear equations', 6)
}

/* ------------------------------------------------------------- level 4 ---- */
function level4(): MathQuestion {
  const kind = pick(['quadratic', 'power', 'simultaneous', 'series'])
  if (kind === 'quadratic') {
    const r1 = rnd(1, 9), r2 = rnd(1, 9)
    const b = r1 + r2, c = r1 * r2
    return fromNumber(`One root of x² − ${b}x + ${c} = 0 is ${r1}. What is the other?`, r2, [
      'For x² − bx + c, the roots multiply to c and add to b.',
      `${r1} × other = ${c}, so other = ${c} ÷ ${r1} = ${r2}`,
    ], 'Quadratic equations', 6)
  }
  if (kind === 'power') {
    const base = pick([2, 3, 5]), e1 = rnd(2, 5), e2 = rnd(1, 3)
    const ans = Math.pow(base, e1 - e2)
    return fromNumber(`${base}^${e1} ÷ ${base}^${e2} = ?`, ans, [
      'Dividing powers of the same base subtracts the exponents.',
      `${base}^(${e1} − ${e2}) = ${base}^${e1 - e2} = ${ans}`,
    ], 'Indices', Math.max(4, ans))
  }
  if (kind === 'simultaneous') {
    const x = rnd(1, 9), y = rnd(1, 9)
    const s = x + y, d = x - y
    return fromNumber(`If x + y = ${s} and x − y = ${d}, what is x?`, x, [
      'Add the two equations: 2x = (x+y) + (x−y)',
      `2x = ${s} + ${d} = ${s + d}`,
      `x = ${(s + d) / 2}`,
    ], 'Simultaneous equations', 6)
  }
  const a = rnd(2, 5), r = pick([2, 3])
  const seq = [a, a * r, a * r * r, a * r * r * r]
  return fromNumber(`${seq.join(' → ')} → ?`, seq[3] * r, [
    `Each term is multiplied by ${r}.`,
    `${seq[3]} × ${r} = ${seq[3] * r}`,
  ], 'Number series', Math.max(6, seq[3]))
}

/* ------------------------------------------------------------- level 5 ---- */
function level5(): MathQuestion {
  const kind = pick(['log', 'trig', 'derivative', 'permutation'])
  if (kind === 'log') {
    const base = pick([2, 3, 10]), e = rnd(2, 5)
    return fromNumber(`log_${base}(${Math.pow(base, e)}) = ?`, e, [
      `Ask: ${base} to what power gives ${Math.pow(base, e)}?`,
      `${base}^${e} = ${Math.pow(base, e)}, so the answer is ${e}.`,
    ], 'Logarithms', 4)
  }
  if (kind === 'trig') {
    const t = pick([
      { q: 'sin 30°', a: 0.5, s: 'sin 30° = 1/2' },
      { q: 'cos 60°', a: 0.5, s: 'cos 60° = 1/2' },
      { q: 'tan 45°', a: 1, s: 'tan 45° = 1' },
      { q: 'sin 90°', a: 1, s: 'sin 90° = 1' },
      { q: 'cos 0°', a: 1, s: 'cos 0° = 1' },
    ])
    return fromNumber(`${t.q} = ?`, t.a, ['Standard angle value.', t.s], 'Trigonometry', 2)
  }
  if (kind === 'derivative') {
    const n = rnd(2, 6), c = rnd(2, 9), x = rnd(1, 4)
    const ans = c * n * Math.pow(x, n - 1)
    return fromNumber(`If f(x) = ${c}x^${n}, what is f'(${x})?`, ans, [
      `Power rule: d/dx (a·xⁿ) = a·n·xⁿ⁻¹`,
      `f'(x) = ${c} × ${n} × x^${n - 1} = ${c * n}x^${n - 1}`,
      `At x = ${x}: ${c * n} × ${Math.pow(x, n - 1)} = ${ans}`,
    ], 'Differentiation', Math.max(8, Math.round(ans / 3)))
  }
  const n = rnd(4, 7), r = rnd(2, 3)
  let p = 1
  for (let i = 0; i < r; i++) p *= n - i
  return fromNumber(`How many ways can ${r} items be arranged from ${n}?  (ⁿPᵣ)`, p, [
    `ⁿPᵣ = n × (n−1) × … for r terms`,
    `${Array.from({ length: r }, (_, i) => n - i).join(' × ')} = ${p}`,
  ], 'Permutations', Math.max(10, Math.round(p / 3)))
}

const LEVELS = [level1, level2, level3, level4, level5]

export const LEVEL_NAMES = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'] as const

/** One question for the given level (1–5). */
export function generateQuestion(level: number): MathQuestion {
  const fn = LEVELS[Math.max(1, Math.min(level, 5)) - 1]
  return fn()
}

/** A full round. Questions are de-duplicated by prompt. */
export function generateRound(level: number, count = 10): MathQuestion[] {
  const out: MathQuestion[] = []
  const seen = new Set<string>()
  let guard = 0
  while (out.length < count && guard++ < count * 30) {
    const q = generateQuestion(level)
    if (seen.has(q.prompt)) continue
    // A generated distractor set can occasionally collapse; skip those.
    if (q.correct < 0 || q.options.length < 4) continue
    seen.add(q.prompt)
    out.push(q)
  }
  return out
}
