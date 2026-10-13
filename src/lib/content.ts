import type { SiteData, Content } from './types'
export const SB_URL = import.meta.env.VITE_SUPABASE_URL as string
export const SB_KEY = import.meta.env.VITE_SUPABASE_KEY as string

// Lean public loader: plain fetch against Supabase REST (no SDK in the public bundle).
export async function loadSite(): Promise<SiteData> {
  try {
    const h = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
    const pre = (window as unknown as { __site?: Promise<[unknown[], unknown[]]> }).__site
    const [c, p] = pre ? (await pre) as [{ key: string; value: unknown }[], never[]] : await Promise.all([
      fetch(`${SB_URL}/rest/v1/site_content?select=key,value`, { headers: h }).then(r => { if (!r.ok) throw 0; return r.json() }),
      fetch(`${SB_URL}/rest/v1/projects?select=*&featured=eq.true&order=sort_order`, { headers: h }).then(r => { if (!r.ok) throw 0; return r.json() }),
    ])
    if (!c.length) throw 0
    const content = Object.fromEntries(c.map((r: { key: string; value: unknown }) => [r.key, r.value])) as Content
    return { content, projects: p }
  } catch {
    // Offline / outage fallback: last exported snapshot
    return fetch('/content.json').then(r => r.json())
  }
}
