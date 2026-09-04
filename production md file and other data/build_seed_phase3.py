#!/usr/bin/env python3
"""Phase 3 seed builder.
Produces, joined to the SAME deterministic IDs used by seed_academic.json:
  - seed_pyq_meta.json  : lightweight paper catalog (always bundled)
  - seed_pyq_full.json  : full trimmed question blocks keyed by paper id (lazy)
Also enriches seed_academic.json subjects with L/T/P (syllabus needs them) and
adds a `pyq_papers` count. Subject IDs are unchanged (derived from branch+sem+code).
"""
import json, re, hashlib, os

BASE = os.path.dirname(__file__)
OUT_DIR = os.path.abspath(os.path.join(BASE, '..', 'beubaba', 'src', 'services', 'mock'))

def uid(*parts):
    h = hashlib.md5('::'.join(str(p) for p in parts).encode()).hexdigest()
    return f"{h[0:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}"

def sem_from_title(title, fallback):
    m = re.match(r'\s*(\d+)', title or '')
    return int(m.group(1)) if m else fallback

syll = json.load(open(os.path.join(BASE, 'syllabus.json')))
pyqs = json.load(open(os.path.join(BASE, 'pyqs.json')))

# semester number -> deterministic id (same recipe as build_seed.py: uid('sem', n))
sem_id_by_num = {n: uid('sem', n) for n in range(1, 9)}

# ---------- PYQ META + FULL ----------
meta = []
full = {}
seen = set()
for r in pyqs:
    code = str(r.get('code') or '').strip()
    subject = (r.get('subject') or '').strip() or 'Unknown Subject'
    year = r.get('year')
    sem = r.get('semester')
    src = r.get('source_file') or ''
    pid = uid('pyq', src, code, year, subject)
    if pid in seen:
        pid = uid('pyq', src, code, year, subject, len(meta))
    seen.add(pid)
    blocks = r.get('blocks', []) or []
    qcount = sum(len(b.get('subquestions', []) or []) for b in blocks)
    meta.append({
        'id': pid,
        'code': code or None,
        'subject': subject,
        'semester': sem,
        'semester_id': sem_id_by_num.get(sem) if sem else None,
        'year': year,
        'group': r.get('group'),
        'exam_title': r.get('exam_title'),
        'full_marks': r.get('full_marks'),
        'time': r.get('time'),
        'question_count': qcount,
        'block_count': len(blocks),
    })
    # trimmed full blocks
    tblocks = []
    for b in blocks:
        subs = []
        for s in b.get('subquestions', []) or []:
            opts = s.get('options') or None
            subs.append({
                'number': s.get('number'),
                'text': (s.get('text') or '').strip(),
                'options': opts,
                'marks': s.get('marks'),
            })
        tblocks.append({
            'number': b.get('number'),
            'title': (b.get('title') or '').strip(),
            'marks': b.get('marks'),
            'subquestions': subs,
        })
    full[pid] = {
        'instructions': r.get('instructions') or [],
        'blocks': tblocks,
    }

json.dump(meta, open(os.path.join(OUT_DIR, 'seed_pyq_meta.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(full, open(os.path.join(OUT_DIR, 'seed_pyq_full.json'), 'w'), ensure_ascii=False, indent=0)

# ---------- Enrich subjects with L/T/P ----------
seed_path = os.path.join(OUT_DIR, 'seed_academic.json')
seed = json.load(open(seed_path))
# build lookup by subject id -> L/T/P from syllabus
branch_names = sorted({r['branch'] for r in syll if r.get('branch')})
branch_id_by_name = {name: uid('branch', name) for name in branch_names}
ltp = {}
for r in syll:
    bname = r.get('branch')
    if not bname:
        continue
    bid = branch_id_by_name[bname]
    sem = sem_from_title(r.get('title', ''), r.get('semester') or 1)
    for s in r.get('subjects', []):
        code = str(s.get('code') or '').strip()
        name = (s.get('name') or '').strip()
        if not name:
            continue
        sid = uid('subject', bid, sem, code or name)
        ltp[sid] = {'L': s.get('L'), 'T': s.get('T'), 'P': s.get('P')}

enriched = 0
for sub in seed['subjects']:
    v = ltp.get(sub['id'])
    if v:
        sub['L'] = v['L']; sub['T'] = v['T']; sub['P'] = v['P']
        enriched += 1
seed['stats']['pyq_papers'] = len(meta)
json.dump(seed, open(seed_path, 'w'), ensure_ascii=False, indent=0)

print('pyq_meta', len(meta), 'pyq_full', len(full), 'subjects_enriched', enriched)
print('meta bytes', os.path.getsize(os.path.join(OUT_DIR, 'seed_pyq_meta.json')))
print('full bytes', os.path.getsize(os.path.join(OUT_DIR, 'seed_pyq_full.json')))
