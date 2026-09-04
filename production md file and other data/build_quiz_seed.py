#!/usr/bin/env python3
"""Build verified quiz seed for BEU BABA.

Hand-authored, textbook-checkable MCQs across core BEU subjects so the quiz
engine ships live and trustworthy. Bulk unit-wise generation is driven by
docs/QUIZ_MCQ_GENERATION_PROMPT.md and appended to these files later.

Outputs:
  src/services/mock/seed_quiz_questions.json  (flat array, includes answer keys)
  src/services/mock/seed_quiz_meta.json       (quiz metadata)
"""
import json, os, random

OUT = os.path.join(os.path.dirname(__file__), '..', 'beubaba', 'src', 'services', 'mock')
OUT = os.path.abspath(OUT)

# subject_code -> (subject_name, branch_id (nullable/common), semester)
SUBJECTS = {
    '100104': ('Engineering Physics', None, 1),
    '100103': ('Engineering Chemistry', None, 1),
    '100102': ('Engineering Mathematics - I', None, 1),
    '100203': ('Programming for Problem Solving', None, 2),
    '100212': ('Basic Electrical Engineering', None, 2),
    '105302': ('Data Structure and Algorithms', '8cfeb316', 3),
    '105305': ('Operating System', '8cfeb316', 3),
    '105406': ('Computer Networks', '8cfeb316', 4),
    '119601': ('Database Management Systems', '8cfeb316', 4),
}

Q = []  # questions
def add(code, unit, topic, stem, options, correct, expl, diff='medium', typ='single'):
    seq = sum(1 for q in Q if q['subject_code'] == code) + 1
    q = {
        'id': f'q_{code}_u{unit}_{seq:03d}',
        'subject_code': code,
        'unit_index': unit,
        'topic': topic,
        'type': typ,
        'difficulty': diff,
        'stem': stem,
        'options': options,
        'explanation': expl,
        'source': f'BEU syllabus — {SUBJECTS[code][0]}',
        'verified': True,
    }
    if typ == 'single' or typ == 'truefalse':
        q['correct_index'] = correct
    else:
        q['correct_indices'] = correct
    Q.append(q)

# ---------------------------------------------------------------------------
# ENGINEERING PHYSICS (100104)
# ---------------------------------------------------------------------------
c = '100104'
add(c,0,'Interference','In Young\u2019s double-slit experiment, the fringe width is directly proportional to',
    ['the wavelength of light','the slit separation','the square of the wavelength','the frequency of light'],0,
    'Fringe width \u03b2 = \u03bbD/d, so \u03b2 \u221d \u03bb.', 'easy')
add(c,0,'Interference','Two coherent sources are required for sustained interference because they must maintain a',
    ['constant phase difference','large intensity difference','different wavelength','random phase difference'],0,
    'Sustained interference needs a constant (time-independent) phase relationship between sources.','easy')
add(c,0,'Diffraction','In a single-slit diffraction pattern, the width of the central maximum is',
    ['twice that of secondary maxima','equal to secondary maxima','half of secondary maxima','independent of slit width'],0,
    'The central maximum spans 2\u03bbD/a, which is twice the width of each secondary maximum.','medium')
add(c,0,'Polarisation','Light can be polarised because it is a',
    ['transverse wave','longitudinal wave','mechanical wave','standing wave'],0,
    'Only transverse waves have a vibration direction perpendicular to propagation, allowing polarisation.','easy')
add(c,1,'Laser','Population inversion in a laser means',
    ['more atoms in the higher energy state than the lower','all atoms in ground state','equal atoms in both states','no atoms in excited state'],0,
    'Population inversion is a non-equilibrium state with more atoms in the upper level, enabling stimulated emission to dominate.','medium')
add(c,1,'Laser','The phenomenon responsible for light amplification in a laser is',
    ['stimulated emission','spontaneous emission','absorption','scattering'],0,
    'Laser = Light Amplification by Stimulated Emission of Radiation.','easy')
add(c,1,'Optical Fibre','Optical fibres transmit light using the principle of',
    ['total internal reflection','diffraction','dispersion','polarisation'],0,
    'Light stays confined in the core by repeated total internal reflection at the core-cladding boundary.','easy')
add(c,2,'Quantum','The de Broglie wavelength of a particle of momentum p is',
    ['h/p','p/h','hp','h/p\u00b2'],0,
    '\u03bb = h/p, where h is Planck\u2019s constant.','easy')
