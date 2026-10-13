import json
d=json.load(open('src/lib/seed.json')); c=d['content']
c['hero']['pitch']="I ship React and React Native products end to end — Node and Express APIs, MongoDB, Docker, AWS — and build automation and local-LLM agents that take repetitive work off people's plates."
c['about']['text']="I've shipped web and mobile products since 2019 — freelance first, then React Native at Subtle Solution, five years full stack at Just Logic Software, and now Full Stack & AI Automation Engineer at Etax Wala Solutions, where I built the company's LMS platform and website ecosystem. After hours, I build offline AI workspaces and multi-agent systems on Ollama, OpenRouter and Hermes."
c['about']['facts']=[{"k":"Role","v":"Full Stack & AI Automation Engineer, Etax Wala Solutions"},{"k":"Focus","v":"React · React Native · Node · AI automation"},{"k":"Base","v":"Chh. Sambhajinagar, India — remote-ready"}]
for g in c['skills']:
  if g['group']=='Backend & APIs' and 'Express' not in g['items']: g['items'].insert(1,'Express')
if 'Express' not in c['marquee']['primary']: c['marquee']['primary'].insert(5,'Express')
c['experience']=[
 {"role":"Full Stack & AI Automation Engineer","org":"Etax Wala Solutions Pvt Ltd","where":"Chh. Sambhajinagar, MH","when":"Jul 2026 — Present","points":["Delivered a complete LMS: student mobile app, admin dashboards, course management, assessments, payments, progress tracking and role-based workflows.","Built and launched the company's website ecosystem — responsive sites, management dashboards, enquiry/admission systems, invoices, ID cards and other business modules.","Develop cross-platform web and mobile apps on React, React Native, Node.js, Express and MongoDB with end-to-end API integrations.","Run cloud deployment, Docker environments, automation workflows and third-party integrations for production business apps."]},
 {"role":"Full Stack Developer","org":"Just Logic Software Pvt Ltd","where":"Chh. Sambhajinagar, MH","when":"Jun 2021 — Jul 2026","points":["Built and maintained web and cross-platform mobile apps on React, React Native and MERN.","Owned frontend architecture, API integrations and performance work.","Containerised services with Docker and helped deploy them to AWS EC2.","Wired backend integrations and automation workflows for business clients."]},
 {"role":"React Native Developer","org":"Subtle Solution Pvt Ltd","where":"Chh. Sambhajinagar, MH","when":"Feb 2020 — May 2021","points":["Built cross-platform mobile apps in React Native with a focus on performance and UX.","Turned business requirements into maintainable, component-based React interfaces.","Shipped features and fixed production issues alongside cross-functional teams."]},
 {"role":"Freelance Developer","org":"Self-employed","where":"Remote, alongside employment","when":"Jun 2019 — Present","points":["Deliver React and React Native frontends with backend integrations for clients.","Automate client workflows with third-party APIs and foundational CI/CD pipelines.","Deploy on AWS, Docker and VPS; prototype LLM-driven automation tools."]}]
c['seo']['description']="Full Stack & AI Automation Engineer building React / React Native products and local-LLM automation. Based in India, open to remote roles and freelance work."
for p in d['projects']:
  if p['kind']=='repo': p['featured']=False
json.dump(d,open('src/lib/seed.json','w'),ensure_ascii=False,indent=1); json.dump(d,open('public/content.json','w'),ensure_ascii=False)
q=lambda s:"'"+s.replace("'","''")+"'"
keys=['hero','about','skills','marquee','experience','seo']
open('/tmp/seed_v9.sql','w').write("insert into public.site_content(key,value) values "+",".join(f"({q(k)},{q(json.dumps(c[k],ensure_ascii=False))}::jsonb)" for k in keys)+" on conflict (key) do update set value=excluded.value, updated_at=now();")
