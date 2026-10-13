import { useEffect, type ReactNode } from 'react'
import type { SiteData } from './lib/types'
import Space from './Space'
import { ICONS } from './lib/icons'

function ToolIcon({ name, size = 18 }: { name: string; size?: number }) {
  const ic = ICONS[name]
  const hex = ic && parseInt(ic[1], 16) < 0x333333 ? 'efe9df' : ic?.[1]
  if (!ic) return <span aria-hidden className="tool-ico grid place-items-center rounded-md border border-white/15 font-mono text-[9px] font-medium" style={{ width: size, height: size }}>{name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()}</span>
  return <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} className="tool-ico" style={{ ['--brand' as string]: '#' + hex }}><path d={ic[0]} /></svg>
}

const Split = ({ text }: { text: string }) => (
  <span><span className="sr-only">{text.replace(/\n/g, ' ')}</span>
    {text.split('\n').map((l, i) => (
      <span key={i} className="line" aria-hidden>
        {l.split(' ').map((w, j, arr) => <span key={j} className="inline-block whitespace-nowrap">{[...w].map((c, k) => <span key={k} className="ch">{c}</span>)}{j < arr.length - 1 && <span className="ch">&nbsp;</span>}</span>)}
      </span>
    ))}
  </span>
)

const Eyebrow = ({ n, t, dark }: { n: string; t: string; dark?: boolean }) => (
  <p data-reveal className={'eyebrow mb-7 flex items-center gap-3 ' + (dark ? 'text-zinc-700' : 'text-muted')}>
    <span className={dark ? 'text-ember' : 'text-accent'}>{n}</span><span aria-hidden className={'h-px w-8 ' + (dark ? 'bg-ink/25' : 'bg-white/20')} />{t}
  </p>
)

function Section({ id, n, k, title, children, bg }: { id: string; n: string; k: string; title: string; children: ReactNode; bg: number }) {
  return (
    <section id={id} data-bg={bg} aria-labelledby={id + '-h'} className="band px-5 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <Eyebrow n={n} t={k} />
        <h2 id={id + '-h'} className="split mb-12 font-display text-d1 font-extrabold sm:mb-16"><Split text={title} /></h2>
        {children}
      </div>
    </section>
  )
}

function Cover({ hue, title, tech, cover, type }: { hue: number; title: string; tech: string[]; cover?: string | null; type?: string }) {
  if (cover) return type === 'video'
    ? <video className="preview absolute inset-0 h-full w-full object-cover" src={cover} muted loop playsInline autoPlay preload="none" aria-hidden />
    : <img className="preview absolute inset-0 h-full w-full object-cover" src={cover} alt="" loading="lazy" decoding="async" width={1200} height={750} />
  return (
    <div className="preview absolute inset-0" style={{ background: `radial-gradient(110% 90% at 0% 0%, hsl(${hue} 70% 62% / .5), transparent 55%), radial-gradient(100% 80% at 100% 100%, hsl(${hue - 45} 75% 55% / .4), transparent 60%), #0a0c18` }} aria-hidden>
      <div className="absolute inset-x-6 bottom-0 top-10 rounded-t-xl border border-white/15 bg-black/40 p-5 font-mono text-[11px] leading-6 text-white/70">
        <p className="text-white">$ {title.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-$/, '')}</p>{tech.slice(0, 5).map(t => <p key={t}>› {t}</p>)}
      </div>
    </div>
  )
}