add(c,2,'Quantum','Heisenberg\u2019s uncertainty principle relates the uncertainties in',
    ['position and momentum','mass and velocity','charge and time','energy and charge'],0,
    '\u0394x\u00b7\u0394p \u2265 \u0127/2; position and momentum cannot both be known exactly.','medium')
add(c,2,'Quantum','For which scattering angle is the Compton shift maximum?',
    ['180\u00b0','0\u00b0','90\u00b0','45\u00b0'],0,
    'Compton shift \u0394\u03bb = (h/m_ec)(1\u2212cos\u03b8) is maximum when cos\u03b8 = \u22121, i.e. \u03b8 = 180\u00b0.','hard')
add(c,2,'Quantum','A characteristic that a valid wave function must satisfy is that it is',
    ['single valued, continuous and normalizable','discontinuous','infinite everywhere','always real'],0,
    'A physically acceptable \u03c8 must be single-valued, continuous and square-integrable (normalizable).','medium')
add(c,3,'Dielectrics','The dielectric constant of a perfect vacuum is',
    ['1','0','infinite','8.85\u00d710\u207b\u00b9\u00b2'],0,
    'Relative permittivity of vacuum is exactly 1 by definition.','easy')

# ---------------------------------------------------------------------------
# ENGINEERING CHEMISTRY (100103)
# ---------------------------------------------------------------------------
c = '100103'
add(c,0,'Atomic structure','According to VSEPR theory, the shape of a molecule with four bonding pairs and no lone pair is',
    ['tetrahedral','square planar','trigonal planar','octahedral'],0,
    'Four bonding pairs and no lone pair (AX4) arrange tetrahedrally to minimise repulsion, e.g. CH\u2084.','medium')
add(c,0,'Atomic structure','The molecule showing sp hybridisation of carbon is',
    ['C\u2082H\u2082 (acetylene)','CH\u2084 (methane)','C\u2082H\u2084 (ethene)','CCl\u2084'],0,
    'Acetylene has a triple bond; each carbon is sp hybridised (two \u03c3 + two \u03c0 bonds).','medium')
add(c,1,'Water','Temporary hardness of water is caused by',
    ['bicarbonates of calcium and magnesium','chlorides of calcium','sulphates of magnesium','nitrates of sodium'],0,
    'Temporary hardness is due to Ca/Mg bicarbonates and is removed by boiling.','easy')
add(c,1,'Water','The unit commonly used to express hardness of water is',
    ['ppm of CaCO\u2083','mol/L of Ca','g/L of Mg','pH'],0,
    'Hardness is expressed as parts per million (ppm) of CaCO\u2083 equivalent.','easy')
add(c,1,'Water','The process of removing all ions from water using resins is called',
    ['demineralisation','sedimentation','coagulation','chlorination'],0,
    'Ion-exchange (cation + anion resins) removes all ions, giving demineralised water.','medium')
add(c,2,'Electrochemistry','In a galvanic cell, oxidation occurs at the',
    ['anode','cathode','salt bridge','electrolyte'],0,
    'By definition oxidation (loss of electrons) occurs at the anode in any electrochemical cell.','easy')
add(c,2,'Electrochemistry','The Nernst equation is used to calculate the',
    ['electrode potential at non-standard conditions','rate of reaction','activation energy','molar mass'],0,
    'The Nernst equation gives cell/electrode potential as a function of concentration and temperature.','medium')
add(c,2,'Corrosion','Rusting of iron is an example of',
    ['electrochemical corrosion','dry corrosion only','physical weathering','sublimation'],0,
    'Rusting is electrochemical (wet) corrosion requiring water and oxygen, forming hydrated iron oxide.','easy')
add(c,3,'Fuels','The calorific value of a fuel is highest for',
    ['hydrogen','coal','petrol','wood'],0,
    'Hydrogen has the highest calorific value (~142 MJ/kg) among common fuels.','medium')
add(c,3,'Polymers','Bakelite is an example of a',
    ['thermosetting polymer','thermoplastic','elastomer','natural fibre'],0,
    'Bakelite (phenol-formaldehyde) is a cross-linked thermosetting polymer that cannot be remoulded.','medium')

# ---------------------------------------------------------------------------
# ENGINEERING MATHEMATICS - I (100102)
# ---------------------------------------------------------------------------
c = '100102'
add(c,0,'Matrices','The rank of a non-zero 3\u00d73 matrix whose determinant is zero is at most',
    ['2','3','1','0'],0,
    'A zero determinant means the matrix is singular, so rank < 3, i.e. at most 2.','medium')
