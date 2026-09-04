#!/usr/bin/env python3
"""
BEU BABA — MCQ import readiness audit (Phase 0 evidence).

Validates the 5 uploaded branch MCQ files against:
  1. their own internal consistency (schema, answer keys, duplicates)
  2. the EXISTING app schema  src/services/mock/seed_quiz_questions.json
  3. the EXISTING academic taxonomy  src/services/mock/seed_academic.json
     (branch_id UUIDs and subject_code values must already exist)

Read-only. Prints a report; writes JSON summary to /tmp/mcq_audit.json
"""
import json, glob, os, re
from collections import Counter, defaultdict

UP = "/home/user/uploads"
MOCK = "/home/user/repo/beubaba/src/services/mock"

acad = json.load(open(f"{MOCK}/seed_academic.json"))
existing_q = json.load(open(f"{MOCK}/seed_quiz_questions.json"))
existing_z = json.load(open(f"{MOCK}/seed_quiz_meta.json"))

valid_branch = {b["id"]: b["name"] for b in acad["branches"]}
valid_subject = {s["code"]: s for s in acad["subjects"] if s.get("code")}
valid_sem = {s["number"] for s in acad["semesters"]}
existing_qids = {q["id"] for q in existing_q}

BRANCH_BY_NAME = {
    "civil": "Civil Engineering",
    "computer_science": "Computer Science & Engineering",
    "electrical": "Electrical Engineering",
    "mechanical": "Mechanical Engineering",
}
name_to_id = {v: k for k, v in valid_branch.items()}

print("=" * 100)
print("BEU BABA — MCQ IMPORT READINESS AUDIT")
print("=" * 100)
print(f"existing app question bank : {len(existing_q)} questions / {len(existing_z)} quizzes")
print(f"taxonomy available         : {len(valid_branch)} branches, "
      f"{len(valid_subject)} subject codes, semesters {sorted(valid_sem)}")
print()

grand = Counter()
all_ids = Counter()
per_file = []
problems = defaultdict(list)

for f in sorted(glob.glob(f"{UP}/*.mcq*.json")):
    base = os.path.basename(f)
    d = json.load(open(f, encoding="utf-8"))
    c = {}
    c["file"] = base
    c["size_mb"] = round(os.path.getsize(f) / 1048576, 2)
    c["records"] = len(d)

    types = Counter(); diffs = Counter(); sems = Counter()
    bad_key = 0; bad_branch = 0; bad_subject = 0; bad_sem = 0
    no_expl = 0; no_opts = 0; short_opts = 0; dup_local = Counter()
    branch_ids = Counter(); subj_codes = set(); units = set()
    verified = 0; pyq = 0; important = 0
    collides_existing = 0
    stem_len = []
    latex = 0
    lpat = re.compile(r"\\[a-zA-Z]+|\\\(|\\\[|\$\$?")

    for r in d:
        rid = r.get("id")
        if rid:
            dup_local[rid] += 1
            all_ids[rid] += 1
            if rid in existing_qids:
                collides_existing += 1
        t = r.get("type"); types[t] += 1
        diffs[r.get("difficulty")] += 1
        sems[r.get("semester")] += 1
        if r.get("branch_id") in valid_branch:
            branch_ids[r["branch_id"]] += 1
        else:
            bad_branch += 1
        if r.get("subject_code") in valid_subject:
            subj_codes.add(r["subject_code"])
        else:
            bad_subject += 1
        if r.get("semester") not in valid_sem:
            bad_sem += 1
        units.add((r.get("subject_code"), r.get("unit_index")))
        opts = r.get("options") or []
        if not opts: no_opts += 1
        elif len(opts) < 2: short_opts += 1
        if t == "multi":
            ci = r.get("correct_indices") or []
            if not ci or any(not isinstance(i, int) or i < 0 or i >= len(opts) for i in ci):
                bad_key += 1
        else:
            ci = r.get("correct_index")
            if not isinstance(ci, int) or ci < 0 or ci >= len(opts):
                bad_key += 1
        if not (r.get("explanation") or "").strip(): no_expl += 1
        if r.get("verified"): verified += 1
        if r.get("pyq"): pyq += 1
        if r.get("important"): important += 1
        s = r.get("stem") or ""
        stem_len.append(len(s))
        if lpat.search(s): latex += 1

    dups = sum(v - 1 for v in dup_local.values() if v > 1)
    c.update(dict(types=dict(types), diffs=dict(diffs), sems=dict(sems),
                  bad_key=bad_key, bad_branch=bad_branch, bad_subject=bad_subject,
                  bad_sem=bad_sem, no_expl=no_expl, no_opts=no_opts,
                  short_opts=short_opts, dup_local=dups,
                  branch_ids=dict(branch_ids), n_subjects=len(subj_codes),
                  n_units=len(units), verified=verified, pyq=pyq,
                  important=important, collides_existing=collides_existing,
                  latex=latex,
                  avg_stem=round(sum(stem_len) / max(len(stem_len), 1), 1)))
    per_file.append(c)
    grand["records"] += len(d)
    grand["bad_key"] += bad_key; grand["bad_branch"] += bad_branch
    grand["bad_subject"] += bad_subject; grand["bad_sem"] += bad_sem
    grand["no_expl"] += no_expl; grand["dup_local"] += dups
    grand["verified"] += verified; grand["pyq"] += pyq
    grand["important"] += important; grand["latex"] += latex
    grand["collides_existing"] += collides_existing
    for t, n in types.items(): grand[f"type:{t}"] += n
    for t, n in diffs.items(): grand[f"diff:{t}"] += n