function Portrait({ src, alt }: { src?: string; alt: string }) {
  const local = src?.startsWith('/portrait/')
  return (
    <div className="capsule-wrap hero-fade relative mx-auto w-[min(68%,16rem)] lg:absolute lg:right-[7vw] lg:top-[15vh] lg:mx-0 lg:w-[clamp(16rem,25vw,25rem)]">
      <span aria-hidden className="capsule-glow" />
      <figure className="capsule relative aspect-[4/5]"><span aria-hidden className="capsule-stars" /><span aria-hidden className="capsule-halo" />
        {src ? (
          <picture>
            {local && <source media="(max-width: 767px)" type="image/avif" srcSet="/portrait/portrait@1x.avif" />}
            {local && <source media="(max-width: 767px)" type="image/webp" srcSet="/portrait/portrait@1x.webp" />}
            {local && <source type="image/avif" srcSet="/portrait/portrait@1x.avif 1x, /portrait/portrait@2x.avif 2x" />}
            {local && <source type="image/webp" srcSet="/portrait/portrait@1x.webp 1x, /portrait/portrait@2x.webp 2x" />}
            <img src={src} alt={alt} decoding="async" fetchPriority="high" width={420} height={525} className="capsule-img absolute inset-x-0 bottom-0 h-[96%] w-full object-cover object-top" />
          </picture>
        ) : (
          <svg viewBox="0 0 200 250" role="img" aria-label="Portrait placeholder" className="capsule-img absolute inset-0 h-full w-full"><path d="M100 70a36 36 0 1 1 0 72a36 36 0 1 1 0-72zM28 250c4-52 34-82 72-82s68 30 72 82z" fill="#0d0f22" opacity=".8" /></svg>
        )}
      </figure>
    </div>
  )
}

