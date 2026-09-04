import { useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'
import { AppIcon } from '@/components/ui/AppIcon'


/**
 * First-launch onboarding (reference-matched): three full-bleed pastel slides
 * with clay characters, bilingual Hindi + English copy, segment progress,
 * Skip and Next/Start navigation. Shown once per browser (localStorage).
 */
const KEY = 'beubaba:onboarded'

type Slide = {
  art?: string
  icons?: { name: string; label: string }[]
  panel: string
  title: string
  titleHi: string
  body: string
  bodyHi: string
}

const SLIDES: Slide[] = [
  {
    art: '/assets/char-hero.webp',
    panel: 'bg-[#cfc4f6] dark:bg-[#332a63]',
    title: 'Welcome to BEU BABA!',
    titleHi: 'BEU BABA में आपका स्वागत है!',
    body: 'Your study companion for BEU — previous year papers, syllabus and notes in one place.',
    bodyHi: 'BEU का आपका अध्ययन साथी — पिछले वर्ष के पेपर, सिलेबस और नोट्स एक जगह।',
  },
  {
    art: '/assets/char-tablet.webp',
    panel: 'bg-[#ffd9b8] dark:bg-[#4a3324]',
    title: 'Practice made playful',
    titleHi: 'अभ्यास अब मज़ेदार',
    body: 'Attempt instant quizzes — your history and scores are saved on this device.',
    bodyHi: 'तुरंत क्विज़ दें — आपकी हिस्ट्री और स्कोर इसी डिवाइस पर सुरक्षित रहते हैं।',
  },
  {
    art: '/assets/char-trophy.webp',
    panel: 'bg-[#bcd7fb] dark:bg-[#243a5e]',
    title: 'Tools that help you win',
    titleHi: 'जीत में मददगार टूल्स',
    body: 'CGPA calculators, exam countdown, attendance and more — all free, all in one app.',
    bodyHi: 'CGPA कैलकुलेटर, परीक्षा काउंटडाउन, उपस्थिति और भी बहुत कुछ — सब एक ऐप में।',
  },
  {
    art: '',
    icons: [
      { name: 'courses', label: 'Study · पेपर' },
      { name: 'quiz', label: 'Quiz · अभ्यास' },
      { name: 'toolbox', label: 'Tools · टूल्स' },
      { name: 'progress', label: 'Profile · प्रगति' },
    ],
    panel: 'bg-[#bfe4d2] dark:bg-[#215847]',
    title: 'Where to find what',
    titleHi: 'क्या कहाँ मिलेगा',
    body: 'Papers & syllabus in Study, practice in Quiz, calculators in Tools, your stats in Profile.',
    bodyHi: 'पेपर और सिलेबस Study में, अभ्यास Quiz में, कैलकुलेटर Tools में, प्रगति Profile में।',
  },
]

export function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0)
  const reduced = useReducedMotion()
  const slide = SLIDES[idx]
  const last = idx === SLIDES.length - 1

  const finish = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* private mode: skip persisting, still dismiss */
    }
    onDone()
  }

  return (
    <div
      className={cn('fixed inset-0 z-[80] flex flex-col', slide.panel)}
      role="dialog"
      aria-modal="true"
      aria-label="App introduction"
    >
      {/* Pastel art panel */}
      <div className={cn('relative flex-1', slide.panel)}>
        <button
          type="button"
          onClick={finish}
          className="absolute right-5 top-[max(env(safe-area-inset-top),16px)] rounded-pill px-3 py-1.5 text-body-sm font-semibold text-ink-secondary/80 hover:text-ink"
        >
          Skip
        </button>
        {slide.icons && (
          <div className="absolute inset-0 flex items-center justify-center gap-4 px-6">
            {slide.icons.map((ic) => (
              <div key={ic.name} className="flex flex-col items-center gap-2">
                <AppIcon name={ic.name} className="size-16 drop-shadow-[0_10px_16px_rgba(30,20,80,0.25)]" />
                <span className="font-hindi text-caption font-semibold text-ink-secondary">{ic.label}</span>
              </div>
            ))}
          </div>
        )}
        {slide.art && (
          <motion.img
            key={idx}
            src={slide.art}
            alt=""
            initial={reduced ? false : { opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="bb-float absolute inset-0 m-auto max-h-[70%] w-auto object-contain p-6 drop-shadow-[0_18px_28px_rgba(40,30,90,0.25)]"
          />
        )}
      </div>

      {/* Bottom sheet */}
      <div className="rounded-t-[32px] bg-surface px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-7 shadow-[0_-18px_40px_rgba(28,33,64,0.12)]">
        <motion.div
          key={idx}
          initial={reduced ? false : { opacity: 0, x: 34 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-heading text-h2 text-ink">{slide.title}</h1>
          <p className="font-hindi mt-1 text-body-lg font-semibold text-ink-secondary">
            {slide.titleHi}
          </p>
          <p className="mt-3 text-body-sm text-ink-secondary">{slide.body}</p>
          <p className="font-hindi mt-1 text-body-sm text-ink-tertiary">{slide.bodyHi}</p>
        </motion.div>

        {/* Segment progress */}
        <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-pill transition-all',
                i === idx ? 'w-6 bg-ink' : 'w-2.5 bg-line',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => (last ? finish() : setIdx(idx + 1))}
          className="font-heading mt-6 w-full rounded-2xl bg-ink py-3.5 text-h3 text-canvas shadow-neu active:scale-[0.98] motion-reduce:active:scale-100"
        >
          {last ? 'Start · शुरू करें' : 'Next · आगे'}
        </button>
      </div>
    </div>
  )
}

export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}
