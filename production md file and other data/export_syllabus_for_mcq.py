#!/usr/bin/env python3
"""Export the full BEU syllabus as clean, per-branch JSON files (all semesters,
unit-wise) ready to feed into an external MCQ generator.

Output: beubaba/syllabus_export/
  - index.json                     -> catalog of all branches + counts
  - <branch_slug>.json             -> ONE file per branch, ALL semesters, unit-wise
  - _ALL_BRANCHES.json             -> everything in a single file (optional bulk)

Each branch file shape:
{
  "branch": "Computer Science & Engineering",
  "branch_id": "8cfeb316-...",
  "course": "B.Tech",
  "semesters": [
    {
      "semester": 3,
      "subjects": [
        {
          "subject_name": "Data Structure and Algorithms",
          "subject_code": "105302",
          "type": "theory",
          "credits": 4, "L": 3, "T": 0, "P": 0,
          "units": [
            { "unit_index": 0, "unit_title": "Unit 1 ...", "topics": ["...", "..."] }
          ],
          "books": ["..."]
        }
      ]
    }
  ]
}
"""
import json, os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', 'beubaba')
ROOT = os.path.abspath(ROOT)
MOCK = os.path.join(ROOT, 'src', 'services', 'mock')
OUT = os.path.join(ROOT, 'syllabus_export')
os.makedirs(OUT, exist_ok=True)

ac = json.load(open(os.path.join(MOCK, 'seed_academic.json')))
det = json.load(open(os.path.join(MOCK, 'seed_syllabus_detail.json')))
byc = json.load(open(os.path.join(MOCK, 'seed_syllabus_by_code.json')))

sem_num = {s['id']: s['number'] for s in ac['semesters']}
courses = {c['id']: c['name'] for c in ac['courses']}


def slug(name):
    s = re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')
    return s


def detail_for(subject):
    """Best available unit detail: prefer by-id, fall back to by-code."""
    d = det.get(subject['id'])
    if d and d.get('units'):
        return d
    d = byc.get(subject['code'])
    if d and d.get('units'):
        return d
    return {'units': [], 'books': []}


def clean_units(units):
    out = []
    for i, u in enumerate(units):
        topics = [t.strip() for t in u.get('topics', []) if t and t.strip()]
        # de-dup while preserving order
        seen = set()
        uniq = []
        for t in topics:
            key = t.lower()
            if key in seen:
                continue
            seen.add(key)
            uniq.append(t)
        title = u.get('title') or ''
        if not title or title.strip().lower() == 'unit':
            title = f'Unit {i + 1}'
        out.append({'unit_index': i, 'unit_title': title, 'topics': uniq})
    return out


catalog = []
all_branches = []

for b in sorted(ac['branches'], key=lambda x: x['name']):
    branch_obj = {
        'branch': b['name'],
        'branch_id': b['id'],
        'course': courses.get(b['course_id'], 'B.Tech'),
        'semesters': [],
    }
    subj = [s for s in ac['subjects'] if s['branch_id'] == b['id']]
    by_sem = {}
    for s in subj:
        n = sem_num.get(s['semester_id'])
        by_sem.setdefault(n, []).append(s)

    total_units = 0
    total_subjects = 0
    covered_subjects = 0
    for n in sorted(k for k in by_sem if k is not None):
        sem_subjects = []
        for s in sorted(by_sem[n], key=lambda x: x['code']):
            d = detail_for(s)
            units = clean_units(d.get('units', []))
            total_units += len(units)
            total_subjects += 1
            if units:
                covered_subjects += 1
            sem_subjects.append({
                'subject_name': s['name'],
                'subject_code': s['code'],
                'type': s.get('type') or 'theory',
                'credits': s.get('credits'),
                'L': s.get('L'), 'T': s.get('T'), 'P': s.get('P'),
                'units': units,
                'books': d.get('books', []),
                'has_detailed_syllabus': bool(units),
            })
        branch_obj['semesters'].append({'semester': n, 'subjects': sem_subjects})

    fname = f'{slug(b["name"])}.json'
    json.dump(branch_obj, open(os.path.join(OUT, fname), 'w'),
              ensure_ascii=False, indent=2)
    all_branches.append(branch_obj)
    catalog.append({
        'branch': b['name'],
        'branch_id': b['id'],
        'file': fname,
        'semesters': len(branch_obj['semesters']),
        'subjects': total_subjects,
        'subjects_with_units': covered_subjects,
        'total_units': total_units,
    })
    print(f'{b["name"]:<48} subj={total_subjects:3d} covered={covered_subjects:3d} units={total_units:4d}')

json.dump({'course': 'B.Tech', 'branches': catalog},
          open(os.path.join(OUT, 'index.json'), 'w'), ensure_ascii=False, indent=2)
json.dump(all_branches, open(os.path.join(OUT, '_ALL_BRANCHES.json'), 'w'),
          ensure_ascii=False, indent=2)

tot_subj = sum(c['subjects'] for c in catalog)
tot_cov = sum(c['subjects_with_units'] for c in catalog)
tot_units = sum(c['total_units'] for c in catalog)
print('-' * 70)
print(f'branches={len(catalog)}  subjects={tot_subj}  with_units={tot_cov}  units={tot_units}')
print(f'written to {OUT}')
