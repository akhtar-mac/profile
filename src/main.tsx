import { createRoot } from 'react-dom/client'
import { lazy, Suspense } from 'react'
import './index.css'

const root = createRoot(document.getElementById('root')!)
if (location.pathname.startsWith('/admin')) {
  document.getElementById('loader')?.remove()
  const Admin = lazy(() => import('./admin/Admin'))
  root.render(<Suspense fallback={<div className="grid min-h-screen place-items-center text-zinc-400">Loading admin…</div>}><Admin /></Suspense>)
} else {
  import('./lib/content').then(({ loadSite }) => Promise.all([loadSite(), import('./App')])).then(([data, { default: App }]) => {
    const { seo } = data.content
    document.title = seo.title
    document.querySelector('meta[name=description]')?.setAttribute('content', seo.description)
    root.render(<App data={data} />)
  })
}