add(c,0,'Matrices','A square matrix A is called orthogonal if',
    ['A\u1d40A = I','A\u00b2 = I','A\u1d40 = A','det A = 0'],0,
    'Orthogonal matrices satisfy A\u1d40A = AA\u1d40 = I, so A\u1d40 = A\u207b\u00b9.','medium')
add(c,0,'Eigenvalues','The sum of the eigenvalues of a square matrix equals its',
    ['trace','determinant','rank','order'],0,
    'The sum of eigenvalues equals the trace (sum of diagonal elements); the product equals the determinant.','medium')
add(c,1,'Differential Calculus','If y = e^{ax}, then the n-th derivative d\u207fy/dx\u207f is',
    ['a\u207f e^{ax}','a e^{ax}','n\u00b7e^{ax}','e^{ax}'],0,
    'Each differentiation multiplies by a, so the n-th derivative is a\u207f e^{ax}.','easy')
add(c,1,'Mean Value Theorem','Rolle\u2019s theorem requires the function to be continuous on [a,b], differentiable on (a,b) and',
    ['f(a) = f(b)','f(a) = 0','f(b) = 0','f\u2032(a) = 0'],0,
    'Rolle\u2019s theorem additionally needs equal end values f(a)=f(b) to guarantee f\u2032(c)=0.','medium')
add(c,2,'Partial Differentiation','A function f(x,y) is homogeneous of degree n if f(tx,ty) equals',
    ['t\u207f f(x,y)','t f(x,y)','f(x,y)/t\u207f','n\u00b7f(x,y)'],0,
    'By definition of homogeneity of degree n, f(tx,ty) = t\u207f f(x,y) (Euler\u2019s theorem).','medium')
add(c,2,'Maxima-Minima','For f(x,y), a point is a saddle point when rt \u2212 s\u00b2 is',
    ['negative','positive','zero','equal to one'],0,
    'With r=f_xx, t=f_yy, s=f_xy: rt\u2212s\u00b2<0 indicates a saddle point.','hard')
add(c,3,'Integration','The value of \u222b\u2080^{\u03c0/2} sin\u00b2x dx is',
    ['\u03c0/4','\u03c0/2','1','\u03c0'],0,
    '\u222b\u2080^{\u03c0/2} sin\u00b2x dx = \u03c0/4 by the standard reduction/Wallis formula.','medium')
add(c,3,'Beta-Gamma','The value of \u0393(1/2) is',
    ['\u221a\u03c0','\u03c0','1','\u221a\u03c0/2'],0,
    '\u0393(1/2) = \u221a\u03c0 is a standard result of the gamma function.','medium')
add(c,3,'Vector Calculus','The divergence of a vector field gives a',
    ['scalar','vector','tensor','matrix'],0,
    'div F = \u2207\u00b7F is a scalar; curl gives a vector.','easy')

# ---------------------------------------------------------------------------
# PROGRAMMING FOR PROBLEM SOLVING - C (100203)
# ---------------------------------------------------------------------------
c = '100203'
add(c,0,'Basics','Which of the following is NOT a valid C keyword?',
    ['function','return','static','continue'],0,
    '\u201cfunction\u201d is not a C keyword; return, static and continue are.','easy')
add(c,0,'Data types','The size of int in C is',
    ['compiler/architecture dependent','always 2 bytes','always 4 bytes','always 8 bytes'],0,
    'The C standard only fixes minimum sizes; int width depends on the compiler/architecture.','medium')
add(c,0,'Operators','The output of the expression 5/2 in C (integer division) is',
    ['2','2.5','3','2.0'],0,
    'Integer division truncates toward zero, so 5/2 = 2.','easy')
add(c,1,'Control flow','How many times does the loop `for(i=0;i<5;i++)` execute its body?',
    ['5','4','6','infinite'],0,
    'i runs 0,1,2,3,4 \u2014 five iterations before i<5 fails.','easy')
add(c,1,'Control flow','A `switch` statement without `break` in its cases leads to',
    ['fall-through to subsequent cases','a compile error','an infinite loop','only the first case running'],0,
    'Without break, control falls through and executes following cases too.','medium')
