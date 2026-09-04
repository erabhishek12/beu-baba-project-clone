# BEU BABA — MASTER MCQ GENERATION PROMPT (v2, Advanced)

> **What this file is:** the complete, self-contained instruction set to generate
> **university-level MCQs with answers + one-line explanations**, **unit-wise**,
> for **every branch, every semester, every subject** of Bihar Engineering
> University (BEU). It is written so you can paste it into any capable LLM
> (ChatGPT / Claude / Gemini / Grok / etc.) together with **one branch JSON file**
> and receive a complete, ready-to-import MCQ JSON back.
>
> **Golden rule:** generate **as many questions as a unit can legitimately
> support** — a rich unit must yield **60–100+** questions, not 5–10. Under-
> generation is a failure. Every question must feel like it could appear on a real
> BEU end-semester paper, written by an experienced professor.

---

## 0. THE FILES YOU ARE WORKING WITH

The syllabus has been exported for you to:

```
beubaba/syllabus_export/
  index.json               # catalog: every branch, file name, subject & unit counts
  <branch>.json            # ONE file per branch — ALL semesters, ALL subjects, unit-wise
  _ALL_BRANCHES.json       # everything in one file (only if you batch the whole university)
```

**Recommended workflow:** feed **one branch file at a time** (they are large). For
each branch file, walk `semesters[] → subjects[] → units[]` and generate MCQs for
**every unit of every subject**. Do not skip labs unless a lab genuinely has no
theory content (`has_detailed_syllabus: false` and no topics).

### Input shape (a single subject unit inside a branch file)

```json
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
            {
              "unit_index": 0,
              "unit_title": "Unit 1 — Introduction & Complexity",
              "topics": [
                "Asymptotic notation (Big-O, Omega, Theta)",
                "Time and space complexity",
                "Arrays, linked lists, representation"
              ]
            }
          ],
          "books": []
        }
      ]
    }
  ]
}
```

**Only test what the unit contains** — the `topics` array plus the standard,
universally-accepted sub-topics of those topics. Never drift into another unit or
invent syllabus that is not there.

---

## 1. HOW MANY QUESTIONS PER UNIT  (this is mandatory, not a suggestion)

Count the *effective concept surface* of the unit = number of distinct testable
ideas across all its topics (each topic usually carries 3–6 testable ideas).

| Unit size (testable ideas) | Minimum MCQs to generate |
| -------------------------- | ------------------------ |
| Small unit (≈ 1–2 topics)  | **40–55**                |
| Standard unit (3–5 topics) | **60–80**                |
| Rich unit (6+ topics)      | **80–120**               |

Hard rules:
- **Never** produce fewer than **40** questions for a theory unit that has topics.
- Distribute questions **proportionally across every topic** — no topic gets more
  than ~35% of the unit's questions, and **every topic must be covered**.
- Add ~10% **integrative** questions that combine two topics *from the same unit*.
- If you truly exhaust a small topic, generate variants (change numbers, reframe,
  invert "which is NOT") rather than dropping below the minimum.

Difficulty distribution **per unit**:
- **Easy 30%** — definitions, direct recall, one-step.
- **Medium 45%** — application, "which of the following", short calculation, code reasoning.
- **Hard 25%** — multi-step numericals, tricky distractors, code trace, assertion-reason, edge cases.

Question-type mix **per unit** (first release favors single-choice):
- Single-correct MCQ: **~80%**
- True/False: **~5%**
- Assertion–Reason: **~8%**
- Multiple-correct (select all): **~7%**

---

## 2. WHO YOU ARE WHEN YOU WRITE

You are a **panel of senior BEU professors and paper-setters** with 15+ years of
experience setting end-semester and competitive exams. Every question must:

- Use the **exact terminology, symbols and units** of the prescribed textbooks.
- Read like an **actual university exam question**, in the phrasing style of Indian
  engineering papers:
  - "Which of the following is **not** …"
  - "The value of … is …"
  - "**Assertion (A):** … **Reason (R):** … Choose the correct option."
  - "Consider the following statements. Which are correct?"
  - "The time complexity of the following code fragment is …"
- Prefer **conceptual depth over trivia.** Test understanding, application,
  derivation and common misconceptions — not obscure facts.
- Include **numerical problems** wherever the topic supports it (formulas,
  circuits, thermodynamic states, probability, complexity math), with realistic
  engineering values and correct SI units.
- For CS/IT: include **code-trace, output-prediction, complexity, and
  data-structure operation** questions.
- Mark the subset of questions that are **exam-critical / most-important** with
  `"important": true` (aim ~20–30% of each unit) so the app can build a
  "Most Important Questions" quiz.

---

## 3. OUTPUT SCHEMA  (STRICT — the app imports this exactly)

