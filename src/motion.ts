import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
gsap.registerPlugin(ScrollTrigger)

export function initMotion(reduced: boolean) {
  const fine = matchMedia('(pointer:fine)').matches
  const loader = document.getElementById('loader')
  if (reduced) { loader?.remove(); return }

  // Smooth scroll
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href')!; if (id.length < 2) return
    e.preventDefault(); lenis.scrollTo(id === '#top' ? 0 : id, { offset: -10 })
  }))

  // Preloader then hero split reveal
  const tl = gsap.timeline()
  const num = document.getElementById('loader-num')
  if (loader && num) {
    lenis.stop()
    const o = { v: 0 }
    tl.to(o, { v: 100, duration: 1, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(o.v)).padStart(3, '0') } })
      .to('#loader-inner', { yPercent: -120, opacity: 0, duration: .5, ease: 'power3.in' })
      .to(loader, { yPercent: -100, duration: .8, ease: 'expo.inOut', onComplete: () => { loader.remove(); lenis.start() } }, '-=.15')
  }
  tl.from('.hero .ch', { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: .035 }, loader ? '-=.45' : 0)
    .from('.hero-fade', { y: 28, duration: 1, ease: 'expo.out', stagger: .07 }, '-=.8')

  // Hero parallax out
  gsap.to('.hero-title', { yPercent: -18, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })

  // Section headings split reveal
  gsap.utils.toArray<HTMLElement>('.split').forEach(el => {
    gsap.from(el.querySelectorAll('.ch'), { yPercent: 110, duration: 1, ease: 'expo.out', stagger: .02, scrollTrigger: { trigger: el, start: 'top 85%' } })
  })
  // Generic reveals
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
    gsap.from(el, { y: 40, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
  })
  // About: word-by-word opacity scrub
  const words = document.querySelectorAll('.about-words .w')
  if (words.length) gsap.fromTo(words, { opacity: 0 }, { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: '.about-words', start: 'top 80%', end: 'bottom 45%', scrub: true } })
  // Timeline line grow
  gsap.from('.tl-line', { scaleY: 0, transformOrigin: 'top', ease: 'none', scrollTrigger: { trigger: '.tl', start: 'top 70%', end: 'bottom 70%', scrub: true } })

  // Section-to-section backdrop crossfade (opacity only)
  const layers = document.querySelectorAll<HTMLElement>('.bgl')
  gsap.utils.toArray<HTMLElement>('[data-bg]').forEach(sec => ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%',
    onToggle: st => { if (st.isActive) layers.forEach((l, i) => l.classList.toggle('on', i === +sec.dataset.bg!)) } }))
  // Portrait parallax inside its frame
  gsap.to('.capsule-wrap', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })

  const mm = gsap.matchMedia()
  mm.add('(min-width: 1024px)', () => {
    // Horizontal pinned projects
    const track = document.querySelector<HTMLElement>('.h-track')
    if (track) {
      const dist = () => track.scrollWidth - innerWidth + 80
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.h-wrap', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } })
    }
  })

  if (fine) initCursor()
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
}

function initTilt() {
  const el = document.querySelector<HTMLElement>('.capsule-wrap'); if (!el) return
  const rx = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3' })
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 10); rx(-((e.clientY - r.top) / r.height - .5) * 10) })
  el.addEventListener('pointerleave', () => { rx(0); ry(0) })
}

function initCursor() {
  initTilt()
  document.documentElement.classList.add('cursor-on')
  const dot = document.getElementById('cur-dot')!, ring = document.getElementById('cur-ring')!, label = document.getElementById('cur-label')!
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 1 })
  const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 })
  const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' })
  addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY) }, { passive: true })
  document.querySelectorAll<HTMLElement>('a,button').forEach(el => {
    el.addEventListener('pointerenter', () => { gsap.to(ring, { scale: el.dataset.cursor ? 2.6 : 1.8, duration: .3 }); if (el.dataset.cursor) { label.textContent = el.dataset.cursor; gsap.to(label, { opacity: 1, duration: .2 }) } })
    el.addEventListener('pointerleave', () => { gsap.to(ring, { scale: 1, duration: .3 }); gsap.to(label, { opacity: 0, duration: .2 }) })
  })
  // Magnetic
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach(el => {
    const x = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), y = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' })
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .35); y((e.clientY - r.top - r.height / 2) * .35) })
    el.addEventListener('pointerleave', () => { x(0); y(0) })
  })
  // Repo hover preview follower
  const pv = document.getElementById('repo-preview'), list = document.querySelector<HTMLElement>('.repo-list')
  if (pv && list) {
    const px = gsap.quickTo(pv, 'x', { duration: .5, ease: 'power3' }), py = gsap.quickTo(pv, 'y', { duration: .5, ease: 'power3' })
    gsap.set(pv, { xPercent: -50, yPercent: -50, scale: .6, opacity: 0 })
    list.addEventListener('pointermove', e => { px(e.clientX); py(e.clientY) })
    list.querySelectorAll<HTMLElement>('[data-hue]').forEach(row => row.addEventListener('pointerenter', () => {
      const h = row.dataset.hue!; pv.style.setProperty('--h', h); pv.querySelector('span')!.textContent = row.dataset.name!
      gsap.to(pv, { opacity: 1, scale: 1, duration: .4, ease: 'power3' })
    }))
    list.addEventListener('pointerleave', () => gsap.to(pv, { opacity: 0, scale: .6, duration: .3 }))
  }
}
