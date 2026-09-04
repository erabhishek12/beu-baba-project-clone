/**
 * Developer & project information (spec §74–76). ONLY verified, supplied links
 * are used here — no invented credentials, awards or claims.
 */
export interface SocialLink {
  label: string
  handle: string
  url: string
}

export const APP_INFO = {
  name: 'BEU BABA',
  version: '1.0.0',
  tagline: 'Your complete academic companion',
}

export const DEVELOPER = {
  name: 'Er. Abhi',
  role: 'Developer',
  portfolio: 'https://erabhi.in',
  portfolioAlt: 'https://i-am-er-abhi.vercel.app',
}

export const DEVELOPER_SOCIALS: SocialLink[] = [
  { label: 'Portfolio', handle: 'erabhi.in', url: 'https://erabhi.in' },
  {
    label: 'Portfolio (mirror)',
    handle: 'i-am-er-abhi.vercel.app',
    url: 'https://i-am-er-abhi.vercel.app',
  },
  {
    label: 'Instagram',
    handle: '@naturelensbyabhi',
    url: 'https://www.instagram.com/naturelensbyabhi',
  },
  { label: 'Instagram', handle: '@er_abhi2026', url: 'https://www.instagram.com/er_abhi2026' },
]

export const PROJECT_SOCIALS: SocialLink[] = [
  { label: 'Telegram', handle: 't.me/apnabeu', url: 'https://t.me/apnabeu' },
  { label: 'YouTube', handle: '@apnabeu', url: 'https://youtube.com/@apnabeu' },
  {
    label: 'WhatsApp Channel',
    handle: 'BEU BABA updates',
    url: 'https://whatsapp.com/channel/0029Vb7ClRm0lwgtMQ2R980D',
  },
]
