# Job Search Sucks — Master Context File
# Read this first. Do not write any code until you confirm understanding.
# Last updated: Session 4 — April 26, 2026

---

## 1. What This Project Is

**Product name: Job Search Sucks**
**Domain: jobsearchsucks.ai**

A web application that makes resume building faster, smarter, and in the user's own voice — not AI voice. Built by **Soumya Singh**. Started as a personal tool, being built into a product others can use (invite-only for now).

Core idea: user uploads their vault of resumes, LinkedIn, and their "Holy Grail" rules document. They paste a job description. The app screens the JD, picks the best resume from their vault, tailors it to the JD without sounding like AI, checks ATS, and builds a ready-to-submit resume — in minutes, not hours.

**Owner:** Soumya Singh | soumya3436@gmail.com | linkedin.com/in/soumya-ssingh
**Portfolio:** ssingh14-12.github.io/soumyasingh.PMBA.io
**Phone:** (737) 484-7648 | Austin, TX | Open to Relocate

---

## 2. Documents Read (Session 3)

| Document | Location | Status |
|---|---|---|
| Holy Grail (§1–§14 + LaTeX templates) | `.claude/docs/holy_grail.md.docx` | ✅ Read fully |
| LinkedIn Profile | `.claude/docs/linkedin_profile.pdf.pdf` | ✅ Read fully |
| Resume: Business OPS Analyst | `.claude/docs/resumes/` | ✅ Exists |
| Resume: TPM - A | `.claude/docs/resumes/` | ✅ Exists |
| Resume: Business and BI Analyst | `.claude/docs/resumes/` | ✅ Exists |
| Resume: Cloud PM | `.claude/docs/resumes/` | ✅ Exists |
| Resume: Implementation Consultant | `.claude/docs/resumes/` | ✅ Exists |
| Resume: Product Analyst | `.claude/docs/resumes/` | ✅ Exists |
| Resume: Retail BA | `.claude/docs/resumes/` | ✅ Exists |
| Resume: Amazon BA WFM | `.claude/docs/resumes/` | ✅ Exists |
| Resume: Applied Materials Technical PM | `.claude/docs/resumes/` | ✅ Exists |
| Resume: BIPM | `.claude/docs/resumes/` | ✅ Exists |
| Resume: BizOps Manager | `.claude/docs/resumes/` | ✅ Exists |
| Resume: Cisco Project Manager | `.claude/docs/resumes/` | ✅ Exists |
| Resume: Cotiviti PM v3 | `.claude/docs/resumes/` | ✅ Exists |
| Resume: FOCUS Business Analyst | `.claude/docs/resumes/` | ✅ Exists |
| LinkedIn outreach examples | Not uploaded yet | ⏳ Pending |

---

## 3. 🚩 CLASHES FOUND — Soumya needs to answer these

**Clash #1 — LaTeX vs Word ✅ RESOLVED**
- Word .docx is the default output. LaTeX was Soumya's previous format — switched to Word due to ATS scanning and auto-fill issues with portals.
- Users can choose either. Soumya is on Word now.
- All Holy Grail content rules (§3–§9) still apply fully — only the output format changes.
- The format selector in the UI offers: Word (default) | PDF | LaTeX PDF (optional).

**Clash #2 — Email ✅ RESOLVED**
- Correct email: soumya3436@gmail.com — always use this on resume header.

**Clash #3 — Bullet length rule ✅ RESOLVED**
- "35 Characters" was a typo in the Holy Grail doc.
- Correct rule: **max 2 lines, ~40 words per bullet**. Enforce this in the bullet validator and resume builder.

**Addition — LinkedIn certifications not in Holy Grail §12**
- LinkedIn shows: Workato Foundations Level 2, AI for Product Management, User Experience Super Badge, Data Visualization in Tableau
- Holy Grail §12 only lists: PMP, CSPO, AZ-900
- **Should these additional certs be in the app's cert pool?** They show up in LinkedIn but aren't currently in the Holy Grail rules.

---

## 4. Current Phase

**Phase 1 — Local development, no auth, core features**

### Built (as of Session 4):
- Flask backend at `localhost:5000`
- 3 pages with dark UI (vanilla HTML — being migrated to React):
  - `/screener` — Job Fit Screener
  - `/rewriter` — Bullet Rewriter
  - `/ats` — Being REPLACED by LinkedIn Outreach page