Return a **single JSON array** for the branch you were given. Each element:

```json
{
  "id": "q_105302_u0_001",
  "branch_id": "8cfeb316-...",
  "semester": 3,
  "subject_code": "105302",
  "subject_name": "Data Structure and Algorithms",
  "unit_index": 0,
  "unit_title": "Unit 1 — Introduction & Complexity",
  "topic": "Asymptotic notation (Big-O, Omega, Theta)",
  "type": "single",
  "difficulty": "medium",
  "important": true,
  "stem": "The worst-case time complexity of inserting an element at the beginning of a singly linked list of n nodes is:",
  "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
  "correct_index": 0,
  "explanation": "Insertion at the head only updates the head pointer and the new node's next, which is constant time O(1).",
  "source": "BEU syllabus — Data Structure and Algorithms, Unit 1",
  "pyq": false,
  "year": null,
  "verified": false
}
```

Field rules:
- `id` — `q_<subjectcode>_u<unit_index>_<3-digit seq>`, unique within the subject.
- `type` — `"single"` | `"multi"` | `"truefalse"` | `"assertion_reason"`.
  - `single`, `truefalse`, `assertion_reason` → use `"correct_index"` (0-based).
  - `multi` → use `"correct_indices": [ ... ]` instead of `correct_index`.
- `options` — **exactly 4** for `single`/`multi`; **exactly 2** `["True","False"]`
  for `truefalse`; for `assertion_reason` use the 4 standard options:
  1. "Both A and R are true and R is the correct explanation of A"
  2. "Both A and R are true but R is NOT the correct explanation of A"
  3. "A is true but R is false"
  4. "A is false but R is true"
  (Put the Assertion and Reason inside `stem` on two lines.)
- `explanation` — **exactly one line, ≤ 200 characters.** Say why the answer is
  right; where useful, one clause on why the tempting distractor is wrong.
- `important` — `true` for exam-critical questions.
- `verified` — always `false` for machine-generated output (a moderator flips it).
- Math: write inline LaTeX with `\( ... \)` **and** keep it human-readable.

---

## 4. ANSWER-QUALITY RULES  (this is the whole point — a wrong key is worse than no question)

1. **Exactly one** defensible correct answer for `single`. If you are not certain,
   **discard the question** — never guess a key. Wrong keys destroy trust and
   teach students incorrectly.
2. **Distractors must be plausible and genuinely wrong** — built from real
   misconceptions: off-by-one errors, swapped definitions, right-formula/wrong-
   variable, common sign/unit mistakes. No joke or absurd options.
3. **Spread the correct option** across A/B/C/D roughly evenly across the unit —
   never let "C" dominate. (The importer also re-shuffles, but author it spread.)
4. Avoid "All of the above" / "None of the above" except where authentic (≤ 1 in 20).
5. **No duplicate stems** within a subject. Reframe or change values instead.
6. Every `explanation` must be **factually checkable** against a standard textbook.
7. Keep stems **self-contained** — no "as seen above", no figure that isn't described.

---

## 5. TEXTBOOK ANCHORS  (match terminology to what BEU prescribes)

Anchor each subject to its standard books. Non-exhaustive:

- **Engineering Physics** — Halliday/Resnick/Walker; Arthur Beiser (Modern Physics).
- **Engineering Chemistry** — Jain & Jain; P.C. Rakshit.
- **Mathematics I/II/III** — B.S. Grewal; Erwin Kreyszig.
- **Programming for Problem Solving (C)** — E. Balagurusamy; Kernighan & Ritchie.
- **Basic Electrical Engineering** — V.K. Mehta; D.P. Kothari.
- **Engineering Mechanics** — R.C. Hibbeler; S.S. Bhavikatti.
- **Data Structures / Algorithms** — CLRS (Cormen); Tenenbaum; Horowitz–Sahni.
- **DBMS** — Korth (Silberschatz); Elmasri–Navathe.
- **Operating Systems** — Silberschatz–Galvin.
- **Computer Networks** — Tanenbaum; Forouzan.
- **TOC / Automata** — Hopcroft–Ullman; K.L.P. Mishra.
- **Compiler Design** — Aho–Ullman (Dragon Book).
- **Software Engineering** — Pressman; Sommerville.
- **Thermodynamics** — P.K. Nag; Cengel.
- **Fluid Mechanics** — R.K. Bansal; Cengel.
- **Strength of Materials** — R.K. Bansal; Timoshenko.
- **Surveying** — B.C. Punmia.
- **Network Theory / Signals** — Sadiku; Oppenheim.
- **Power Systems / Machines** — Nagrath–Kothari; P.S. Bimbhra.
- **Digital Electronics** — Morris Mano.
- **Control Systems** — Nagrath–Gopal; Ogata.
(For any subject not listed, use the most widely-prescribed Indian university text.)

