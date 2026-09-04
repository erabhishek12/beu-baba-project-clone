#!/usr/bin/env python3
"""Build Tools-hub seed data from the extracted datasets:
  seed_gov_exams.json  - 21 exams, cleaned (emoji stripped), sectioned
  seed_portals.json    - curated important portals (results, notif, learning, scholarship, exam)
  seed_colleges.json   - Bihar engineering colleges (from dex_urls)
"""
import json, re, os
BASE=os.path.dirname(__file__)
OUT=os.path.abspath(os.path.join(BASE,'..','beubaba','src','services','mock'))

EMOJI=re.compile("["
    "\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF"
    "\U00002190-\U000021FF\U00002B00-\U00002BFF\U0000FE0F\U00002022]", flags=re.UNICODE)
def clean(s):
    s=EMOJI.sub('', s or '')
    s=s.replace('©','').strip()
    return re.sub(r'\s+',' ',s).strip()

# ---------- GOV EXAMS ----------
ge=json.load(open(os.path.join(BASE,'government_exams.json')))
SECTION_HINTS=['about','philosophy','scheme','selection','eligibility','pattern','stage','service','syllabus','timeline','why','strategy','overview','structure','process']
def sectionize(lines):
    lines=[clean(l) for l in lines if clean(l) and clean(l)!='2026 Sandeep Kumar' and 'Sandeep Kumar' not in l]
    # first non-heading line is intro
    sections=[]; cur=None
    for l in lines:
        low=l.lower()
        is_head = len(l)<70 and (any(h in low for h in SECTION_HINTS) or l.endswith(':')) and not l.endswith('.')
        if is_head:
            cur={'heading':l.rstrip(':'),'body':[]}
            sections.append(cur)
        else:
            if cur is None:
                cur={'heading':'Overview','body':[]}; sections.append(cur)
            cur['body'].append(l)
    # collapse to paragraphs
    for s in sections:
        s['body']=[b for b in s['body'] if len(b)>3]
    return [s for s in sections if s['body']]

gov=[]
for e in ge:
    name=clean(e.get('heading'))
    cat=clean(e.get('title')) or 'Other'
    secs=sectionize(e.get('content',[]))
    # short summary = first body paragraph
    summary=''
    for s in secs:
        if s['body']:
            summary=s['body'][0][:240]; break
    gov.append({
        'id': re.sub(r'[^a-z0-9]+','-',name.lower()).strip('-'),
        'name': name,
        'category': cat,
        'summary': summary,
        'sections': secs[:12],
    })
gov.sort(key=lambda x:(x['category'],x['name']))
json.dump(gov, open(os.path.join(OUT,'seed_gov_exams.json'),'w'), ensure_ascii=False, indent=0)

# ---------- PORTALS ----------
portals={
  'results': {
    'title':'Results',
    'items':[
      {'name':'BEU B.Tech Result (Sem 1)','url':'https://results.beup.ac.in/ResultsBTech1stSem','sem':1},
      {'name':'BEU B.Tech Result (Sem 2)','url':'https://results.beup.ac.in/ResultsBTech2ndSem','sem':2},
      {'name':'BEU B.Tech Result (Sem 3)','url':'https://results.beup.ac.in/ResultsBTech3rdSem','sem':3},
      {'name':'BEU B.Tech Result (Sem 4)','url':'https://results.beup.ac.in/ResultsBTech4thSem','sem':4},
      {'name':'BEU B.Tech Result (Sem 5)','url':'https://results.beup.ac.in/ResultsBTech5thSem','sem':5},
      {'name':'BEU B.Tech Result (Sem 6)','url':'https://results.beup.ac.in/ResultsBTech6thSem','sem':6},
      {'name':'BEU B.Tech Result (Sem 7)','url':'https://results.beup.ac.in/ResultsBTech7thSem','sem':7},
      {'name':'BEU B.Tech Result (Sem 8)','url':'https://results.beup.ac.in/ResultsBTech8thSem','sem':8},
    ]
  },
  'official': {
    'title':'BEU Official',
    'items':[
      {'name':'BEU Official Website','url':'https://beu-bih.ac.in/','desc':'Bihar Engineering University home'},
      {'name':'BEU Notifications & Circulars','url':'https://beu-bih.ac.in/notification','desc':'Latest official notices'},
      {'name':'BEU Student Login Portal','url':'http://beu.intelliexams.com/BEUEXAMS/LoginScreens/frmStudentLoginPage.aspx','desc':'Exam / student services login'},
      {'name':'BEU Results Home','url':'https://beu-bih.ac.in/result-one','desc':'Result declarations'},
    ]
  },
  'learning': {
    'title':'Learning & Skills',
    'items':[
      {'name':'NPTEL','url':'https://nptel.ac.in/','desc':'Free IIT/IISc video courses & certification'},
      {'name':'SWAYAM','url':'https://swayam.gov.in/','desc':'Govt online courses with credits'},
      {'name':'AICTE Internships','url':'https://internship.aicte-india.org/','desc':'Internship opportunities portal'},
      {'name':'GATE 2026','url':'https://gate2026.iitg.ac.in/','desc':'GATE exam papers & syllabus'},
    ]
  },
  'scholarship': {
    'title':'Scholarships',
    'items':[
      {'name':'National Scholarship Portal','url':'https://scholarships.gov.in/','desc':'Central & state scholarships'},
      {'name':'Bihar PMS (Post-Matric)','url':'https://pmsonline.bih.nic.in/','desc':'Bihar post-matric scholarship'},
      {'name':'AICTE Student Schemes','url':'https://www.aicte-india.org/schemes/students-development-schemes','desc':'Pragati, Saksham & more'},
      {'name':'7 Nishchay Yuva Upmission','url':'https://www.7nishchay-yuvaupmission.bihar.gov.in/','desc':'Bihar student credit card & skills'},
    ]
  },
}
json.dump(portals, open(os.path.join(OUT,'seed_portals.json'),'w'), ensure_ascii=False, indent=0)