- React + Vite scaffolded at `/ui` (localhost:5173)
- Flow diagrams at `/flow` and `/flow/v2`
- **Python environment fully set up:**
  - `venv/` — isolated Python environment (never use system Python)
  - `flask-cors` — installed + wired into `app/__init__.py` so React can talk to Flask
  - `requirements.txt` — full snapshot of every package installed (recreate env with `pip install -r requirements.txt`)
  - `.env` — secrets file with 5 keys: ANTHROPIC_API_KEY, FLASK_SECRET_KEY, YOUR_EMAIL, FIREBASE_API_KEY (empty slot), HUNTER_API_KEY (empty slot)
  - `.gitignore` — created at project root; `.env` is protected, never commits to Git

### Not yet built:
- React structure (JDContext, Nav, JDBar, 4 page components) — **THIS IS NEXT**
- react-router-dom + axios installed in /ui — **NEXT STEP**
- Flask routes converted to return JSON (currently returning HTML templates)
- Vault upload system
- Chatbot on screener
- Resume Builder page
- LinkedIn Outreach page (BLOCKED — need message examples from Soumya)
- JD shared via React Context
- Firebase Auth (Phase 2)
- Admin portal (Phase 2)

---

## 5. Tech Stack — ALL DECISIONS LOCKED

| Layer | Choice |
|---|---|
| Backend | Flask (Python) — API mode, JSON only |
| Frontend | React + Vite — in `/ui` folder |
| JD sharing | React Context (global state) |
| Auth | Firebase — Phase 2, skip now |
| Admin portal | Live version (active users, page tracking) — Phase 2 |
| Email finding | Hunter.io (free 25/mo) |
| Resume output | Word .docx default, LaTeX PDF optional |
| Hosting | Local through Phase 1 + 2 → jobsearchsucks.ai in production |

---

## 6. The 4 Pages

```
Screener (hub)  →  Resume Builder  →  Bullet Rewriter  →  LinkedIn Outreach
```

### Page 1: Job Screener (Hub)
1. Paste JD → stored in React Context, auto-extracts company + role + posting date
2. Upload vault (resumes, LinkedIn PDF, Holy Grail, writing context)
3. Claude analyzes JD vs vault using Holy Grail rules — step-by-step reveal (300ms stagger):
   - GO / NO GO (animated, big, green pulse or red)
   - Match score (ring animates from 0)
   - Visa check (OPT/H1B — §7 rules)
   - Closest resume from vault + job family (§13)
   - Strong / Medium / Weak breakdown (§5, §6, §8)
   - Red flags (§9)
   - ATS keyword match (§9)
   - Seniority check (YOE required vs shown)
   - Job posting date (flag if older than 30 days)
4. Chatbot below results — context-aware, quick reply chips
   - Score 8+: Quick Build button
   - Score 6–7: chatbot first, close gaps
   - Score <5: NO GO explanation
5. "Build My Resume →" carries full context to Resume Builder

### Page 2: Resume Builder
1. All context auto-loaded (JD + vault match + chatbot answers + Holy Grail)
2. Assembly:
   - Bullets from Experience Bank in user's voice, metrics preserved (§4 — NEVER remove)
   - Skills: only relevant to this JD (§11 templates)
   - Projects: 1–2 most relevant from §10 (McKinsey / Risk Model / GTM)
   - Certifications: JD-aligned from §12 pool
   - 1 page hard limit (§2) — trims from Zoho/Bindal first, never from Accenture (§5)
   - Holy Grail rules applied: no banned words (§3A), XYZ bullets (§3B), metrics locked (§4)
3. Side-by-side: old (left) vs new (right), changes highlighted
4. Before → After ATS score ("62 → 88")
5. Plain-language explanation of score
6. Download: Word .docx (default) or PDF

### Page 3: Bullet Rewriter
- JD from React Context (no re-paste)
- Small paste area shown only if no JD in context
- 3–5 rewrites in user's voice, tailored to JD, Holy Grail rules applied
- One-click copy with "Copied!" feedback

### Page 4: LinkedIn Outreach (replaces ATS page)
- JD from session OR paste fresh JD on this page
- Suggests who to target: hiring manager, HR, peer, senior leader
- Per person: LinkedIn search string + connection request + follow-up + cold email
- User's outreach voice baked in from uploaded message examples
- Hunter.io for email finding
- User copies + sends manually (no automation)
- **⚠️ BLOCKED: Soumya needs to drop real LinkedIn message examples**

---

## 7. Holy Grail — The Rules Engine (from actual document)

