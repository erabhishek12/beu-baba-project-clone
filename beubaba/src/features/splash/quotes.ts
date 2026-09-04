/**
 * Daily motivational quotes. A quote is picked deterministically from the
 * day-of-year so every user sees the same quote on a given day and it changes
 * automatically each day (no backend needed).
 */
export const QUOTES: { text: string; author: string }[] = [
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Study while others are sleeping; work while others are loafing.', author: 'William A. Ward' },
  { text: 'Don’t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King' },
  { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  { text: 'It always seems impossible until it’s done.', author: 'Nelson Mandela' },
  { text: 'Small steps every day add up to big results.', author: 'Unknown' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Your only limit is your mind.', author: 'Unknown' },
  { text: 'Dream big. Start small. Act now.', author: 'Robin Sharma' },
  { text: 'Focus on progress, not perfection.', author: 'Unknown' },
  { text: 'Hard work beats talent when talent doesn’t work hard.', author: 'Tim Notke' },
  { text: 'A little progress each day adds up to big results.', author: 'Unknown' },
  { text: 'Believe you can and you’re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Strive for progress, not perfection.', author: 'Unknown' },
  { text: 'Every accomplishment starts with the decision to try.', author: 'Unknown' },
  { text: 'Knowledge is power. Apply it daily.', author: 'Unknown' },
  { text: 'You don’t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { text: 'Consistency is what transforms average into excellence.', author: 'Unknown' },
  { text: 'Wake up with determination. Go to bed with satisfaction.', author: 'Unknown' },
  { text: 'The best way to predict your future is to create it.', author: 'Abraham Lincoln' },
  { text: 'Do something today that your future self will thank you for.', author: 'Unknown' },
  { text: 'Difficult roads often lead to beautiful destinations.', author: 'Unknown' },
  { text: 'Great things never come from comfort zones.', author: 'Unknown' },
  { text: 'One day or day one. You decide.', author: 'Unknown' },
  { text: 'Study smart, stay curious, keep growing.', author: 'BEU BABA' },
]

/** Day of year: 1..366. Local time. */
export function dayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}

export function quoteOfTheDay(d = new Date()) {
  return QUOTES[dayOfYear(d) % QUOTES.length]
}

/** Local calendar key e.g. "2026-09-01" for once-a-day gating. */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export function timeOfDay(d = new Date()): TimeOfDay {
  const h = d.getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

export function greeting(name?: string, d = new Date()): string {
  const t = timeOfDay(d)
  const label =
    t === 'morning'
      ? 'Good morning'
      : t === 'afternoon'
        ? 'Good afternoon'
        : t === 'evening'
          ? 'Good evening'
          : 'Good night'
  return name ? `${label}, ${name}` : label
}