# ---------- COLLEGES ----------
ctx=json.load(open(os.path.join(BASE,'BEU_BABA_ALL_CONTEXT.json')))
urls=ctx['datasets']['06_dex_urls']
import urllib.parse
NAMES={
 'gcegaya':'Government Engineering College, Gaya','gecarwal':'Government Engineering College, Arwal',
 'gecaurangabad':'Government Engineering College, Aurangabad','gecbanka':'Government Engineering College, Banka',
 'gecbhojpur':'Government Engineering College, Bhojpur','gecbuxar':'Government Engineering College, Buxar',
 'gecgopalganj':'Government Engineering College, Gopalganj','gecjamui':'Government Engineering College, Jamui',
 'gecjehanabad':'Government Engineering College, Jehanabad','geckaimur':'Government Engineering College, Kaimur',
 'geckhagaria':'Government Engineering College, Khagaria','geckishanganj':'Government Engineering College, Kishanganj',
 'geclakhisarai':'Government Engineering College, Lakhisarai','gecmadhubani':'Government Engineering College, Madhubani',
 'gecnawada':'Government Engineering College, Nawada','gecsamastipur':'Government Engineering College, Samastipur',
 'gecsheikhpura':'Government Engineering College, Sheikhpura','gecsheohar':'Government Engineering College, Sheohar',
 'gecsiwan':'Government Engineering College, Siwan','gecvaishali':'Government Engineering College, Vaishali',
 'gecwc':'Women\u2019s Government Engineering College','bcebhagalpur':'Bhagalpur College of Engineering',
 'bcebakhtiyarpur':'B.C.E. Bakhtiyarpur','mcemotihari':'Motihari College of Engineering',
 'mitmuzaffarpur':'Muzaffarpur Institute of Technology','lnjpitchapra':'L.N.J.P. Institute of Technology, Chapra',
 'pcepurnia':'Purnea College of Engineering','sitsitamarhi':'Sitamarhi Institute of Technology',
 'scesaharsa':'Saharsa College of Engineering','scesasaram':'Sasaram College of Engineering',
 'scesupaul':'Supaul College of Engineering','rrsdcebgs':'R.R.S.D. College of Engineering',
 'keck':'Katihar Engineering College','ncechandi':'Nalanda College of Engineering, Chandi',
 'spnrecararia':'S.P.N. Regional Engineering College, Araria','gecmunger':'Government Engineering College, Munger',
 'dce-darbhanga':'Darbhanga College of Engineering','bpmcemadhepura':'B.P. Mandal College of Engineering, Madhepura',
 'gecbatch':'Government Engineering College',
}
colleges=[]
seen=set()
for u in urls:
    if not isinstance(u,str) or 'ac.in' not in u and '.org' not in u: continue
    m=re.search(r'https?://([^/]+)',u)
    if not m: continue
    host=m.group(1).lower()
    if not any(h in host for h in NAMES): continue
    key=None
    for h in NAMES:
        if h in host: key=h; break
    if not key or key in seen: continue
    seen.add(key)
    url='https://'+host if not u.startswith('http') else u.split(' ')[0]
    colleges.append({'name':NAMES[key],'url':'https://'+host,'host':host})
colleges.sort(key=lambda x:x['name'])
json.dump(colleges, open(os.path.join(OUT,'seed_colleges.json'),'w'), ensure_ascii=False, indent=0)

print('gov exams',len(gov),'| colleges',len(colleges))
print('gov sample:', gov[0]['name'],'/',gov[0]['category'],'| sections',len(gov[0]['sections']))
print('cat counts:', {c: sum(1 for g in gov if g['category']==c) for c in sorted(set(g['category'] for g in gov))})