### §1 — Process (12 steps, always follow in order)
1. Receive JD
2. H1B/Visa check (myvisajobs.com)
3. Role classification (job family)
4. Base version selection (which of §13 master versions)
5. Match rating (/10)
6. Gap analysis (top 5 gaps)
7. Suggested bullets from real experience only (§6)
8. Ask questions — never guess
9. Red flags (ATS risks, tone, gaps)
10. WAIT — do not write resume until user approves
11. Write resume (LaTeX/Word)
12. Final score (/10)

### §2 — Format Rules (NEVER change)
- **Section order:** Header → Education → Experience → Leadership Programs & Projects → Skills → Certifications
- **No professional summary** — go straight from Header to Education
- 1 page strictly, no exceptions
- No em dashes, no underscores, no special characters
- No tables, no text boxes, ATS-safe
- **Header always:** Soumya Singh - PMP, CSPO | Austin, TX | Open to Relocate | (737) 484-7648

### §3A — Banned Words (NEVER use)
Em dashes, spearheaded, leveraged, utilized, streamlined, synergized, robust, dynamic, cutting-edge, innovative, passionate, driven, results-oriented, detail-oriented, proactive, seamless, genuinely, honestly, straightforward, holistically, impactful, managed, coordinated (generic)

### §3B — Bullet Style
- XYZ formula: Accomplished X, as measured by Y, by doing Z
- Business outcome first, technical detail second
- Each bullet: 1 main idea, min 1 line, max 2 lines
- No "I" — first person implied
- Strong action verbs only (not managed/coordinated)

### §3C — McKinsey Bullet (FIXED — never change)
"Applied McKinsey's problem-solving frameworks, including issue trees and hypothesis-driven analysis, to real business cases, building skills in data-driven decision-making, executive communication, and stakeholder influence."

### §4 — Master Metrics (NEVER remove from ANY version)
| Company | Metric |
|---|---|
| Saayam | 3+ workstreams, 90% on-time, 20+ defects resolved |
| UT Austin | 42% rework reduction, 40% on-time improvement, 20% less manual reporting, 6,000+ records, 500+ metadata records |
| Accenture | 11+ releases, 3 teams, 30% deployment reliability, 4 hrs/week saved, 25% launch issues, 43% repeat escalations, 10 defect patterns, 32% defect reduction, 50+ stakeholders |
| Zoho | 13% time-to-resolution, 1,000+ cases, 20% retention |
| Bindal | 1,000+ SKUs, 3,000+ orders/month, 17% dispatch, 15% inventory |

### §5 — Bullet Counts by Role
- Saayam: 2 bullets
- UT Austin: 2–3 bullets
- Accenture: 4–6 bullets (NEVER over-cut here)
- Zoho: 1–2 bullets (up to 3 if JD is SaaS/CRM/presales)
- Bindal: 2–3 bullets (flex 1–3 based on JD)
- When space is tight: shorten wording first, then trim Zoho/Bindal. Never cut Accenture.