for c in per_file:
    print("-" * 100)
    print(f"{c['file']}   ({c['size_mb']} MB)   {c['records']} questions")
    print(f"  subjects covered : {c['n_subjects']}    subject+unit pairs: {c['n_units']}")
    print(f"  branch_id valid  : {sum(c['branch_ids'].values())} / {c['records']}"
          f"   invalid: {c['bad_branch']}")
    for bid, n in sorted(c["branch_ids"].items(), key=lambda x: -x[1])[:3]:
        print(f"      -> {valid_branch.get(bid,'?')} : {n}")
    print(f"  subject_code in taxonomy : {'YES' if not c['bad_subject'] else 'NO — ' + str(c['bad_subject']) + ' invalid'}"
          f"   semester invalid: {c['bad_sem']}")
    print(f"  types       : {dict(c['types'])}")
    print(f"  difficulty  : {dict(c['diffs'])}")
    print(f"  semesters   : {dict(sorted(c['sems'].items(), key=lambda x: (x[0] is None, x[0])))}")
    print(f"  DEFECTS: broken answer key={c['bad_key']}  missing explanation={c['no_expl']}  "
          f"no options={c['no_opts']}  <2 options={c['short_opts']}")
    print(f"           duplicate ids in file={c['dup_local']}  "
          f"id collides with EXISTING bank={c['collides_existing']}")
    print(f"  flags: verified={c['verified']}  pyq={c['pyq']}  important={c['important']}  "
          f"latex-in-stem={c['latex']}  avg stem chars={c['avg_stem']}")
    print()

print("=" * 100)
print("AGGREGATE")
print("=" * 100)
print(f"  total new questions        : {grand['records']}")
print(f"  existing bank              : {len(existing_q)}")
print(f"  combined                   : {grand['records'] + len(existing_q)}")
print(f"  global duplicate ids       : {sum(v-1 for v in all_ids.values() if v>1)}")
print(f"  ids colliding with existing: {grand['collides_existing']}")
print(f"  broken answer keys         : {grand['bad_key']}")
print(f"  invalid branch_id          : {grand['bad_branch']}")
print(f"  invalid subject_code       : {grand['bad_subject']}")
print(f"  invalid semester           : {grand['bad_sem']}")
print(f"  missing explanation        : {grand['no_expl']}")
print(f"  verified=true              : {grand['verified']}")
print(f"  pyq=true                   : {grand['pyq']}")
print(f"  important=true             : {grand['important']}")
print(f"  LaTeX markup in stem       : {grand['latex']}")
print(f"  type mix                   : " + ", ".join(
    f"{k.split(':')[1]}={v}" for k, v in sorted(grand.items()) if k.startswith("type:")))
print(f"  difficulty mix             : " + ", ".join(
    f"{k.split(':')[1]}={v}" for k, v in sorted(grand.items()) if k.startswith("diff:")))
print()
print("EXISTING app QuizQuestion fields : " +
      ", ".join(sorted(existing_q[0].keys())))
newkeys = set()
for f in sorted(glob.glob(f"{UP}/*.mcq*.json")):
    for r in json.load(open(f, encoding="utf-8"))[:50]:
        newkeys |= set(r.keys())
print("NEW file fields                  : " + ", ".join(sorted(newkeys)))
print("ADDED by new files               : " +
      ", ".join(sorted(newkeys - set(existing_q[0].keys()))))
print("MISSING vs existing              : " +
      ", ".join(sorted(set(existing_q[0].keys()) - newkeys)) or "(none)")

json.dump({"per_file": [{k: (dict(v) if isinstance(v, Counter) else v)
                         for k, v in c.items()} for c in per_file],
           "grand": dict(grand)},
          open("/tmp/mcq_audit.json", "w"), indent=2, default=str)