export default function App({ data }: { data: SiteData }) {
  const { hero, about, sections: S, marquee, skills, experience, contact, resume } = data.content
  const builds = data.projects.filter(p => p.kind === 'build'), repos = data.projects.filter(p => p.kind === 'repo')
  const tools = [...new Set(skills.flatMap(g => g.items))].filter(t => ICONS[t])
  const tel = 'tel:' + contact.phone.replace(/[^+\d]/g, '')
  useEffect(() => { import('./motion').then(m => m.initMotion(matchMedia('(prefers-reduced-motion: reduce)').matches)) }, [])

  return (
    <>
      <div className="sky" aria-hidden><i className="s1" /><i className="s2" /><i className="s3" /><span className="shoot a" style={{ ['--x0' as string]: '85vw', ['--y0' as string]: '12vh' }} /><span className="shoot b" style={{ ['--x0' as string]: '60vw', ['--y0' as string]: '38vh' }} /></div>
      {[0, 1, 2].map(i => <div key={i} className={'bgl bgl-' + i + (i === 0 ? ' on' : '')} aria-hidden />)}
      <div className="grain" aria-hidden />
      <div id="cur-ring" className="pointer-events-none fixed left-0 top-0 z-[80] grid h-8 w-8 place-items-center rounded-full border border-white/50 opacity-0 mix-blend-difference" aria-hidden><span id="cur-label" className="eyebrow text-[5px] opacity-0" /></div>
      <div id="cur-dot" className="pointer-events-none fixed left-0 top-0 z-[80] h-1.5 w-1.5 rounded-full bg-white opacity-0 mix-blend-difference" aria-hidden />
      <div id="repo-preview" className="pointer-events-none fixed left-0 top-0 z-[55] hidden h-56 w-80 overflow-hidden rounded-2xl opacity-0 lg:block" style={{ background: 'radial-gradient(100% 100% at 0 0, hsl(var(--h,240) 70% 62% / .75), transparent 60%), radial-gradient(90% 90% at 100% 100%, hsl(calc(var(--h,240) + 40) 70% 55% / .55), transparent 60%), #0a0c18' }} aria-hidden>
        <div className="absolute inset-4 top-8 rounded-t-lg border border-white/20 bg-black/40 p-4 font-mono text-xs text-white/80"><p className="text-white/60">repository</p><span className="mt-1 block text-lg text-white" /></div>
      </div>

      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded focus:bg-bone focus:px-3 focus:py-2 focus:text-ink">Skip to content</a>
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <nav aria-label="Primary" className="flex items-center justify-between px-5 py-5 sm:px-10">
          <a href="#top" className="font-display text-lg font-extrabold tracking-tight">{hero.first}<span className="text-accent">.</span></a>
          <ul className="eyebrow hidden gap-8 md:flex">
            {['about', 'skills', 'experience', 'work', 'contact'].map(s => <li key={s}><a className="opacity-80 transition-opacity hover:opacity-100" href={'#' + s}>{s}</a></li>)}
          </ul>
          <a href={'mailto:' + contact.email} className="eyebrow md:hidden">Email</a>
        </nav>
      </header>

      <main id="main">
        <section id="top" data-bg={0} className="hero relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-10 pt-28 sm:px-10">
          <div aria-hidden className="space-static absolute inset-0 bg-cover bg-center" />
          {!matchMedia('(prefers-reduced-motion: reduce)').matches && <Space />}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
          <p className="hero-fade eyebrow relative mb-8 flex items-center gap-2.5 text-muted"><span className="relative flex h-1.5 w-1.5"><span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" /><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /></span>{hero.badge}</p>
          <Portrait src={about.photo_url} alt={about.photo_alt || hero.first + ' ' + hero.last} />
          <h1 className="hero-title relative mt-8 font-display text-hero font-extrabold lg:mt-0"><Split text={hero.first + '\n' + hero.last} /></h1>
          <div className="relative mt-12 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-12">
            <p className="hero-fade font-display text-d2 font-bold md:col-span-4">{hero.title}</p>
            <p className="hero-fade measure text-lead text-muted md:col-span-5">{hero.pitch}</p>
            <div className="hero-fade flex items-start gap-3 md:col-span-3 md:justify-end">
              <a href="#work" data-magnetic data-cursor="View" className="rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink">{hero.cta_primary}</a>
              <a href={resume.url} download data-magnetic className="rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-bone">{hero.cta_secondary}</a>
            </div>
          </div>
          <p className="hero-fade eyebrow relative mt-8 text-subtle">{hero.meta}</p>
        </section>

        <div className="border-y border-white/10 bg-void/85 py-8 sm:py-10" aria-label="Technologies">
          <div className="fade-x overflow-hidden">
            <ul className="marquee items-center font-display text-[clamp(2.25rem,5.2vw,4.5rem)] font-extrabold leading-none tracking-[-.025em]">{[...marquee.primary, ...marquee.primary].map((t, i) => <li key={i} className="flex items-center whitespace-nowrap" aria-hidden={i >= marquee.primary.length}><span className={'px-[clamp(1rem,2.4vw,2.25rem)] ' + (i % 2 ? 'stroke' : '')}>{t}</span><span aria-hidden className="text-[.38em] text-accent">✦</span></li>)}</ul>
          </div>
          <div className="logo-rail fade-x mt-7 overflow-hidden">
            <ul className="marquee rev logos gap-3 pr-3">{[...tools, ...tools].map((t, i) => <li key={i} aria-hidden={i >= tools.length} className="tool-pill flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[.03] py-2 pl-3 pr-4 text-sm text-muted"><ToolIcon name={t} />{t}</li>)}</ul>
          </div>
        </div>

        <section id="about" data-bg={1} aria-labelledby="about-h" className="band px-5 py-24 sm:px-10 sm:py-32"><div className="mx-auto max-w-7xl">
          <Eyebrow n="01" t={S.eyebrow_about || about.kicker} />
          <h2 id="about-h" className="sr-only">{about.kicker}</h2>
          <div className="panel p-7 sm:p-12">
            <div className="relative">
              <p className="about-words relative max-w-[38ch] font-display text-about font-bold">
                <span className="text-subtle">{about.text}</span>
                <span aria-hidden className="absolute inset-0 text-bone">{about.text.split(' ').map((w, i) => <span key={i} className="w opacity-0">{w} </span>)}</span>
              </p>
              {about.facts && <dl className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-3">{about.facts.map(f => <div key={f.k} data-reveal className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><dt className="eyebrow text-subtle">{f.k}</dt><dd className="mt-3 leading-snug text-bone">{f.v}</dd></div>)}</dl>}
            </div>
          </div>
        </div></section>

        <Section id="skills" bg={2} n="02" k={S.eyebrow_skills || 'Capabilities'} title={S.skills}>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {skills.map(({ group, items }, i) => (
              <div key={group} data-reveal className="panel panel-hover p-7 sm:p-9 md:last:odd:col-span-2 xl:last:odd:col-span-1 xl:last:col-span-3">
                <h3 className="flex items-baseline justify-between font-display text-[clamp(1.35rem,2vw,1.75rem)] font-bold tracking-[-.015em]"><span>{group}</span><span className="eyebrow text-subtle">0{i + 1}</span></h3>
                <ul className="mt-6 flex flex-wrap gap-2">{items.map(t => <li key={t} className="chip tool-pill inline-flex items-center gap-2"><ToolIcon name={t} size={14} />{t}</li>)}</ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="experience" bg={1} n="03" k={S.eyebrow_experience || 'Career'} title={S.experience}>
          <ol className="tl relative">
            <span className="tl-line absolute left-0 top-0 h-full w-px bg-gradient-to-b from-accent via-accent2 to-transparent md:left-[calc(33.333%-1px)]" aria-hidden />
            {experience.map(j => (
              <li key={j.role + j.when} data-reveal className="relative grid gap-4 pb-8 pl-8 last:pb-0 md:grid-cols-3 md:gap-0 md:pl-0">
                <span className="absolute left-[-4px] top-2 h-2 w-2 rounded-full md:top-10 bg-accent shadow-[0_0_12px_#ffb169] md:left-[calc(33.333%-5px)]" aria-hidden />
                <div className="md:pr-12 md:pt-8 md:text-right"><p className="eyebrow text-bone">{j.when}</p><p className="mt-2 text-sm text-subtle">{j.where}</p></div>
                <div className="panel panel-hover p-6 sm:p-8 md:col-span-2 md:ml-12">
                  <h3 className="font-display text-d2 font-bold">{j.role}</h3>
                  <p className="mt-2 text-accent2">{j.org}</p>
                  <ul className="measure mt-6 space-y-2.5 text-muted">{j.points.filter(Boolean).map(p => <li key={p} className="flex gap-3"><span aria-hidden className="text-subtle">—</span>{p}</li>)}</ul>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <section id="work" data-bg={0} aria-labelledby="work-h" className={"band h-wrap overflow-hidden" + (builds.length > 1 ? " lg:flex lg:h-screen lg:items-center" : "")}>
          <div className={"flex flex-col gap-6 px-5 py-24 sm:px-10 lg:flex-row lg:items-center lg:gap-10 lg:pr-10" + (builds.length > 1 ? " h-track lg:py-0" : " mx-auto max-w-7xl")}>
            <div className="shrink-0 lg:w-[32vw]">
              <Eyebrow n="04" t={S.eyebrow_work || 'Projects'} />
              <h2 id="work-h" className="split font-display text-d1 font-extrabold"><Split text={S.work} /></h2>
              <p data-reveal className="mt-6 max-w-xs text-muted">{builds.length ? S.work_sub : ''}</p>
            </div>
            {!builds.length && <div data-reveal className="panel flex min-h-[16rem] flex-1 flex-col justify-center p-8 sm:p-12"><p className="eyebrow text-accent">{S.eyebrow_work || 'Projects'}</p><p className="mt-4 max-w-md font-display text-d2 font-bold">{S.work_sub}</p><a href={'mailto:' + contact.email} className="mt-6 w-fit rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink">{contact.email}</a></div>}
            {builds.map((b, bi) => (
              <article key={b.id ?? b.title} data-reveal className="panel panel-hover group relative shrink-0 overflow-hidden lg:h-[72vh] lg:w-[44vw]">
                <div className="relative h-64 overflow-hidden sm:h-80 lg:h-[54%]"><Cover hue={b.hue} title={b.title} tech={b.tech} cover={b.cover_url} type={b.cover_type} /></div>
                <div className="p-6 sm:p-8">
                  <p className="eyebrow flex justify-between text-subtle"><span>{b.tag}</span><span>{String(bi + 1).padStart(2, '0')}</span></p>
                  <h3 className="mt-4 font-display text-d2 font-bold">{b.title}</h3>
                  <p className="measure mt-3 text-[.95rem] leading-relaxed text-muted">{b.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">{b.tech.map(t => <li key={t} className="chip !px-2.5 !py-1 font-mono !text-[11px]">{t}</li>)}</ul>
                  {(b.live_url || b.repo_url) && <p className="mt-5 flex gap-5 text-sm">{b.live_url && <a href={b.live_url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">Live ↗</a>}{b.repo_url && <a href={b.repo_url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">Code ↗</a>}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>

        {repos.length > 0 && <section data-bg={2} aria-labelledby="gh-h" className="band px-5 py-24 sm:px-10 sm:py-32"><div className="mx-auto max-w-7xl">
          <Eyebrow n="05" t={S.eyebrow_repos || 'GitHub'} />
          <h2 id="gh-h" className="split mb-14 font-display text-d1 font-extrabold"><Split text={S.repos} /></h2>
          <ul className="repo-list panel overflow-hidden px-6 sm:px-8">
            {repos.map((r, i) => (
              <li key={r.id ?? r.title} data-hue={r.hue} data-name={r.title}>
                <a href={r.live_url || r.repo_url || '#'} target="_blank" rel="noopener noreferrer" data-cursor="Open" className="group flex items-center gap-6 border-b border-white/10 py-6 sm:py-8">
                  <span className="eyebrow w-8 text-subtle">0{i + 1}</span>
                  <span className="flex-1 font-display text-[clamp(1.5rem,3.6vw,3rem)] font-bold tracking-[-.02em] transition-transform duration-500 group-hover:translate-x-4">{r.title}</span>
                  <span className="hidden text-sm text-muted md:block">{r.description}</span>
                  <span className="eyebrow w-24 text-right text-subtle">{r.language}</span>
                  <span aria-hidden className="text-xl transition-transform duration-500 group-hover:-rotate-45">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div></section>}
      </main>

      <footer id="contact" aria-labelledby="contact-h" className="relative overflow-hidden rounded-t-[2.5rem] bg-bone px-5 pb-8 pt-24 text-ink sm:px-10 sm:pt-32">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(255,177,105,.45),transparent)]" />
        <div className="relative mx-auto max-w-7xl">
          <Eyebrow n="06" t={S.eyebrow_contact || 'Contact'} dark />
          <h2 id="contact-h" className="split font-display text-[clamp(3.2rem,11vw,11rem)] font-extrabold leading-[.84] tracking-[-.04em]"><Split text={S.contact} /></h2>
          {S.contact_sub && <p data-reveal className="measure mt-8 text-lead text-zinc-700">{S.contact_sub}</p>}
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <a href={'mailto:' + contact.email} data-cursor="Write" className="group rounded-3xl bg-ink p-7 text-bone shadow-[0_30px_60px_-30px_rgba(5,6,12,.6)] transition-transform duration-500 hover:-translate-y-1 md:col-span-2">
              <span className="eyebrow text-accent">Email</span>
              <span className="mt-4 block break-all font-display text-[clamp(1.4rem,3vw,2.4rem)] font-bold">{contact.email}</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-muted">Write to me <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span></span>
            </a>
            <div className="rounded-3xl border border-ink/12 bg-white/60 p-7">
              <span className="eyebrow text-ember">Direct</span>
              <a href={tel} className="mt-4 block font-display text-xl font-bold hover:underline">{contact.phone}</a>
              <p className="mt-2 text-zinc-700">{contact.location}</p>
            </div>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {contact.socials.map(({ label, url }) => <li key={label}><a href={url} target="_blank" rel="noopener noreferrer" data-magnetic className="flex items-center justify-between rounded-2xl border border-ink/15 bg-white/50 px-6 py-5 font-medium transition-colors hover:bg-white">{label}<span aria-hidden>↗</span></a></li>)}
            <li><a href={resume.url} download data-magnetic className="flex items-center justify-between rounded-2xl border border-ink/15 bg-white/50 px-6 py-5 font-medium transition-colors hover:bg-white">{resume.label}<span aria-hidden>↓</span></a></li>
          </ul>
          <div className="eyebrow mt-20 flex justify-between border-t border-ink/15 pt-6 text-zinc-700"><span>© {new Date().getFullYear()} {hero.first} {hero.last}</span><a href="#top">Back to top ↑</a></div>
        </div>
      </footer>
    </>
  )
}
