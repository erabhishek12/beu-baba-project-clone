#!/usr/bin/env python3
"""Normalize the extracted BEU dataset into BEU BABA's documented taxonomy.
Course -> Branch -> Semester -> Subject. Deterministic UUID-like slugs/ids.
Outputs seed_academic.json for the mock data layer.
"""
import json, re, hashlib, os

BASE = os.path.dirname(__file__)


def uid(*parts):
    h = hashlib.md5('::'.join(str(p) for p in parts).encode()).hexdigest()
    # format as a uuid-ish string (stable, deterministic)
    return f"{h[0:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}"


def slugify(s):
    s = s.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def sem_from_title(title, fallback):
    m = re.match(r'\s*(\d+)', title or '')
    return int(m.group(1)) if m else fallback


syll = json.load(open(os.path.join(BASE, 'syllabus.json')))
pyqs = json.load(open(os.path.join(BASE, 'pyqs.json')))

# ---- Course (single university program baseline) ----
course = {
    'id': uid('course', 'btech'),
    'name': 'B.Tech',
    'short_name': 'B.Tech',
    'slug': 'btech',
    'display_order': 0,
}

# ---- Branches (distinct, ordered) ----
branch_names = sorted({r['branch'] for r in syll if r.get('branch')})
branches = []
branch_id_by_name = {}
for i, name in enumerate(branch_names):
    bid = uid('branch', name)
    branch_id_by_name[name] = bid
    branches.append({
        'id': bid,
        'course_id': course['id'],
        'name': name,
        'slug': slugify(name),
        'display_order': i,
    })

# ---- Semesters 1..8 ----
ord_lbl = {1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 8: '8th'}
semesters = [
    {'id': uid('sem', n), 'number': n, 'label': f'Semester {n}'}
    for n in range(1, 9)
]
sem_id_by_num = {s['number']: s['id'] for s in semesters}

# ---- Subjects (dedup by branch+semester+code) ----
subjects = []
seen_subj = set()
for r in syll:
    bname = r.get('branch')
    if not bname:
        continue
    bid = branch_id_by_name[bname]
    sem = sem_from_title(r.get('title', ''), r.get('semester') or 1)
    sid = sem_id_by_num.get(sem)
    for s in r.get('subjects', []):
        code = str(s.get('code') or '').strip()
        name = (s.get('name') or '').strip()
        if not name:
            continue
        key = (bid, sem, code or name)
        if key in seen_subj:
            continue
        seen_subj.add(key)
        subjects.append({
            'id': uid('subject', bid, sem, code or name),
            'branch_id': bid,
            'semester_id': sid,
            'name': name,
            'code': code,
            'credits': s.get('credits'),
            'type': s.get('type') or 'theory',
        })

seed = {
    'courses': [course],
    'branches': branches,
    'semesters': semesters,
    'subjects': subjects,
    'stats': {
        'branches': len(branches),
        'semesters': len(semesters),
        'subjects': len(subjects),
        'pyq_papers': len(pyqs),
    },
}

out = os.path.join(BASE, '..', 'beubaba', 'src', 'services', 'mock', 'seed_academic.json')
out = os.path.abspath(out)
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(seed, open(out, 'w'), ensure_ascii=False, indent=0)
print('wrote', out)
print(json.dumps(seed['stats'], indent=2))