add(c,2,'Functions','In C, arguments are passed to functions by default using',
    ['call by value','call by reference','call by name','call by pointer'],0,
    'C passes arguments by value; reference semantics require passing pointers explicitly.','medium')
add(c,2,'Recursion','A recursive function must have a',
    ['base case to terminate','global variable','while loop','static array'],0,
    'Without a base case the recursion never stops, causing a stack overflow.','easy')
add(c,3,'Arrays & Pointers','For an array `a`, the expression `a[i]` is equivalent to',
    ['*(a + i)','*(a) + i','*(i)','a + i'],0,
    'Array indexing is pointer arithmetic: a[i] == *(a+i).','medium')
add(c,3,'Pointers','If p is a pointer to int, then p++ increases the address stored in p by',
    ['sizeof(int) bytes','1 byte','4 bits','0'],0,
    'Pointer arithmetic scales by the pointed-to type size, so p++ advances by sizeof(int).','hard')
add(c,3,'Strings','In C, a string is terminated by the character',
    ['\\0 (null character)','\\n','space','EOF'],0,
    'C strings are null-terminated; the \u2018\\0\u2019 marks the end.','easy')

# ---------------------------------------------------------------------------
# BASIC ELECTRICAL ENGINEERING (100212)
# ---------------------------------------------------------------------------
c = '100212'
add(c,0,'DC Circuits','Kirchhoff\u2019s current law (KCL) is based on the conservation of',
    ['charge','energy','momentum','mass'],0,
    'KCL (\u03a3I at a node = 0) expresses conservation of charge.','easy')
add(c,0,'DC Circuits','Kirchhoff\u2019s voltage law (KVL) is based on the conservation of',
    ['energy','charge','power','flux'],0,
    'KVL (\u03a3V around a loop = 0) expresses conservation of energy.','easy')
add(c,0,'DC Circuits','Three equal resistors R in parallel give an equivalent resistance of',
    ['R/3','3R','R','R\u00b2'],0,
    'For n equal resistors in parallel, R_eq = R/n = R/3.','easy')
add(c,1,'AC Fundamentals','The RMS value of a sinusoidal voltage of peak Vm is',
    ['Vm/\u221a2','Vm','Vm\u00b7\u221a2','2Vm/\u03c0'],0,
    'For a sine wave, V_rms = V_m/\u221a2 \u2248 0.707 V_m.','medium')
add(c,1,'AC Fundamentals','In a purely inductive AC circuit, the current',
    ['lags the voltage by 90\u00b0','leads the voltage by 90\u00b0','is in phase with voltage','lags by 45\u00b0'],0,
    'In a pure inductor current lags voltage by 90\u00b0 (ELI).','medium')
add(c,1,'AC Fundamentals','Power factor is defined as the cosine of the angle between',
    ['voltage and current','two currents','power and energy','resistance and reactance'],0,
    'Power factor = cos\u03c6, where \u03c6 is the phase angle between voltage and current.','easy')
add(c,2,'Transformers','A transformer works on the principle of',
    ['mutual induction','self induction only','electrostatic induction','the Hall effect'],0,
    'A transformer transfers energy between windings by mutual electromagnetic induction.','easy')
add(c,2,'Transformers','A transformer cannot operate on',
    ['DC supply','AC supply','50 Hz supply','sinusoidal supply'],0,
    'DC produces no changing flux, so no EMF is induced; transformers need AC.','medium')
add(c,3,'Machines','The direction of force on a current-carrying conductor in a magnetic field is given by',
    ['Fleming\u2019s left-hand rule','Fleming\u2019s right-hand rule','Lenz\u2019s law','Coulomb\u2019s law'],0,
    'Fleming\u2019s left-hand rule gives force direction (motor rule); right-hand is for generated EMF.','medium')
add(c,3,'Measurement','A moving-coil instrument can measure',
    ['DC only (directly)','AC only','both AC and DC directly','neither'],0,
    'PMMC (moving-coil) meters respond to average value and read DC directly; AC needs a rectifier.','hard')

# ---------------------------------------------------------------------------
# DATA STRUCTURES & ALGORITHMS (105302)
# ---------------------------------------------------------------------------
c = '105302'
add(c,0,'Complexity','The time complexity of binary search on a sorted array of n elements is',
    ['O(log n)','O(n)','O(n log n)','O(1)'],0,
    'Binary search halves the search space each step, giving O(log n).','easy')
