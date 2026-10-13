import { createClient, type Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Content, Project } from '../lib/types'
import { SB_URL, SB_KEY } from '../lib/content'

const sb = createClient(SB_URL, SB_KEY)
const ADMIN = 'akhtarshaikh0299@gmail.com'
type Tab = 'dashboard' | 'projects' | 'hero' | 'about' | 'skills' | 'experience' | 'contact' | 'resume' | 'seo'
const TABS: [Tab, string][] = [['dashboard', 'Dashboard'], ['projects', 'Projects'], ['hero', 'Hero'], ['about', 'About & headings'], ['skills', 'Skills & marquee'], ['experience', 'Experience'], ['contact', 'Contact & socials'], ['resume', 'Resume PDF'], ['seo', 'SEO']]

const inp = 'w-full rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30'
const btn = 'rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50'
const isUrl = (v?: string | null) => !v || /^(https?:\/\/|\/)/.test(v)

function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</span>{children}{hint && !error && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}{error && <span role="alert" className="mt-1 block text-xs text-rose-400">{error}</span>}</label>
}
const Card = ({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) => (
  <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[.04] to-transparent p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold uppercase tracking-tight">{title}</h2>{actions}</div><div className="space-y-4">{children}</div></section>
)
const List = ({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) => (
  <Field label={label} hint="Comma-separated"><input className={inp} value={value.join(', ')} onChange={e => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></Field>
)

async function upload(file: File, folder: string) {
  if (file.size > 50 * 1024 * 1024) throw new Error('Max 50 MB')
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`
  const { error } = await sb.storage.from('media').upload(path, file, { upsert: false, contentType: file.type })
  if (error) throw error
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl
}

function Upload({ value, onChange, accept, folder, label }: { value?: string | null; onChange: (url: string, type: string) => void; accept: string; folder: string; label: string }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const isVid = value && /\.(mp4|webm)(\?|$)/i.test(value), isPdf = value && /\.pdf(\?|$)/i.test(value)
  return (
    <Field label={label} error={err}>
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-40 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-black/40 text-xs text-zinc-500">
          {!value ? 'No file' : isPdf ? <a className="text-indigo-300" href={value} target="_blank" rel="noreferrer">Open PDF ↗</a> : isVid ? <video src={value} muted className="h-full w-full object-cover" /> : <img src={value} alt="Preview" className="h-full w-full object-cover" />}
        </div>
        <div className="space-y-2">
          <label className={btn + ' inline-block cursor-pointer border border-white/15 hover:bg-white/5'}>{busy ? 'Uploading…' : 'Upload file'}
            <input type="file" accept={accept} className="sr-only" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); setErr(''); try { onChange(await upload(f, folder), f.type.startsWith('video') ? 'video' : 'image') } catch (x) { setErr((x as Error).message) } setBusy(false) }} />
          </label>
          {value && <button type="button" className="block text-xs text-zinc-400 hover:text-rose-300" onClick={() => onChange('', 'image')}>Remove</button>}
        </div>
      </div>
    </Field>
  )
}

function Login() {
  const [email, setEmail] = useState(ADMIN), [pw, setPw] = useState(''), [mode, setMode] = useState<'in' | 'up'>('in'), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  async function go(e: React.FormEvent) {
    e.preventDefault(); setMsg('')
    if (pw.length < 10) return setMsg('Password must be at least 10 characters.')
    setBusy(true)
    const r = mode === 'in' ? await sb.auth.signInWithPassword({ email, password: pw }) : await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin + '/admin' } })
    setBusy(false)
    if (r.error) setMsg(r.error.message.includes('Database error') ? 'Sign-ups are restricted to the site owner.' : r.error.message)
    else if (mode === 'up') setMsg('Check your inbox to confirm your email, then sign in.')
  }
  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(60%_50%_at_70%_0%,rgba(91,92,255,.25),transparent)] px-5">
      <form onSubmit={go} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-ink/80 p-8 backdrop-blur" noValidate>
        <h1 className="font-display text-3xl font-semibold uppercase">Admin<span className="text-accent">.</span></h1>
        <p className="text-sm text-zinc-400">{mode === 'in' ? 'Sign in to manage the portfolio.' : 'One-time owner sign-up.'}</p>
        <Field label="Email"><input className={inp} type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></Field>
        <Field label="Password"><input className={inp} type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={pw} onChange={e => setPw(e.target.value)} required minLength={10} /></Field>
        {msg && <p role="status" className="text-sm text-amber-300">{msg}</p>}
        <button disabled={busy} className={btn + ' w-full bg-bone text-ink hover:bg-white'}>{busy ? '…' : mode === 'in' ? 'Sign in' : 'Create owner account'}</button>
        <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="w-full text-center text-xs text-zinc-400 hover:text-white">{mode === 'in' ? 'First time? Create the owner account' : 'Have an account? Sign in'}</button>
      </form>
    </div>
  )
}

function ProjectEditor({ p, onSave, onCancel }: { p: Project; onSave: (p: Project) => Promise<void>; onCancel: () => void }) {
  const [f, setF] = useState<Project>(p), [busy, setBusy] = useState(false)
  const set = <K extends keyof Project>(k: K, v: Project[K]) => setF(x => ({ ...x, [k]: v }))
  const errs = useMemo(() => {
    const e: Record<string, string> = {}
    if (!f.title.trim()) e.title = 'Title is required'
    else if (f.title.length > 120) e.title = 'Max 120 characters'
    if (!isUrl(f.live_url)) e.live_url = 'Must start with https:// or /'
    if (!isUrl(f.repo_url)) e.repo_url = 'Must start with https:// or /'
    if (f.description.length > 1200) e.description = 'Max 1200 characters'
    return e
  }, [f])
  const ok = !Object.keys(errs).length
  return (
    <Card title={p.id ? 'Edit project' : 'New project'} actions={<div className="flex gap-2"><button type="button" onClick={onCancel} className={btn + ' border border-white/15 hover:bg-white/5'}>Cancel</button><button disabled={!ok || busy} onClick={async () => { setBusy(true); await onSave(f); setBusy(false) }} className={btn + ' bg-indigo-500 text-white hover:bg-indigo-400'}>{busy ? 'Saving…' : 'Save project'}</button></div>}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title *" error={errs.title}><input className={inp} value={f.title} onChange={e => set('title', e.target.value)} /></Field>
        <Field label="Type"><select className={inp} value={f.kind} onChange={e => set('kind', e.target.value as Project['kind'])}><option value="build">Featured build (horizontal showcase)</option><option value="repo">GitHub repo (list)</option></select></Field>
        <Field label="Tag / label"><input className={inp} value={f.tag ?? ''} onChange={e => set('tag', e.target.value)} placeholder="Personal project" /></Field>
        <Field label="Language"><input className={inp} value={f.language ?? ''} onChange={e => set('language', e.target.value)} /></Field>
        <Field label="Live link" error={errs.live_url}><input className={inp} value={f.live_url ?? ''} onChange={e => set('live_url', e.target.value || null)} placeholder="https://" /></Field>
        <Field label="Repo link" error={errs.repo_url}><input className={inp} value={f.repo_url ?? ''} onChange={e => set('repo_url', e.target.value || null)} placeholder="https://github.com/…" /></Field>
      </div>
      <Field label="Description" error={errs.description} hint={`${f.description.length}/1200`}><textarea rows={4} className={inp} value={f.description} onChange={e => set('description', e.target.value)} /></Field>
      <List label="Tech" value={f.tech} onChange={v => set('tech', v)} />
      <div className="grid gap-4 md:grid-cols-2">
        <Upload label="Cover image or video" value={f.cover_url} accept="image/*,video/mp4,video/webm" folder="covers" onChange={(u, t) => setF(x => ({ ...x, cover_url: u || null, cover_type: t as Project['cover_type'] }))} />
        <div className="space-y-4">
          <Field label={`Accent hue (${f.hue})`} hint="Used for gradient mockups when there's no cover"><input type="range" min={0} max={360} value={f.hue} onChange={e => set('hue', +e.target.value)} className="w-full accent-indigo-400" style={{ background: `hsl(${f.hue} 80% 60%)` }} /></Field>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={f.featured} onChange={e => set('featured', e.target.checked)} className="h-4 w-4 accent-indigo-400" /> Featured (visible on the site)</label>
        </div>
      </div>
    </Card>
  )
}

function Projects({ toast }: { toast: (m: string) => void }) {
  const [list, setList] = useState<Project[]>([]), [edit, setEdit] = useState<Project | null>(null), [drag, setDrag] = useState<number | null>(null)
  const load = () => sb.from('projects').select('*').order('sort_order').then(({ data }) => setList((data as Project[]) ?? []))
  useEffect(() => { load() }, [])
  async function save(p: Project) {
    const row = { ...p, sort_order: p.id ? p.sort_order : list.length, updated_at: new Date().toISOString() }
    const { error } = p.id ? await sb.from('projects').update(row).eq('id', p.id) : await sb.from('projects').insert(row)
    if (error) return toast('Error: ' + error.message)
    toast('Project saved'); setEdit(null); load()
  }
  async function persistOrder(next: Project[]) {
    setList(next)
    const res = await Promise.all(next.map((p, i) => sb.from('projects').update({ sort_order: i }).eq('id', p.id!)))
    toast(res.some(r => r.error) ? 'Reorder failed' : 'Order saved')
  }
  function move(from: number, to: number) { if (from === to || to < 0 || to >= list.length) return; const n = [...list]; const [x] = n.splice(from, 1); n.splice(to, 0, x); persistOrder(n) }
  async function del(p: Project) { if (!confirm(`Delete “${p.title}”?`)) return; const { error } = await sb.from('projects').delete().eq('id', p.id!); toast(error ? error.message : 'Deleted'); load() }
  async function toggle(p: Project) { await sb.from('projects').update({ featured: !p.featured }).eq('id', p.id!); load() }
  if (edit) return <ProjectEditor p={edit} onSave={save} onCancel={() => setEdit(null)} />
  return (
    <Card title={`Projects (${list.length})`} actions={<button onClick={() => setEdit({ title: '', description: '', tech: [], kind: 'build', hue: 240, sort_order: list.length, featured: true, cover_type: 'image' })} className={btn + ' bg-indigo-500 text-white hover:bg-indigo-400'}>+ New project</button>}>
      <p className="text-xs text-zinc-500">Drag rows to reorder (or use the arrow buttons). Order is saved automatically.</p>
      <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
        {list.map((p, i) => (
          <li key={p.id} draggable onDragStart={() => setDrag(i)} onDragOver={e => e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null) }}
            className={'flex items-center gap-4 bg-white/[.02] px-4 py-3 transition hover:bg-white/[.05] ' + (drag === i ? 'opacity-40' : '')}>
            <span className="cursor-grab select-none text-zinc-500" aria-hidden>⋮⋮</span>
            <div className="h-10 w-16 shrink-0 overflow-hidden rounded-md" style={{ background: `linear-gradient(135deg,hsl(${p.hue} 80% 55%),hsl(${p.hue - 45} 80% 40%))` }}>{p.cover_url && (p.cover_type === 'video' ? <video src={p.cover_url} muted className="h-full w-full object-cover" /> : <img src={p.cover_url} alt="" className="h-full w-full object-cover" />)}</div>
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{p.title}</p><p className="text-xs text-zinc-500">{p.kind === 'build' ? 'Featured build' : 'GitHub repo'} · {p.tech.slice(0, 4).join(', ')}</p></div>
            <button onClick={() => toggle(p)} className={'rounded-full px-2.5 py-1 text-xs ' + (p.featured ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-zinc-400')} aria-pressed={p.featured}>{p.featured ? 'Visible' : 'Hidden'}</button>
            <div className="flex gap-1 text-zinc-400"><button aria-label="Move up" onClick={() => move(i, i - 1)} className="px-1.5 hover:text-white">↑</button><button aria-label="Move down" onClick={() => move(i, i + 1)} className="px-1.5 hover:text-white">↓</button></div>
            <button onClick={() => setEdit(p)} className="text-sm text-indigo-300 hover:text-white">Edit</button>
            <button onClick={() => del(p)} className="text-sm text-zinc-500 hover:text-rose-300">Delete</button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [tab, setTab] = useState<Tab>((location.hash.slice(1) as Tab) || 'dashboard')
  const [c, setC] = useState<Content | null>(null), [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false), [toastMsg, setToast] = useState('')
  const [stats, setStats] = useState({ projects: 0, featured: 0 })
  const toast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600) }
  useEffect(() => { sb.auth.getSession().then(({ data }) => setSession(data.session)); const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s)); return () => data.subscription.unsubscribe() }, [])
  useEffect(() => { document.title = 'Admin · Portfolio'; location.hash = tab }, [tab])
  useEffect(() => {
    if (!session) return
    sb.from('site_content').select('key,value').then(({ data }) => setC(Object.fromEntries((data ?? []).map(r => [r.key, r.value])) as Content))
    sb.from('projects').select('featured').then(({ data }) => setStats({ projects: data?.length ?? 0, featured: data?.filter(x => x.featured).length ?? 0 }))
  }, [session])
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault() }; addEventListener('beforeunload', h); return () => removeEventListener('beforeunload', h) }, [dirty])

  if (session === undefined) return <div className="grid min-h-screen place-items-center text-zinc-400">Loading…</div>
  if (!session) return <Login />
  if (session.user.email?.toLowerCase() !== ADMIN) return <div className="grid min-h-screen place-items-center"><div className="text-center"><p>This account isn't the site owner.</p><button className="mt-4 text-indigo-300" onClick={() => sb.auth.signOut()}>Sign out</button></div></div>

  const up = <K extends keyof Content>(k: K, v: Content[K]) => { setC(x => x && { ...x, [k]: v }); setDirty(true) }
  const errors: string[] = []
  if (c) {
    if (!c.hero.first.trim() || !c.hero.last.trim()) errors.push('Hero name is required')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.contact.email)) errors.push('Contact email is invalid')
    c.contact.socials.forEach(s => { if (!isUrl(s.url)) errors.push(`${s.label || 'Social'} URL is invalid`) })
    if (c.seo.title.length > 70) errors.push('SEO title should be ≤ 70 characters')
    if (c.seo.description.length > 160) errors.push('SEO description should be ≤ 160 characters')
  }
  async function saveAll() {
    if (!c || errors.length) return
    setSaving(true)
    const { error } = await sb.from('site_content').upsert(Object.entries(c).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() })))
    setSaving(false); if (error) return toast('Error: ' + error.message)
    setDirty(false); toast('All changes published')
  }

  const T = (k: keyof Content['hero'], label: string, area = false) => c && <Field label={label}>{area ? <textarea rows={3} className={inp} value={c.hero[k]} onChange={e => up('hero', { ...c.hero, [k]: e.target.value })} /> : <input className={inp} value={c.hero[k]} onChange={e => up('hero', { ...c.hero, [k]: e.target.value })} />}</Field>

  return (
    <div className="min-h-screen bg-ink text-zinc-100 md:flex">
      <aside className="border-b border-white/10 p-5 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <p className="font-display text-xl font-semibold uppercase">Studio<span className="text-accent">.</span></p>
        <p className="mt-1 truncate text-xs text-zinc-500">{session.user.email}</p>
        <nav aria-label="Admin" className="mt-6 flex gap-1 overflow-x-auto md:flex-col">
          {TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={'whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition ' + (tab === k ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white')}>{l}</button>)}
        </nav>
        <div className="mt-6 hidden space-y-2 md:block">
          <a href="/" target="_blank" rel="noreferrer" className={btn + ' block border border-white/15 text-center hover:bg-white/5'}>Live preview ↗</a>
          <button onClick={() => sb.auth.signOut()} className="w-full text-xs text-zinc-500 hover:text-white">Sign out</button>
        </div>
      </aside>
      <main className="flex-1 p-5 md:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold uppercase tracking-tight">{TABS.find(t => t[0] === tab)?.[1]}</h1>
          {tab !== 'projects' && tab !== 'dashboard' && <div className="flex items-center gap-3">{dirty && <span className="text-xs text-amber-300">Unsaved changes</span>}<button disabled={!dirty || saving || errors.length > 0} onClick={saveAll} className={btn + ' bg-indigo-500 text-white hover:bg-indigo-400'}>{saving ? 'Publishing…' : 'Publish changes'}</button></div>}
        </div>
        {errors.length > 0 && tab !== 'projects' && <ul role="alert" className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{errors.map(e => <li key={e}>• {e}</li>)}</ul>}
        {!c ? <p className="text-zinc-400">Loading content…</p> : <div className="max-w-4xl space-y-6">
          {tab === 'dashboard' && <>
            <div className="grid gap-4 sm:grid-cols-3">
              {[['Projects', stats.projects], ['Visible on site', stats.featured], ['Experience entries', c.experience.length]].map(([l, v]) => <div key={l} className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-transparent p-6"><p className="text-xs uppercase tracking-wider text-zinc-400">{l}</p><p className="mt-2 font-display text-4xl font-semibold">{v}</p></div>)}
            </div>
            <Card title="Quick actions">
              <div className="flex flex-wrap gap-3">{(['projects', 'hero', 'experience', 'resume', 'seo'] as Tab[]).map(t => <button key={t} onClick={() => setTab(t)} className={btn + ' border border-white/15 capitalize hover:bg-white/5'}>Edit {t}</button>)}<a href="/" target="_blank" rel="noreferrer" className={btn + ' bg-bone text-ink'}>Open live preview ↗</a></div>
              <p className="text-sm text-zinc-400">Content edits go live as soon as you publish — the public site reads directly from the database.</p>
            </Card>
          </>}
          {tab === 'projects' && <Projects toast={toast} />}
          {tab === 'hero' && <Card title="Hero">
            <div className="grid gap-4 md:grid-cols-2">{T('first', 'First name')}{T('last', 'Last name')}</div>
            {T('title', 'Title')}{T('badge', 'Availability badge')}{T('pitch', 'Pitch', true)}{T('meta', 'Meta line')}
            <div className="grid gap-4 md:grid-cols-2">{T('cta_primary', 'Primary button')}{T('cta_secondary', 'Secondary button')}</div>
          </Card>}
          {tab === 'about' && <><Card title="About">
            <Field label="Kicker"><input className={inp} value={c.about.kicker} onChange={e => up('about', { ...c.about, kicker: e.target.value })} /></Field>
            <Field label="About text" hint={`${c.about.text.length} characters`}><textarea rows={6} className={inp} value={c.about.text} onChange={e => up('about', { ...c.about, text: e.target.value })} /></Field>
            <Upload label="Hero portrait (capsule)" accept="image/png,image/webp,image/avif,image/jpeg" folder="portrait" value={c.about.photo_url} onChange={u => up('about', { ...c.about, photo_url: u })} />
            <p className="text-xs text-zinc-500">Shown in the hero capsule over a violet gradient. Best: a background-removed PNG/WebP (transparent), head and shoulders, ~840 px wide. Leave empty to show the silhouette placeholder.</p>
            <Field label="Photo alt text"><input className={inp} value={c.about.photo_alt ?? ''} onChange={e => up('about', { ...c.about, photo_alt: e.target.value })} /></Field>
            <Field label="Quick facts" hint="One per line as Label: Value"><textarea rows={3} className={inp} value={(c.about.facts ?? []).map(f => `${f.k}: ${f.v}`).join('\n')} onChange={e => up('about', { ...c.about, facts: e.target.value.split('\n').map(l => { const i = l.indexOf(':'); return i < 0 ? { k: l.trim(), v: '' } : { k: l.slice(0, i).trim(), v: l.slice(i + 1).trim() } }).filter(f => f.k) })} /></Field>
          </Card><Card title="Section headings">{(Object.keys(c.sections) as (keyof Content['sections'])[]).map(k => <Field key={k} label={k.replace('_', ' ')} hint="Use a new line to break the heading"><textarea rows={2} className={inp} value={c.sections[k]} onChange={e => up('sections', { ...c.sections, [k]: e.target.value })} /></Field>)}</Card></>}
          {tab === 'skills' && <><Card title="Skill groups" actions={<button className="text-sm text-indigo-300" onClick={() => up('skills', [...c.skills, { group: 'New group', items: [] }])}>+ Add group</button>}>
            {c.skills.map((g, i) => <div key={i} className="grid gap-3 rounded-xl border border-white/5 p-4 md:grid-cols-[1fr_2fr_auto]">
              <Field label="Group"><input className={inp} value={g.group} onChange={e => up('skills', c.skills.map((x, j) => j === i ? { ...x, group: e.target.value } : x))} /></Field>
              <List label="Items" value={g.items} onChange={v => up('skills', c.skills.map((x, j) => j === i ? { ...x, items: v } : x))} />
              <button className="self-end pb-2 text-xs text-zinc-500 hover:text-rose-300" onClick={() => up('skills', c.skills.filter((_, j) => j !== i))}>Remove</button></div>)}
          </Card><Card title="Marquee"><List label="Primary row" value={c.marquee.primary} onChange={v => up('marquee', { ...c.marquee, primary: v })} /><List label="Secondary row" value={c.marquee.secondary} onChange={v => up('marquee', { ...c.marquee, secondary: v })} /></Card></>}
          {tab === 'experience' && <Card title="Experience" actions={<button className="text-sm text-indigo-300" onClick={() => up('experience', [{ role: '', org: '', where: '', when: '', points: [] }, ...c.experience])}>+ Add role</button>}>
            {c.experience.map((j, i) => { const set = (k: string, v: unknown) => up('experience', c.experience.map((x, n) => n === i ? { ...x, [k]: v } : x)); return <div key={i} className="space-y-3 rounded-xl border border-white/5 p-4">
              <div className="grid gap-3 md:grid-cols-2"><Field label="Role" error={!j.role ? 'Required' : ''}><input className={inp} value={j.role} onChange={e => set('role', e.target.value)} /></Field><Field label="Company"><input className={inp} value={j.org} onChange={e => set('org', e.target.value)} /></Field><Field label="Location"><input className={inp} value={j.where} onChange={e => set('where', e.target.value)} /></Field><Field label="Dates"><input className={inp} value={j.when} onChange={e => set('when', e.target.value)} /></Field></div>
              <Field label="Highlights" hint="One per line"><textarea rows={4} className={inp} value={j.points.join('\n')} onChange={e => set('points', e.target.value.split('\n'))} /></Field>
              <div className="flex gap-4 text-xs text-zinc-400"><button onClick={() => { if (i) { const n = [...c.experience];[n[i - 1], n[i]] = [n[i], n[i - 1]]; up('experience', n) } }}>Move up</button><button className="hover:text-rose-300" onClick={() => up('experience', c.experience.filter((_, n) => n !== i))}>Remove</button></div></div> })}
          </Card>}
          {tab === 'contact' && <Card title="Contact" actions={<button className="text-sm text-indigo-300" onClick={() => up('contact', { ...c.contact, socials: [...c.contact.socials, { label: '', url: 'https://' }] })}>+ Add social</button>}>
            <div className="grid gap-4 md:grid-cols-2"><Field label="Email"><input className={inp} type="email" value={c.contact.email} onChange={e => up('contact', { ...c.contact, email: e.target.value })} /></Field><Field label="Phone"><input className={inp} value={c.contact.phone} onChange={e => up('contact', { ...c.contact, phone: e.target.value })} /></Field></div>
            <Field label="Location"><input className={inp} value={c.contact.location} onChange={e => up('contact', { ...c.contact, location: e.target.value })} /></Field>
            {c.contact.socials.map((s, i) => <div key={i} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"><Field label="Label"><input className={inp} value={s.label} onChange={e => up('contact', { ...c.contact, socials: c.contact.socials.map((x, n) => n === i ? { ...x, label: e.target.value } : x) })} /></Field><Field label="URL" error={isUrl(s.url) ? '' : 'Invalid URL'}><input className={inp} value={s.url} onChange={e => up('contact', { ...c.contact, socials: c.contact.socials.map((x, n) => n === i ? { ...x, url: e.target.value } : x) })} /></Field><button className="self-end pb-2 text-xs text-zinc-500 hover:text-rose-300" onClick={() => up('contact', { ...c.contact, socials: c.contact.socials.filter((_, n) => n !== i) })}>Remove</button></div>)}
          </Card>}
          {tab === 'resume' && <Card title="Resume"><Upload label="Resume PDF" accept="application/pdf" folder="resume" value={c.resume.url} onChange={u => up('resume', { ...c.resume, url: u || '/Akhtar_Shaikh_Resume.pdf' })} /><Field label="Button label"><input className={inp} value={c.resume.label} onChange={e => up('resume', { ...c.resume, label: e.target.value })} /></Field></Card>}
          {tab === 'seo' && <Card title="SEO & sharing">
            <Field label="Page title" hint={`${c.seo.title.length}/70`}><input className={inp} value={c.seo.title} onChange={e => up('seo', { ...c.seo, title: e.target.value })} /></Field>
            <Field label="Meta description" hint={`${c.seo.description.length}/160`}><textarea rows={3} className={inp} value={c.seo.description} onChange={e => up('seo', { ...c.seo, description: e.target.value })} /></Field>
            <Upload label="Share (OG) image" accept="image/*" folder="og" value={c.seo.og_image} onChange={u => up('seo', { ...c.seo, og_image: u || '/og.png' })} />
            <div className="rounded-xl border border-white/10 p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">Google preview</p><p className="mt-2 text-lg text-indigo-300">{c.seo.title}</p><p className="text-sm text-zinc-400">{c.seo.description}</p></div>
          </Card>}
        </div>}
      </main>
      {toastMsg && <div role="status" className="fixed bottom-6 right-6 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm shadow-2xl">{toastMsg}</div>}
    </div>
  )
}
