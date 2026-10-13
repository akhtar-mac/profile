import json
c={
 "seo":{"title":"Akhtar Shaikh — Frontend & AI Automation Developer","description":"Akhtar Shaikh — Full Stack, React / React Native and AI automation developer in Chh. Sambhajinagar, India. Open to remote roles and freelance work.","og_image":"/og.png"},
 "hero":{"first":"Akhtar","last":"Shaikh","badge":"Open to remote roles & freelance work","title":"Frontend & AI Automation Developer","pitch":"React / React Native apps, Node backends, Docker on AWS, and local-LLM agents. Open to remote full-stack, backend and AI automation roles — and freelance projects.","meta":"Chh. Sambhajinagar, India · Since 2019","cta_primary":"See work","cta_secondary":"Resume ↓"},
 "about":{"kicker":"About","text":"I build responsive web and mobile apps with React and React Native — professionally since 2020, freelancing since 2019. Today I'm a Full Stack Developer at Just Logic Software, and outside of work I build offline AI workspaces and multi-agent systems with Ollama, OpenRouter and Hermes, shipped with Docker on AWS and VPS."},
 "sections":{"skills":"What I\nwork with","experience":"Where I've\nbeen building","work":"Things\nI've built","work_sub":"Personal and freelance projects from my resume. Scroll →","repos":"On GitHub","contact":"Let's work\ntogether"},
 "marquee":{"primary":['React','React Native','TypeScript','JavaScript','Node.js','MongoDB','MERN','Tailwind','Python','FastAPI','REST APIs'],"secondary":['AWS EC2','AWS S3','Docker','Docker Compose','Linux','CI/CD','Git','Vercel','Supabase','Ollama','OpenRouter','Hermes','Discord bots','Telegram bots','Figma']},
 "skills":[{"group":"Languages & Frontend","items":['JavaScript (ES6+)','TypeScript','Python','React.js','React Native','HTML5','CSS3','Tailwind']},{"group":"Backend & APIs","items":['Node.js','FastAPI / Flask (basics)','RESTful APIs','MongoDB','MERN']},{"group":"DevOps & Cloud","items":['AWS (EC2, S3)','Docker & Compose','Linux administration','Git / GitHub','CI/CD','Vercel','Supabase']},{"group":"AI & Automation","items":['Local LLM deployment','Ollama','OpenRouter','Hermes','AI agent frameworks','Discord / Telegram bots']}],
 "experience":[
  {"role":'Full Stack Developer',"org":'Just Logic Software Pvt Ltd',"where":'Chh. Sambhajinagar, MH',"when":'Jun 2021 — Present',"points":['Develop and maintain web and cross-platform mobile apps with React, React Native and the MERN stack.','Frontend architecture, API integrations and performance improvements.','Cloud deployments on AWS EC2 and Docker containerization for dev and production.','Backend integrations and automation workflows for business clients.']},
  {"role":'Freelance Developer',"org":'Self-Employed',"where":'Remote',"when":'Jun 2019 — Present',"points":['Web and mobile projects for clients — React / React Native frontends with backend integrations.','Custom automation workflows on third-party APIs and foundational CI/CD pipelines to streamline releases.','Deployments on AWS, Docker and VPS; AI-powered automation and LLM workflows.']},
  {"role":'React Native Developer',"org":'Subtle Solution Pvt Ltd',"where":'Chh. Sambhajinagar, MH',"when":'Feb 2020 — May 2021',"points":['Cross-platform mobile apps in React Native, focused on performance and UX.','Responsive React.js interfaces as clean, component-based code.','Shipped features and resolved production issues with cross-functional teams.']}],
 "contact":{"email":"akhtarshaikh0299@gmail.com","phone":"+91 79722 72861","location":"Remote / Chh. Sambhajinagar, India","socials":[{"label":"LinkedIn","url":"https://www.linkedin.com/in/akhtarshaikh-mac/"},{"label":"GitHub","url":"https://github.com/akhtar-mac"}]},
 "resume":{"url":"/Akhtar_Shaikh_Resume.pdf","label":"Resume (PDF) ↓"},
}
G="https://github.com/akhtar-mac/"
p=[
 dict(title='Offline AI Development Workspace',tag='Personal project',kind='build',hue=245,cover_url='/covers/cover-1.webp',tech=['React','Node.js','Python','Ollama','Docker','Linux','OpenRouter'],description='A portable, fully offline AI platform: a browser dashboard for coding, terminal execution and AI assistance. Local inference via Ollama with model selection based on available system resources, persistent memory, multi-user profiles, and Windows / Linux / macOS support — runnable from external storage.'),
 dict(title='AI Agent & Business Automation Platform',tag='Personal project',kind='build',hue=280,cover_url='/covers/cover-2.webp',tech=['Python','OpenRouter','Ollama','Discord','Telegram','Hugging Face','Docker','Hermes'],description='A multi-agent system with a manager-worker architecture delegating coding help, research, customer support and operations. Agents run across Discord, Telegram and web with persistent sessions, local or cloud LLM backends, and Dockerised services on a VPS.'),
 dict(title='Containerised Deployment Environments',tag='Freelance project',kind='build',hue=200,cover_url='/covers/cover-3.webp',tech=['Docker','Docker Compose','Linux','AWS EC2'],description='Reusable Docker images and Compose configurations that standardise local and production multi-service environments across client projects.'),
]
for n,l,d,h in [('multifly-frontend','JavaScript','Frontend of the Multifly app',230),('multifly-admin','JavaScript','Admin dashboard for Multifly',260),('multifly-backend','JavaScript','Backend service for Multifly',200),('perfume-web','TypeScript','Perfume storefront web project',320),('perfume-lumen','TypeScript','Perfume brand site project',30),('LymLyn','JavaScript','JavaScript web project',160)]:
  p.append(dict(title=n,kind='repo',language=l,description=d,hue=h,repo_url=G+n,tech=[l]))
for i,x in enumerate(p): x['sort_order']=i; x.setdefault('featured',True)
json.dump({"content":c,"projects":p},open('src/lib/seed.json','w'),ensure_ascii=False,indent=1)
q=lambda s:"'"+s.replace("'","''")+"'"
sql=["insert into public.site_content(key,value) values "+",".join(f"({q(k)},{q(json.dumps(v,ensure_ascii=False))}::jsonb)" for k,v in c.items())+" on conflict (key) do update set value=excluded.value;","delete from public.projects;"]
cols=['title','tag','kind','language','description','hue','repo_url','cover_url','tech','sort_order','featured']
for x in p:
  vals=[]
  for k in cols:
    v=x.get(k)
    vals.append('null' if v is None else ("array["+",".join(q(t) for t in v)+"]::text[]" if isinstance(v,list) else (str(v).lower() if isinstance(v,bool) else (str(v) if isinstance(v,int) else q(v)))))
  sql.append(f"insert into public.projects({','.join(cols)}) values ({','.join(vals)});")
open('scripts/seed.sql','w').write("\n".join(sql))