add(c,0,'Complexity','Which sorting algorithm has the best worst-case time complexity?',
    ['Merge sort \u2014 O(n log n)','Bubble sort \u2014 O(n\u00b2)','Insertion sort \u2014 O(n\u00b2)','Selection sort \u2014 O(n\u00b2)'],0,
    'Merge sort guarantees O(n log n) in the worst case; the others are O(n\u00b2).','medium')
add(c,1,'Stack','A stack follows the order',
    ['LIFO (last in, first out)','FIFO (first in, first out)','random access','priority order'],0,
    'A stack is Last-In-First-Out; the most recently pushed element is popped first.','easy')
add(c,1,'Queue','Which data structure is most suitable for implementing a scheduler\u2019s ready list (first come first served)?',
    ['Queue','Stack','Binary tree','Graph'],0,
    'FCFS scheduling needs FIFO ordering, which a queue provides.','easy')
add(c,1,'Expression','Postfix (Reverse Polish) evaluation is typically done using a',
    ['stack','queue','heap','linked list'],0,
    'Operands are pushed and operators pop operands from a stack during postfix evaluation.','medium')
add(c,2,'Trees','An AVL tree imbalance of type LL is corrected by a',
    ['single right rotation','single left rotation','left-right rotation','right-left rotation'],0,
    'A left-left (LL) imbalance is fixed by a single right rotation about the unbalanced node.','hard')
add(c,2,'Trees','In a binary search tree, an in-order traversal visits the nodes in',
    ['ascending sorted order','descending order','level order','random order'],0,
    'In-order traversal of a BST yields keys in ascending sorted order.','medium')
add(c,2,'Trees','The maximum number of nodes in a binary tree of height h (root at height 0) is',
    ['2^(h+1) \u2212 1','2^h','2h','h\u00b2'],0,
    'A full binary tree of height h has 2^(h+1)\u22121 nodes.','medium')
add(c,3,'Graphs','Breadth-first search of a graph uses a',
    ['queue','stack','priority queue','tree'],0,
    'BFS explores level by level using a FIFO queue.','medium')
add(c,3,'Graphs','Dijkstra\u2019s shortest path algorithm fails when the graph has',
    ['negative edge weights','cycles','many vertices','undirected edges'],0,
    'Dijkstra assumes non-negative weights; negative edges break its greedy correctness (use Bellman-Ford).','hard')
add(c,3,'Hashing','Collision resolution by chaining stores colliding elements in',
    ['a linked list at the bucket','a separate array','the next empty slot','a stack'],0,
    'Separate chaining keeps a linked list of entries hashing to the same bucket.','medium')

# ---------------------------------------------------------------------------
# OPERATING SYSTEM (105305)
# ---------------------------------------------------------------------------
c = '105305'
add(c,0,'Basics','The primary purpose of an operating system is to',
    ['manage hardware resources and provide services to programs','compile source code','design circuits','host websites'],0,
    'An OS manages CPU, memory, I/O and files, and provides an interface/services to applications.','easy')
add(c,1,'Process','A process control block (PCB) does NOT contain',
    ['the source code of the compiler','the process state','program counter','CPU registers'],0,
    'The PCB stores process state, PC, registers, scheduling info \u2014 not the compiler\u2019s source code.','medium')
add(c,1,'Scheduling','Which scheduling algorithm can cause starvation of long processes?',
    ['Shortest Job First','First Come First Served','Round Robin','FIFO'],0,
    'SJF/priority scheduling can starve long (or low-priority) jobs if short jobs keep arriving.','medium')
add(c,1,'Scheduling','Round-robin scheduling is most characterised by its',
    ['time quantum','priority levels','job length estimate','deadline'],0,
    'Round robin allocates a fixed time quantum to each process cyclically.','easy')
add(c,2,'Synchronization','A deadlock cannot occur if we prevent',
    ['at least one of the four Coffman conditions','context switching','paging','multithreading'],0,
    'Breaking any one of mutual exclusion, hold-and-wait, no-preemption, or circular wait prevents deadlock.','hard')
add(c,2,'Synchronization','A semaphore that can take only values 0 and 1 is called a',
    ['binary semaphore','counting semaphore','monitor','mutex array'],0,
    'A binary semaphore is restricted to {0,1}; a counting semaphore may take any non-negative value.','medium')
add(c,3,'Memory','Which page replacement algorithm can suffer from Belady\u2019s anomaly?',
    ['FIFO','LRU','Optimal','MRU'],0,
    'FIFO can show Belady\u2019s anomaly (more frames \u2192 more faults); stack algorithms like LRU cannot.','hard')