---

## 6. GENERATION ORDER  (do most-used content first)

1. **Semester 1 & 2 common subjects** (shared by all branches): Physics,
   Chemistry, Maths-I & II, Programming for Problem Solving, Basic Electrical,
   Engineering Mechanics, Engineering Graphics & Design, English, Environmental
   Studies. → these unlock every branch at once.
2. **CSE + IT core** (largest cohort): DSA, DBMS, OS, CN, DAA, TOC, Compiler
   Design, Software Engineering, OOP/Java, COA.
3. **Core ME / CE / EE / ECE** subject by subject.
4. **Remaining specialized branches**, unit by unit.

Within each: for every subject → for every unit → hit the §1 count → self-check §4 → emit §3.

---

## 7. OUTPUT PACKAGING  (what to hand back)

Produce **one JSON file per branch**, named to match the input:

```
mcq_output/
  computer_science_engineering.mcq.json          # flat array of ALL question objects for that branch
  electrical_engineering.mcq.json
  ...
```

- Each file = a flat JSON array of question objects (§3), covering **every
  semester, every subject, every unit** of that branch.
- Keep questions in reading order: semester → subject_code → unit_index → seq.
- These are the files you will send back to be imported into BEU BABA. The app's
  importer builds quizzes automatically (one "Unit N" quiz per unit, a "Full
  Subject Revision" per subject, and a "Most Important Questions" quiz from the
  `important:true` set), keeps the answer keys server-side, and shows an
  "Unverified — community" badge until a moderator approves.

---

## 8. SELF-CHECK BEFORE YOU RETURN EACH BRANCH FILE

- [ ] Every subject and **every unit** with topics has questions.
- [ ] Each theory unit meets its **§1 minimum count** (rich units 80–120).
- [ ] Every question maps to a real topic of its unit.
- [ ] Exactly one defensible answer (single); keys verified against a textbook.
- [ ] Distractors plausible, not absurd; correct option spread across A/B/C/D.
- [ ] Difficulty ≈ 30/45/25; type mix ≈ 80/5/8/7.
- [ ] ~20–30% flagged `important:true`.
- [ ] Explanations one line, factual, ≤ 200 chars.
- [ ] No duplicate stems within a subject.
- [ ] All `verified:false`. Valid JSON array. IDs unique.

---

## 9. WORKED EXAMPLES  (the quality bar)

**Numerical (medium, Physics):**
```json
{
  "type": "single", "difficulty": "medium", "important": true,
  "topic": "Photoelectric effect",
  "stem": "Light of wavelength 300 nm strikes a metal of work function 2.0 eV. The maximum kinetic energy of emitted electrons is approximately (hc ≈ 1240 eV·nm):",
  "options": ["2.13 eV", "4.13 eV", "1.20 eV", "0.13 eV"],
  "correct_index": 0,
  "explanation": "E = hc/λ = 1240/300 ≈ 4.13 eV; KEmax = 4.13 − 2.0 = 2.13 eV."
}
```

**Code trace (hard, C):**
```json
{
  "type": "single", "difficulty": "hard", "important": true,
  "topic": "Arrays and pointers",
  "stem": "int a[]={1,2,3,4,5}; int *p=a+2; printf(\"%d\", *(p-1) + *(p+1)); What is printed?",
  "options": ["6", "5", "4", "8"],
  "correct_index": 0,
  "explanation": "p points to a[2]=3, so *(p-1)=a[1]=2 and *(p+1)=a[3]=4; 2+4=6."
}
```

**Assertion–Reason (medium, OS):**
```json
{
  "type": "assertion_reason", "difficulty": "medium", "important": false,
  "topic": "Deadlock",
  "stem": "Assertion (A): Preventing circular wait can eliminate deadlock.\nReason (R): Circular wait is one of the four necessary Coffman conditions for deadlock.",
  "options": [
    "Both A and R are true and R is the correct explanation of A",
    "Both A and R are true but R is NOT the correct explanation of A",
    "A is true but R is false",
    "A is false but R is true"
  ],
  "correct_index": 0,
  "explanation": "Breaking any one Coffman condition (here, circular wait) prevents deadlock; R correctly explains A."
}
```

---

## 10. HANDOFF SUMMARY

1. Take one file from `beubaba/syllabus_export/`.
2. For every semester → subject → unit, generate MCQs at the §1 volume and §2
   quality, with answers and one-line explanations.
3. Emit one flat JSON array per branch (§3, §7).
4. Send the resulting `*.mcq.json` files back — they will be imported directly
   into the BEU BABA quiz engine.
