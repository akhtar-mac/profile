# Portfolio admin (CMS)

Backend: Supabase project **akhtar-portfolio** (ref `actvpkjeaifcoigwboms`, region ap-south-1, free plan).
Admin UI: `/admin` (e.g. http://localhost:4173/admin, or https://<your-domain>/admin once deployed).

## One-time setup (Akhtar)
1. Supabase dashboard → Authentication → URL Configuration: set **Site URL** to the deployed site URL
   (and add `http://localhost:4173/admin` + `https://<domain>/admin` to Redirect URLs) so the confirmation email links back correctly.
2. Open `/admin` → "First time? Create the owner account" → email `akhtarshaikh0299@gmail.com` + a strong password (10+ chars).
3. Click the confirmation link Supabase emails you, then sign in.
   Any other email is rejected by a database trigger, and only this email can write (RLS).
4. Optional hardening after you've signed up: Authentication → Providers → Email → disable "Allow new users to sign up".

## Editing
- Tabs: Dashboard, Projects (drag to reorder, show/hide toggle, cover image/video upload, live/repo links), Hero,
  About & headings, Skills & marquee, Experience, Contact & socials, Resume PDF, SEO (title, description, OG image).
- Content tabs: edit, then **Publish changes**. Projects save per project. The public site reads the database on each load — no rebuild needed.
- Uploads go to the Supabase Storage bucket `media` (max 50 MB).

## Env
`.env` holds `VITE_SUPABASE_URL` and the **publishable** key (safe to expose; RLS protects writes). The index.html prefetch script repeats the URL/key — update both if the project changes.
`public/content.json` is an offline fallback snapshot; regenerate with `python3 scripts/seed.py` if you want it to match the DB.