add(c,3,'Memory','The technique that allows a process larger than physical memory to run is',
    ['virtual memory (paging/demand paging)','swapping only','compaction','segmentation only'],0,
    'Virtual memory with demand paging loads only needed pages, letting large processes run.','medium')
add(c,3,'Memory','Thrashing occurs when a system spends most of its time',
    ['paging/swapping instead of executing','executing user code','in idle state','compiling'],0,
    'Thrashing is excessive paging due to insufficient frames, so little useful work is done.','medium')

# ---------------------------------------------------------------------------
# COMPUTER NETWORKS (105406)
# ---------------------------------------------------------------------------
c = '105406'
add(c,0,'OSI Model','How many layers does the OSI reference model have?',
    ['7','5','4','8'],0,
    'The OSI model has 7 layers: physical, data link, network, transport, session, presentation, application.','easy')
add(c,0,'OSI Model','Routing of packets across networks is the responsibility of the',
    ['network layer','data link layer','transport layer','session layer'],0,
    'The network layer (e.g. IP) handles logical addressing and routing between networks.','medium')
add(c,0,'OSI Model','Reliable end-to-end delivery and flow control are provided by the',
    ['transport layer','network layer','physical layer','application layer'],0,
    'The transport layer (e.g. TCP) provides reliable, ordered, end-to-end delivery.','medium')
add(c,1,'TCP/IP','Which protocol is connection-oriented and reliable?',
    ['TCP','UDP','IP','ICMP'],0,
    'TCP is connection-oriented with acknowledgements and retransmission; UDP is connectionless.','easy')
add(c,1,'TCP/IP','The default subnet mask for a Class C IPv4 network is',
    ['255.255.255.0','255.255.0.0','255.0.0.0','255.255.255.255'],0,
    'Class C uses a 24-bit network portion: 255.255.255.0.','medium')
add(c,1,'TCP/IP','An IPv4 address is how many bits long?',
    ['32','64','128','16'],0,
    'IPv4 addresses are 32 bits; IPv6 addresses are 128 bits.','easy')
add(c,2,'Data Link','The CRC (cyclic redundancy check) is used for',
    ['error detection','encryption','routing','compression'],0,
    'CRC is an error-detection code appended by the data link layer.','medium')
add(c,2,'Data Link','Which access method is used by classic Ethernet?',
    ['CSMA/CD','CSMA/CA','Token passing','Polling'],0,
    'Classic (shared) Ethernet uses CSMA/CD; Wi-Fi uses CSMA/CA.','medium')
add(c,3,'Application','DNS primarily translates',
    ['domain names to IP addresses','IP to MAC addresses','ports to sockets','URLs to ports'],0,
    'DNS resolves human-readable domain names into IP addresses.','easy')
add(c,3,'Application','Which protocol is used to send email between mail servers?',
    ['SMTP','HTTP','FTP','SNMP'],0,
    'SMTP (Simple Mail Transfer Protocol) transfers email; POP/IMAP retrieve it.','easy')

# ---------------------------------------------------------------------------
# DBMS (119601)
# ---------------------------------------------------------------------------
c = '119601'
add(c,0,'Basics','A collection of logically related data and a set of programs to access it is called a',
    ['database management system','spreadsheet','compiler','file system'],0,
    'A DBMS is software managing a database plus access programs.','easy')
add(c,0,'Model','In the relational model, a row of a table is formally called a',
    ['tuple','attribute','domain','schema'],0,
    'A row is a tuple; a column is an attribute; the set of allowed values is the domain.','easy')
add(c,1,'Keys','A candidate key that is chosen to uniquely identify tuples is the',
    ['primary key','foreign key','super key','secondary key'],0,
    'The primary key is the selected candidate key; a foreign key references another relation\u2019s key.','medium')
add(c,1,'Keys','A foreign key in a relation refers to the',
    ['primary key of another (or same) relation','a non-key attribute','an index','a view'],0,
    'A foreign key enforces referential integrity by referencing a primary key.','medium')
add(c,2,'Normalization','A relation is in 1NF if all its attributes are',
    ['atomic (indivisible)','functionally dependent','candidate keys','indexed'],0,
    'First normal form requires atomic, single-valued attributes (no repeating groups).','medium')