### §6 — Confirmed Experience Bank (USE FREELY — never invent beyond this)
**Accenture (Dec 2021 – Oct 2023):**
NCR Voyix retail (C#, .NET), Salesforce Health Cloud, Workday HCM, SAP ERP, SAP Analytics Cloud, Snowflake EDW (SQL), REST API (Postman), Azure cloud migration, CI/CD (Azure DevOps, Git), Power BI (front+back end), BRD/FRD (11+ releases), UML/process flows (Visio), UAT planning + execution, ETL pipeline documentation, SharePoint, KPI definition

**UT Austin Libraries (Jan 2025 – Dec 2025):**
Smartsheet PM Command Center, Tableau dashboards, TA for Computer Audit & System Security (SOC 2, ISO 27001, HIPAA, PCI-DSS), HubSpot CRM, DAMS metadata governance (6,000+ records), XML→JSON data mapping (500+ records)

**Saayam For All (Mar 2026 – Present):**
Roadmap + release planning, product backlog (writes + prioritizes), backlog refinement, Agile ceremonies, executive status updates, marketing/comms coordination, cloud-native application environment

**Zoho Corporation (Sep–Nov 2021):**
Presales demos, CRM/sales-facing product, requirements gathering (50+ stakeholders), BRD/FRD for Zoho Expense, UAT + defect coordination
Note: Permanent role left after 3 months — address if asked directly

**Bindal Group (Sep 2020 – Sep 2021):**
RFQ/RFP, vendor negotiations, PO management, budget tracking, retail e-commerce (1,000+ SKUs, 3,000+ orders/month), inventory cost tracking

### §7 — Visa Rules
- Skip immediately: explicit no-sponsorship language in JD
- Flag: no sponsorship history on myvisajobs.com
- Flag OPT concern: contract roles (DSO verification needed)
- Flag: staffing agency roles (rarely support H1B)
- Real H1B deadline: October 2026 (lottery timing)

### §8 — Keyword & JD Tailoring
- Identify top missing keywords before writing anything
- Gap bridge using §6 only — never invent
- Integrate keywords naturally (never dump them)
- Tailor Skills section explicitly per JD

### §9 — ATS & Red Flag Checks
- Standard headings only: Education, Experience, Skills, Certifications
- All §4 metrics present
- No AI-written tone
- All JD core keywords appear in context
- No ATS mis-parsing risk (no tables, columns, headers/footers)

### §10 — Projects (swap in/out based on JD)
- **Option A: McKinsey Forward** — use when JD values leadership, strategy, stakeholder influence
- **Option B: Risk-Adjusted Decision Modeling** — use when JD values data analysis, financial modeling
- **Option C: Go-to-Market Strategy (3D Bike)** — use when JD values market analysis, product strategy

### §11 — Skills Templates by Role Family
- **BA/Systems/Data/PO/PM:** Business Analysis + Agile & Delivery + Data & Platforms + Tools
- **PM/Program/TPM:** Program Management + Agile/Scrum + Technical + Tools + Methodologies
- **BizOps/Ops/Strategy:** Program & Operations + Analysis & Reporting + Tools & Systems
- **SaaS Implementation:** Implementation + Business Analysis + Domain + Tools

### §12 — Certifications Pool
- PMP, PMI — Oct 2025 (always include)
- CSPO, Scrum Alliance — June 2025 (always include)
- AZ-900, Microsoft — June 2023 (include for technical/cloud roles)
- Workato Foundations Level 2 (from LinkedIn — not yet in Holy Grail, awaiting confirmation)
- AI for Product Management (from LinkedIn — awaiting confirmation)

### §13 — Five Master Resume Versions
| Version | Tagline | Use For |
|---|---|---|
| V1: BA / Data & Systems | Business Analyst \| Data & Systems Analysis \| Cloud & Enterprise Delivery | BA, Systems Analyst, IT BA, Data Analyst |
| V2: ERP PM / SaaS Impl | ERP Project Manager \| Agile/Scrum Delivery \| Cross-Functional Leadership \| SaaS Implementation | Implementation Specialist, ERP PM, SaaS PM |
| V3: Technical PM | Technical Program Manager \| Cross-Functional Delivery \| Cost, Schedule & Quality | TPM, IT PM, Technical PM, Engineering PM |
| V4: BizOps / Strategy | Business Operations \| Program Execution \| Cross-Functional Alignment \| Sales Programs | BizOps Analyst, Strategy & Ops, Program Analyst |
| V5: BA / Salesforce & AI | Business Analyst \| Data & Systems Analysis \| Salesforce & AI-Enabled Platforms | BA roles at Salesforce shops, CRM-heavy, AI-forward |

### §14 — Role Priority Order
1. Business Operations Analyst / BizOps Analyst
2. Business Systems Analyst / IT Business Analyst
3. Technical Project Manager / IT Project Manager
4. Product Owner / Product Manager
5. Implementation Specialist / SaaS Implementation Manager
6. Operations Analyst / Strategy and Operations
7. Project Coordinator / Program Analyst
8. Scrum Master / Agile Delivery Manager
9. Solutions Analyst / some Product roles (lower priority)

---

## 8. Soumya's LinkedIn Profile Summary (from actual document)

**Current title:** PM | Business Analyst | Business Process Engineer | SaaS Product & ERP Delivery | Agile | Power BI, C#, SQL | Ex-Accenture | CS + UT MEM

**Experience timeline:**
- Saayam For All: PM/BA — Mar 2026–Present
- UT Austin Libraries: Graduate PM — Jan 2025–Jan 2026
- UT Austin: Teaching Assistant — Aug–Dec 2024
- McKinsey Forward: Oct–Dec 2025
- Accenture: BA/PM — Dec 2021–Oct 2023 (Project Analyst Trainee Oct–Dec 2021)
- Zoho: BA Customer Success — Sep–Nov 2021
- Bindal Group: Operations Analyst — Sep 2020–Sep 2021

**Additional LinkedIn certifications (not in Holy Grail):**
- Workato Foundations Level 2
- AI for Product Management
- User Experience Super Badge
- Data Visualization in Tableau: Create Dashboards and Stories

---

## 9. Design System

```
--bg:      #07070F    (page background)
--surface: #11111C    (cards)
--border:  #1E1E30    (card borders)
--accent:  #00C8E0    (cyan — primary CTA)
--text:    #EEEEF5    (body text)
--muted:   #5A5A78    (labels, secondary)
--go:      #10B981    (green — GO, success)
--nogo:    #EF4444    (red — NO GO, danger)
--warn:    #F59E0B    (amber — warnings)

Fonts: Inter (body) + Syne (brand/headings)
```

---

## 10. Session History

| Session | Date | What Happened |
|---|---|---|
| 1 | Apr 21, 2026 | Project created. 6 features defined. Holy Grail established. |
| 2 | Apr 26, 2026 | Full product redesign. ATS integrated everywhere. 4-page structure. Firebase Auth selected. JD sharing via React Context. LinkedIn Outreach replaces ATS page. Feasibility analysis done. |
| 3 | Apr 26, 2026 | UI redesigned (dark theme, animations, score ring). Flask confirmed. React confirmed. Node.js installed. React + Vite scaffolded at /ui. Documents read. CLAUDE.md created with real content. 3 clashes flagged and resolved. |
| 4 | Apr 26, 2026 | Python environment completed end-to-end. flask-cors installed and wired. requirements.txt created. .env updated with all 5 key slots. .gitignore created at project root — .env protected. CLAUDE.md updated and committed to Git. |

---

## 11. Next Session — Start Here

**Read CLAUDE.md first (this file). All 3 clashes are already resolved. Environment is done.**

### Step 1 — Verify environment is working
```bash
# Activate Python environment
venv\Scripts\activate       # Windows
# Should see (venv) in terminal

node -v                     # Should print v24.x.x
npm -v                      # Should print 11.x.x
```

### Step 2 — Install React dependencies
```bash
cd ui
npm install react-router-dom axios
```
- `react-router-dom` — lets React switch between pages (Screener / Resume Builder / etc.) without reloading
- `axios` — makes API calls from React to Flask cleaner than raw fetch()

### Step 3 — Build React structure (in this exact order)
```
ui/src/
  context/
    JDContext.jsx       ← global JD state, shared across all pages
  components/
    Nav.jsx             ← top navigation bar
    JDBar.jsx           ← collapsed JD strip shown on every page
  pages/
    Screener.jsx        ← Page 1 (hub)
    ResumeBuilder.jsx   ← Page 2
    BulletRewriter.jsx  ← Page 3
    LinkedInOutreach.jsx← Page 4 (BLOCKED until message examples)
  App.jsx               ← wire up router + JDContext wrapper
```

### Step 4 — Convert Flask routes to JSON
Each Flask route currently returns an HTML template. Convert them to return `jsonify({...})` instead.
Flask becomes the API brain. React becomes the face.

### Do NOT build LinkedIn Outreach page until Soumya drops real message examples.

---

## 12. Open Items

- [x] **Clash #1** — ✅ Word default. LaTeX available as option. All Holy Grail content rules still apply.
- [x] **Clash #2** — ✅ soumya3436@gmail.com is correct.
- [x] **Clash #3** — ✅ Max 2 lines, ~40 words per bullet.
- [x] **Environment** — ✅ venv, flask-cors, requirements.txt, .env, .gitignore all done.
- [ ] **Addition** — Workato/AI PM/UX certs from LinkedIn — add to §12? (ask Soumya — quick yes/no)
- [ ] **BLOCKED** — LinkedIn outreach message examples (Soumya drops next session — DO NOT build page 4 without these)
- [ ] Add your real ANTHROPIC_API_KEY into `.env` (replace `your_actual_key_here`)
- [ ] MASTER_TEMPLATE.js to be wired into Resume Builder
- [ ] Decide: WeasyPrint or Playwright for PDF generation
- [ ] react-router-dom + axios install in /ui (next immediate step)

---

## How to Restore Context in a New Session

Send this as your FIRST message, nothing else:

```
Read CLAUDE.md in the project root. Then read every file in the 
.claude/docs/ folder: holy_grail.md.docx, linkedin_profile.pdf.pdf, 
and all resume PDFs in .claude/docs/resumes/.

Do not write any code yet. When done, confirm:
1. What this project is
2. What phase we are in
3. What the current task is
4. List every document you read
5. State the 5 most important Holy Grail rules that affect resume content
6. List the 3 open clashes that need Soumya's answer
```
