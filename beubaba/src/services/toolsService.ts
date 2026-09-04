/**
 * Tools hub service — data-driven from the extracted BEU dataset (spec §24 +
 * product master). Provides: result-check links, important portals, government
 * exams and Bihar engineering colleges. External destinations open as plain,
 * safe URLs — BEU BABA never claims to own the external provider's response.
 */
import { delay } from '@/services/storage'
import govExamsSeed from '@/services/mock/seed_gov_exams.json'
import portalsSeed from '@/services/mock/seed_portals.json'
import collegesSeed from '@/services/mock/seed_colleges.json'

export interface GovExamSection {
  heading: string
  body: string[]
}
export interface GovExam {
  id: string
  name: string
  category: string
  summary: string
  sections: GovExamSection[]
}

export interface PortalLink {
  name: string
  url: string
  desc?: string
  sem?: number
}
export interface PortalGroup {
  key: string
  title: string
  items: PortalLink[]
}

export interface College {
  name: string
  url: string
  host: string
}

const govExams = govExamsSeed as unknown as GovExam[]
const portals = portalsSeed as unknown as Record<string, { title: string; items: PortalLink[] }>
const colleges = collegesSeed as unknown as College[]

export const toolsService = {
  // ---- Government exams ----
  async listGovExams(category?: string): Promise<GovExam[]> {
    await delay(100)
    return govExams.filter((e) => !category || category === 'All' || e.category === category)
  },
  async getGovExam(id: string): Promise<GovExam | undefined> {
    await delay(80)
    return govExams.find((e) => e.id === id)
  },
  govExamCategories(): string[] {
    return ['All', ...[...new Set(govExams.map((e) => e.category))].sort()]
  },

  // ---- Portals ----
  async listPortals(): Promise<PortalGroup[]> {
    await delay(80)
    return Object.entries(portals).map(([key, g]) => ({ key, title: g.title, items: g.items }))
  },
  async portalGroup(key: string): Promise<PortalGroup | undefined> {
    await delay(60)
    const g = portals[key]
    return g ? { key, title: g.title, items: g.items } : undefined
  },

  // ---- Colleges ----
  async listColleges(query?: string): Promise<College[]> {
    await delay(80)
    const q = (query ?? '').trim().toLowerCase()
    return colleges.filter((c) => !q || c.name.toLowerCase().includes(q))
  },
}