add(c,2,'Normalization','Which normal form removes transitive dependency on the primary key?',
    ['3NF','1NF','2NF','BCNF'],0,
    'Third normal form eliminates transitive dependencies of non-key attributes on the key.','hard')
add(c,2,'Normalization','2NF removes',
    ['partial dependency on a composite key','transitive dependency','multivalued dependency','join dependency'],0,
    'Second normal form removes partial dependencies (non-key attributes depending on part of a composite key).','hard')
add(c,3,'SQL','Which SQL clause is used to filter rows before grouping?',
    ['WHERE','HAVING','GROUP BY','ORDER BY'],0,
    'WHERE filters rows before aggregation; HAVING filters groups after GROUP BY.','medium')
add(c,3,'SQL','The SQL command to remove a table structure and its data completely is',
    ['DROP TABLE','DELETE','TRUNCATE','ALTER'],0,
    'DROP TABLE removes the table definition and data; DELETE/TRUNCATE remove only rows.','medium')
add(c,3,'Transactions','The property ensuring a transaction is all-or-nothing is',
    ['atomicity','consistency','isolation','durability'],0,
    'Atomicity (the A in ACID) guarantees a transaction executes fully or not at all.','medium')

# ---------------------------------------------------------------------------
# Build quiz metadata: one quiz per (subject, unit) + one mixed per subject
# ---------------------------------------------------------------------------
quizzes = []
UNIT_NAMES = {}  # optional named units; else "Unit N"
by_subject = {}
for q in Q:
    by_subject.setdefault(q['subject_code'], {}).setdefault(q['unit_index'], []).append(q)

for code, (name, branch, sem) in SUBJECTS.items():
    units = by_subject.get(code, {})
    # per-unit quizzes
    for ui in sorted(units):
        qs = units[ui]
        # representative topic label from the unit
        topic_label = qs[0]['topic']
        pick = min(len(qs), max(6, min(12, len(qs))))
        quizzes.append({
            'id': f'quiz_{code}_u{ui}',
            'title': f'{name} \u2014 Unit {ui+1}: {topic_label}',
            'subject_code': code,
            'subject_name': name,
            'branch_id': branch,
            'semester': sem,
            'unit_index': ui,
            'type': 'practice',
            'difficulty': 'medium',
            'question_ids': [q['id'] for q in qs],
            'pick_count': pick,
            'duration_sec': pick * 60,
            'negative_marking': 0,
            'marks_per_question': 1,
            'verified': True,
            'official': True,
        })
    # mixed subject revision
    all_ids = [q['id'] for q in Q if q['subject_code'] == code]
    if len(all_ids) >= 8:
        pick = min(15, len(all_ids))
        quizzes.append({
            'id': f'quiz_{code}_mixed',
            'title': f'{name} \u2014 Full Subject Revision',
            'subject_code': code,
            'subject_name': name,
            'branch_id': branch,
            'semester': sem,
            'unit_index': None,
            'type': 'mixed',
            'difficulty': 'medium',
            'question_ids': all_ids,
            'pick_count': pick,
            'duration_sec': pick * 75,
            'negative_marking': 0.25,
            'marks_per_question': 1,
            'verified': True,
            'official': True,
        })

# ---------------------------------------------------------------------------
# Deterministically shuffle option order so the correct answer is spread across
# A/B/C/D (authored with correct answer first for readability; §4 rule #3).
# ---------------------------------------------------------------------------
rng = random.Random(20260901)
for q in Q:
    if q['type'] == 'truefalse':
        continue
    order = list(range(len(q['options'])))
    rng.shuffle(order)
    q['options'] = [q['options'][i] for i in order]
    if q['type'] == 'single':
        q['correct_index'] = order.index(q['correct_index'])
    elif q['type'] == 'multi':
        q['correct_indices'] = sorted(order.index(i) for i in q['correct_indices'])

json.dump(Q, open(os.path.join(OUT, 'seed_quiz_questions.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(quizzes, open(os.path.join(OUT, 'seed_quiz_meta.json'), 'w'), ensure_ascii=False, indent=0)
print(f'questions: {len(Q)}  quizzes: {len(quizzes)}')
# sanity: correct index in range, spread
from collections import Counter
spread = Counter(q.get('correct_index') for q in Q if q['type']=='single')
print('correct-index spread:', dict(spread))
bad = [q['id'] for q in Q if q['type']=='single' and not (0 <= q['correct_index'] < len(q['options']))]
print('out-of-range:', bad)
