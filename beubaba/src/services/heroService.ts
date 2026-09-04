import { store } from '@/services/storage'

/**
 * Home hero banner content — editable from the admin panel (Admin → Home hero)
 * and persisted per device until Supabase CMS lands (Phase 10 swaps the
 * storage backend without touching consumers).
 */
export interface HeroContent {
  title: string
  subtitle: string
  cta: string
  to: string
}

const KEY = 'beubaba:hero'

export const HERO_DEFAULT: HeroContent = {
  title: "Let's make learning fun!",
  subtitle: 'Papers, syllabus & quizzes for your semester.',
  cta: 'Start learning',
  to: '/study',
}

export const heroService = {
  get(): HeroContent {
    const saved = store.get<Partial<HeroContent> | null>(KEY, null)
    return { ...HERO_DEFAULT, ...(saved ?? {}) }
  },
  save(hero: HeroContent): void {
    store.set(KEY, hero)
  },
  reset(): void {
    store.set(KEY, HERO_DEFAULT)
  },
}
