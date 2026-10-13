import { useEffect, useRef } from 'react'

// Cinematic-but-cheap 2D canvas: pre-rendered nebula + sun bloom (drawn once to offscreen canvases),
// three parallax star depths, softly lit planets on tilted orbits.
// Safeguards: pauses offscreen / tab hidden, deferred start, DPR cap, 30fps + fewer stars on mobile,
// reduced motion never mounts this (static image instead).
export default function Space() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    const mobile = matchMedia('(pointer:coarse), (max-width: 767px)').matches
    const dpr = mobile ? 1 : Math.min(devicePixelRatio, 1.5)
    const frameMs = mobile ? 33 : 0
    let w = 0, h = 0, raf = 0, last = 0, visible = true, mx = 0, my = 0, tx = 0, ty = 0, sy = 0
    type Star = { x: number; y: number; r: number; a: number; z: number; tw: number; c: string }
    let stars: Star[] = []
    const neb = document.createElement('canvas'), sun = document.createElement('canvas')
    const planets = [
      { r: .17, s: .00030, size: 3.5, c: [170, 185, 235], p: 1.2 },
      { r: .27, s: .00020, size: 6.5, c: [222, 182, 150], p: 3.9 },
      { r: .38, s: .00013, size: 5, c: [150, 205, 200], p: 5.4 },
      { r: .53, s: .00008, size: 9.5, c: [190, 175, 240], p: 2.4, ring: true },
    ]
    const blob = (g: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    function resize() {
      w = cv.clientWidth; h = cv.clientHeight
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round((w * h) / (mobile ? 30000 : 14000)), tints = ['#ffffff', '#ffe9d2', '#dcd8ff', '#cfe3ff']
      stars = Array.from({ length: n }, () => { const z = [.15, .4, 1][Math.floor(Math.random() ** 1.6 * 3)]; return { x: Math.random() * w, y: Math.random() * h, r: (Math.random() * .8 + .3) * (z === 1 ? 1.5 : 1), a: Math.random() * .6 + .25, z, tw: Math.random() * 6, c: tints[(Math.random() * 4) | 0] } })
      // nebula (oversized for parallax), rendered at half-res then upscaled for softness
      const NW = (w + 120) / 2, NH = (h + 120) / 2; neb.width = NW; neb.height = NH
      const g = neb.getContext('2d')!; g.globalCompositeOperation = 'lighter'
      blob(g, NW * .78, NH * .3, NW * .55, 'rgba(110,80,220,.22)')
      blob(g, NW * .95, NH * .05, NW * .35, 'rgba(60,110,230,.18)')
      blob(g, NW * .55, NH * .55, NW * .3, 'rgba(255,140,80,.07)')
      blob(g, NW * .1, NH * .95, NW * .5, 'rgba(40,60,160,.20)')
      blob(g, NW * .3, NH * .15, NW * .25, 'rgba(157,140,255,.08)')
      // sun bloom
      const S = Math.min(w, h) * 1.1; sun.width = sun.height = S; const s = sun.getContext('2d')!, c = S / 2
      s.globalCompositeOperation = 'lighter'
      blob(s, c, c, c, 'rgba(120,90,255,.10)')
      blob(s, c, c, c * .55, 'rgba(255,120,60,.16)')
      blob(s, c, c, c * .26, 'rgba(255,175,105,.42)')
      blob(s, c, c, c * .09, 'rgba(255,225,180,.95)')
      blob(s, c, c, c * .035, 'rgba(255,250,240,1)')
      s.globalAlpha = .25; s.fillStyle = 'rgba(255,200,150,.5)'; s.fillRect(c - c * .7, c - .6, c * 1.4, 1.2) // faint anamorphic streak
    }
    function draw(t: number) {
      raf = requestAnimationFrame(draw)
      if (frameMs && t - last < frameMs) return
      last = t
      tx += (mx - tx) * .04; ty += (my - ty) * .04
      ctx.clearRect(0, 0, w, h); ctx.globalAlpha = .55; ctx.drawImage(neb, -60 + tx * 30, -60 + ty * 30 - sy * .05, w + 120, h + 120); ctx.globalAlpha = 1
      for (const s of stars) {
        const x = (s.x + tx * 26 * s.z + w) % w, y = (s.y + ty * 26 * s.z - sy * .18 * s.z + h * 4) % h
        ctx.globalAlpha = s.a * (.7 + .3 * Math.sin(t * .0009 + s.tw)); ctx.fillStyle = s.c; ctx.fillRect(x, y, s.r, s.r)
      }
      ctx.globalAlpha = 1
      const cx = w * (w < 768 ? .7 : .74) + tx * 36, cy = h * .36 + ty * 36 - sy * .25, R = Math.min(w, h) * (w < 768 ? 1.1 : .95)
      ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(sun, cx - sun.width / 2, cy - sun.height / 2); ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = 1
      planets.forEach((p, i) => { ctx.strokeStyle = `rgba(220,215,255,${.05 + i * .008})`; ctx.beginPath(); ctx.ellipse(cx, cy, p.r * R, p.r * R * .34, -.18, 0, Math.PI * 2); ctx.stroke() })
      const ca = Math.cos(-.18), sa = Math.sin(-.18)
      for (const p of planets) {
        const a = p.p + t * p.s, ex = Math.cos(a) * p.r * R, ey = Math.sin(a) * p.r * R * .34
        const x = cx + ex * ca - ey * sa, y = cy + ex * sa + ey * ca
        const behind = Math.sin(a) < 0, size = p.size * (behind ? .85 : 1)
        const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy) || 1, lx = x + dx / d * size * .5, ly = y + dy / d * size * .5 // lit from the sun
        const [r, gg, b] = p.c, g = ctx.createRadialGradient(lx, ly, 0, x, y, size)
        g.addColorStop(0, `rgba(${Math.min(255, r + 60)},${Math.min(255, gg + 50)},${Math.min(255, b + 40)},1)`); g.addColorStop(.55, `rgba(${r},${gg},${b},.9)`); g.addColorStop(1, 'rgba(12,12,24,.95)')
        ctx.globalAlpha = behind ? .75 : 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill()
        if (p.ring) { ctx.strokeStyle = 'rgba(225,215,255,.35)'; ctx.beginPath(); ctx.ellipse(x, y, size * 2.1, size * .55, -.4, 0, Math.PI * 2); ctx.stroke() }
        ctx.globalAlpha = 1
      }
    }
    const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw) }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop() })
    const onVis = () => (document.hidden ? stop() : start())
    const onMove = (e: PointerEvent) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 }
    const onScroll = () => { sy = scrollY }
    let rt = 0; const onResize = () => { clearTimeout(rt); rt = window.setTimeout(resize, 150) }
    const boot = () => {
      resize(); io.observe(cv); requestAnimationFrame(() => { cv.style.opacity = '1' })
      document.addEventListener('visibilitychange', onVis)
      if (!mobile) addEventListener('pointermove', onMove, { passive: true })
      addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onResize)
    }
    const t0 = window.setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(boot, { timeout: 2500 }) : boot()), mobile ? 1800 : 900)
    return () => { clearTimeout(t0); stop(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); removeEventListener('pointermove', onMove); removeEventListener('scroll', onScroll); removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-[1500ms]" />
}
