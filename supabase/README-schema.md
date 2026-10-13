Schema applied via migrations `init_cms` + `harden_functions` (see project actvpkjeaifcoigwboms):
- public.site_content(key text pk, value jsonb) — hero, about, sections, marquee, skills, experience, contact, resume, seo
- public.projects — title, tag, description, tech[], live_url, repo_url, cover_url, cover_type, kind (build|repo), language, hue, sort_order, featured
- public.admin_allowlist(email) — only akhtarshaikh0299@gmail.com
- RLS: public SELECT on content/projects; INSERT/UPDATE/DELETE only when private.is_admin() (JWT email in allowlist)
- auth.users BEFORE INSERT trigger private.enforce_signup_allowlist() rejects any other sign-up
- storage bucket `media` (public read, admin-only write, 50 MB, images/video/pdf)
Seed: scripts/seed.py -> scripts/seed.sql + src/lib/seed.json (also copied to public/content.json as offline fallback)
