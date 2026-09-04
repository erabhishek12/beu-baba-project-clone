#!/usr/bin/env python3
"""Rebuild detailed unit-wise syllabus with ROBUST header parsing.
Handles: 'Unit 1', 'Unit-1.0', 'Unit- 1', 'Module 1', 'Module I' (roman).
Output: seed_syllabus_detail.json  { subject_id: {units:[{title,topics[]}], books:[]} }
"""
import json, re, hashlib, os
BASE=os.path.dirname(__file__)
OUT=os.path.abspath(os.path.join(BASE,'..','beubaba','src','services','mock'))

def uid(*p):
    h=hashlib.md5('::'.join(str(x) for x in p).encode()).hexdigest()
    return f"{h[0:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}"
def semnum(t,f):
    m=re.match(r'\s*(\d+)',t or ''); return int(m.group(1)) if m else f
def norm(s): return re.sub(r'[^a-z0-9]','',(s or '').lower())

syll=json.load(open(os.path.join(BASE,'syllabus.json')))
ctx=json.load(open(os.path.join(BASE,'BEU_BABA_ALL_CONTEXT.json')))
det=ctx['datasets']['02_syllabus_subjects_detailed']

page_info={}; code_lookup={}
branch_names=sorted({r['branch'] for r in syll if r.get('branch')})
bid_by_name={n:uid('branch',n) for n in branch_names}
for r in syll:
    sf=r.get('source_file')
    if not sf: continue
    page_info[sf]=(r.get('branch'), semnum(r.get('title',''), r.get('semester') or 1))
    for s in r.get('subjects',[]):
        nm=norm(s.get('name')); code=str(s.get('code') or '').strip()
        if nm: code_lookup[(sf,nm)]=code

# Header: Unit/Module + optional -/space + number(1 or 1.0) or roman, then ':' or text
HEADER=re.compile(r'^\s*(?:unit|module|chapter)\s*[-–.\s]?\s*([0-9]+(?:\.[0-9]+)?|[ivxIVX]+)\s*[:.\-–)]?\s*(.*)$', re.I)

def parse_units(raw):
    units=[]; cur=None
    for line in raw:
        line=(line or '').strip()
        if not line: continue
        m=HEADER.match(line)
        # guard: real header line is short-ish prefix; avoid matching sentences that merely start with 'in ...'
        if m and len(line) < 400:
            rest=m.group(2).strip()
            cur={'title':rest,'topics':[]}
            units.append(cur)
        else:
            if cur is None:
                cur={'title':'','topics':[]}; units.append(cur)
            cur['topics'].append(line)
    # derive concise unit title from header rest (header concatenates title+topics)
    for u in units:
        t=u['title']
        if u['topics']:
            ft=u['topics'][0]
            idx=t.find(ft)
            if idx>0: t=t[:idx].strip()
        # trim trailing colon words / cap length
        t=t.strip(' :-–.')
        w=t.split()
        if len(w)>10: t=' '.join(w[:10])
        u['title']=t or 'Unit'
    # drop empty leading overview if it has no topics
    units=[u for u in units if u['topics'] or (u['title'] and u['title']!='Unit')]
    return units

out={}; matched=0
for x in det:
    page=x['page']; subj=x['subject_title']
    info=page_info.get(page)
    if not info: continue
    bname,sem=info; bid=bid_by_name.get(bname)
    code=code_lookup.get((page,norm(subj)))
    if code:
        sid=uid('subject',bid,sem,code); matched+=1
    else:
        sid=uid('subject',bid,sem,subj)
    raw=x.get('raw_text',[]) or []
    units=parse_units(raw)
    books=[]
    for k,v in (x.get('sections') or {}).items():
        if 'book' in k.lower() and isinstance(v,list): books=[b for b in v if b]
    if units and sid not in out:
        out[sid]={'units':units,'books':books}

json.dump(out, open(os.path.join(OUT,'seed_syllabus_detail.json'),'w'), ensure_ascii=False, indent=0)
# stats
nunits=[len(v['units']) for v in out.values()]
print('out subjects',len(out),'| matched-by-code',matched)
print('avg units/subj', round(sum(nunits)/len(nunits),2), '| single-unit subjects', sum(1 for n in nunits if n==1))
# COA check
coa=uid('subject', bid_by_name['CSE Specialization'], 4, '105401')
print('COA theory units:', len(out.get(coa,{}).get('units',[])) if coa in out else 'MISSING')

# ---- Build a CODE -> detail fallback map (same code = same syllabus across branches) ----
# Reload seed to map subject_id -> code
seed=json.load(open(os.path.join(OUT,'seed_academic.json')))
id2code={s['id']: (s.get('code') or '').strip() for s in seed['subjects']}
code_detail={}
for sid,det_obj in out.items():
    code=id2code.get(sid)
    if not code: continue
    # prefer the entry with the most units for a given code
    prev=code_detail.get(code)
    if not prev or len(det_obj['units'])>len(prev['units']):
        code_detail[code]=det_obj
json.dump(code_detail, open(os.path.join(OUT,'seed_syllabus_by_code.json'),'w'), ensure_ascii=False, indent=0)

# Coverage after code fallback
covered=0
for s in seed['subjects']:
    if s['id'] in out or (s.get('code','').strip() and s['code'].strip() in code_detail):
        covered+=1
print('by-code entries', len(code_detail))
print('coverage with code fallback:', covered, '/', len(seed['subjects']))
