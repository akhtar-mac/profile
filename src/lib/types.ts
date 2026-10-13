export type Project = { id?: string; title: string; tag?: string | null; description: string; tech: string[]; live_url?: string | null; repo_url?: string | null; cover_url?: string | null; cover_type?: 'image' | 'video'; kind: 'build' | 'repo'; language?: string | null; hue: number; sort_order: number; featured: boolean }
export type Job = { role: string; org: string; where: string; when: string; points: string[] }
export type Content = {
  seo: { title: string; description: string; og_image: string }
  hero: { first: string; last: string; badge: string; title: string; pitch: string; meta: string; cta_primary: string; cta_secondary: string }
  about: { kicker: string; text: string; photo_url?: string; photo_alt?: string; facts?: { k: string; v: string }[] }
  sections: { skills: string; experience: string; work: string; work_sub: string; repos: string; contact: string; contact_sub?: string; eyebrow_about?: string; eyebrow_skills?: string; eyebrow_experience?: string; eyebrow_work?: string; eyebrow_repos?: string; eyebrow_contact?: string }
  marquee: { primary: string[]; secondary: string[] }
  skills: { group: string; items: string[] }[]
  experience: Job[]
  contact: { email: string; phone: string; location: string; socials: { label: string; url: string }[] }
  resume: { url: string; label: string }
}
export type SiteData = { content: Content; projects: Project[] }
