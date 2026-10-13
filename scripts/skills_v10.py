import json
# * = added beyond the resumes (implied by his work; review in /admin)
G=[("Frontend",["JavaScript (ES6+)","TypeScript","React","Next.js*","HTML5","CSS3","Tailwind CSS","Redux*","Zustand*","Vite*"]),
("Mobile",["React Native","Expo*","Firebase*"]),
("Backend & APIs",["Node.js","Express","REST APIs","JWT auth*","FastAPI","Flask","Python"]),
("Databases",["MongoDB","PostgreSQL*","Redis*","Supabase"]),
("DevOps & Cloud",["AWS EC2","AWS S3","Docker","Docker Compose","Linux","Nginx*","CI/CD","GitHub Actions*","VPS","Vercel","Netlify*","Cloudflare*"]),
("AI & Automation",["Ollama","OpenRouter","Hermes","OpenClaw","Hugging Face","Local LLM deployment","AI agent frameworks","Discord bots","Telegram bots"]),
("Tools",["Git","GitHub","VS Code","Cursor*","Postman*","npm*","Jira*","Figma"])]
skills=[{"group":g,"items":[i.rstrip('*') for i in items]} for g,items in G]
added=[i.rstrip('*') for _,items in G for i in items if i.endswith('*')]
marquee={"primary":["React","React Native","TypeScript","Node.js","Express","MongoDB","Docker","AWS","Ollama","AI agents"],"secondary":[]}
for f in ['src/lib/seed.json','public/content.json']:
  d=json.load(open(f)); d['content']['skills']=skills; d['content']['marquee']=marquee; d['content']['skills_review']={"added_beyond_resume":added}
  json.dump(d,open(f,'w'),ensure_ascii=False,indent=1 if 'src' in f else None)
q=lambda s:"'"+s.replace("'","''")+"'"
open('/tmp/sk.sql','w').write("insert into public.site_content(key,value) values "+",".join(f"({q(k)},{q(json.dumps(v,ensure_ascii=False))}::jsonb)" for k,v in [('skills',skills),('marquee',marquee),('skills_review',{"added_beyond_resume":added})])+" on conflict (key) do update set value=excluded.value, updated_at=now();")
print(len(added),'added')
