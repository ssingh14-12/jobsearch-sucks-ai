import anthropic
import os
import json
import re

# This is Soumya's profile — the brain behind every analysis
SOUMYA_PROFILE = """
You are analyzing job descriptions for Soumya Singh:

CONTACT: soumya3436@gmail.com | (737) 484-7648 | linkedin.com/in/soumya-ssingh | Austin, TX | Open to Relocate
VISA: F-1 STEM OPT — no sponsorship needed until Oct 2026 H1B lottery deadline.

EDUCATION:
- MS Engineering Management, UT Austin / Cockrell School of Engineering, Dec 2025
- B.Tech Computer Science & Engineering, Alliance University, Aug 2020

CERTIFICATIONS:
- Project Management Professional (PMP) — PMI, Oct 2025
- Certified Scrum Product Owner (CSPO) — Scrum Alliance, June 2025
- Microsoft Certified: Azure Fundamentals (AZ-900) — Microsoft, June 2023
- Associate Systems Engineering Professional (ASEP) — INCOSE, Aug 2025

EXPERIENCE (use these REAL metrics — never invent numbers):
Saayam For All (Mar 2026–Present):
  - 3+ concurrent workstreams, 90% on-time milestone delivery
  - 20+ defects tracked to resolution with engineering teams
  - Cloud-native app; Agile ceremonies, RAID logs, milestone schedules, OKR alignment
  - SQL + Google Analytics for feature adoption tracking; 4 hrs/week reporting saved

UT Austin Libraries (Jan–Dec 2025):
  - Built Smartsheet PM Command Center; 42% rework reduction; 40% on-time improvement; 20% manual reporting reduction
  - 6,000+ digital map/catalog records standardized (metadata, data mapping, ingestion)
  - 500+ metadata records mapped for digital catalog migration
  - Applied SOC 2, ISO 27001, HIPAA, PCI-DSS governance frameworks
  - Delivered weekly structured status reports saving 3–5 hrs/week for leadership

Accenture (Dec 2021–Oct 2023):
  - 11+ enterprise product/SaaS releases across SAP, Salesforce, Workday, Azure-hosted systems
  - 50+ business and technical stakeholders managed across onshore/offshore teams (US + India)
  - 43% repeat escalation reduction via RCA and documented runbooks (10 high-impact defect patterns)
  - 32% post-release defect reduction
  - 30% deployment reliability improvement via release governance in Azure DevOps (code freezes, hotfix flows, CI/CD)
  - 25% launch-day issue reduction; 4 hrs/week coordination saved
  - Power BI dashboards for VP-level stakeholders; OKR/velocity/defect trend reporting
  - BRD/FRD authoring; UML/process flows; data mapping; UAT scripts; SAFe-aligned delivery

Zoho Corporation (Sep–Nov 2021):
  - 13% time-to-resolution improvement for Zoho Expense enterprise cases
  - 20% customer retention improvement
  - 1,000+ enterprise cases analyzed; patterns converted to user stories and acceptance criteria
  - Client workshops, SaaS configuration, Zoho Expense implementations

Bindal Group of Companies (Sep 2020–Sep/Aug 2021):
  - 1,000+ SKUs, 3,000+ orders/month across Amazon, Flipkart, Myntra
  - 17% on-time dispatch improvement; 15% inventory accuracy improvement
  - Weekly KPI tracking for inventory, fulfillment, customer issues

PROJECTS & LEADERSHIP:
- McKinsey Forward Program (Oct–Dec 2025): Invite-only global leadership program; structured problem-solving, stakeholder management, hypothesis-driven analysis
- Risk-Adjusted Decision Modeling (Dec 2024): Decision trees + NPV analysis, 19% better projected ROI scenario, executive-style briefing
- Integration Control Center (Mar 2026): End-to-end data pipeline on Olist dataset — PostgreSQL, Apache NiFi, Tableau; BRD, FRD, OpenAPI specs, SQL data model, UAT pack
- Job Search AI Platform (Apr 2026): Gen AI platform in Python/FastAPI using Claude API for SDLC automation; PLM enablement, process automation
- Go-to-Market Strategy — 3D-Printed Carbon Fiber Bike (UT Austin, 2024): Simulation-based GTM across 4 global regions; target segments, positioning, pricing tiers with financial modeling

SKILLS (core across all versions):
Business Analysis: BRD/FRD, UML, User Stories, Acceptance Criteria, UAT, Process Mapping, Gap Analysis, Data Mapping
Data & BI: SQL, Power BI, Tableau, Excel (advanced), Google Analytics, Snowflake EDW, ETL, KPI definition
Project & Delivery: Jira, Jira Align, Azure DevOps, Confluence, Smartsheet, MS Project, Miro, Agile/Scrum, SAFe, Kanban, Waterfall, SDLC, RAID, CI/CD
Enterprise Systems: SAP ERP, Salesforce CRM, Workday, Azure, ServiceNow
Cloud & Compliance: Azure Cloud Migration, Lift and Shift, SOC 2, ISO 27001, HIPAA, PCI-DSS, AZ-900
AI Tools: Claude API, Microsoft Copilot, ChatGPT, GitHub Copilot, Mixpanel (familiar)

REAL RESUME VERSIONS IN THE VAULT:
V1: Business & BI Analyst — for BA, BI Analyst, Data Analyst, Systems Analyst roles
  Tagline: "Business & BI Analyst | Power BI & Excel Dashboards | Data & Systems Analysis"
  Key angle: Data mapping, requirements gathering, UML/process flows, Power BI dashboards, data quality, BI reporting
  UT Austin title: Data and Operations Analyst
  Accenture title: Business Analyst
  Zoho title: Business Analyst – Presales & Onboarding

V2: Business Operations Analyst — for BizOps Analyst, Operations Analyst, Strategy & Ops roles
  Tagline: "Business Operations | Program Execution | Cross-Functional Alignment | Sales Programs"
  Key angle: SOPs, process controls, data reconciliation, QA checks, exception tracking, quota/performance reporting
  UT Austin title: Project Manager (DAMS platform)
  Accenture title: Business Operations Analyst
  Zoho title: Customer Success Analyst – Zoho Expense
  Extra cert: ASEP (INCOSE)

V3: SaaS Implementation Consultant — for Implementation Consultant, Solutions Consultant, SaaS PM roles
  Tagline: "SaaS Implementation Consultant | Client Workshops, Configuration & Change Management"
  Key angle: Discovery workshops, SaaS configuration, go-live readiness, change management, training & knowledge transfer
  UT Austin title: SaaS Implementation Consultant (Library Systems)
  Accenture title: SaaS Product Implementation & Business Analyst
  Zoho title: Implementation Consultant – Zoho Expense

V4: Technical Program Manager — for TPM, IT PM, Engineering PM, SAFe Agile PM roles
  Tagline: "Technical Program Manager | SAFe Agile Delivery | Program Governance & OKR Execution"
  Key angle: SAFe delivery, OKR alignment, RAID logs, quarterly execution planning, program financials, PI Planning
  UT Austin title: Technical Program Manager
  Accenture title: Technical Program Manager
  Extra cert: AZ-900; Extra projects: Integration Control Center, Job Search AI Platform

V5: Product Analyst — for Product Analyst, Product Ops, Feature Analyst, Growth Analyst roles
  Tagline: "Technology Product Analyst | Feature Adoption | KPIs & Insights"
  Key angle: Build-measure-learn, SQL for feature adoption, A/B testing, KPI definition, product lifecycle management
  Saayam title: Product Analyst
  UT Austin title: Project Analyst
  Accenture title: Business Analyst / Project Manager

V6: Cloud Project Manager — for Cloud PM, IT PM, DevOps PM, Azure PM, Infrastructure PM roles
  Tagline: "Cloud Project Manager | Azure & Cloud Migration Delivery | Agile & Cross-Functional Teams"
  Key angle: Azure migration, Lift & Shift, CI/CD governance, SOC 2 compliance, release governance, cloud security
  UT Austin title: Technical Project Manager
  Accenture title: Business Analyst (Azure migration framing)
  Extra cert: AZ-900; Extra project: Go-to-Market Strategy (3D-Printed Bike)

V7: Scrum Master — for Scrum Master, Agile Coach, RTE, Delivery Lead roles
  Tagline: "Scrum Master | Agile Delivery | Data & Analytics Teams"
  Key angle: SAFe ceremonies, impediment removal, backlog readiness, Snowflake/EDW data analytics, continuous improvement
  Saayam title: Business Analyst (serving as SM)
  UT Austin title: Data and Operations Analyst
  Accenture title: Business Analyst (acting Scrum Master)

V8: BizOps Manager — for BizOps Manager, Strategy Ops Lead, Program Manager, Operations Program Manager roles
  Tagline: "Business Operations | Program Execution | Cross-Functional Alignment | Sales Programs"
  Key angle: Strategic initiatives, cross-functional alignment, McKinsey frameworks, financial modeling, executive comms
  Saayam title: Business Operations Manager
  UT Austin title: Technical Project Manager
  Accenture title: Strategy and Operations Analyst

VISA RULES:
- SKIP: JD has explicit no-sponsorship language
- CHECK REQUIRED: No sponsorship history found — user decides
- CHECK REQUIRED: Contract roles — OPT compliance check needed
- CHECK REQUIRED: Staffing agency roles — rarely support H1B
- CLEAR: Company has strong public H1B sponsorship history
"""

def analyze_job_fit(jd_text, company_name):
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    # No real key — return mock so UI still works
    if not api_key or api_key == "your_actual_key_here" or len(api_key) < 30:
        return mock_screener_response(company_name)

    client = anthropic.Anthropic(api_key=api_key)

    company_line = f"Company: {company_name}" if company_name else "Company: extract from the job description below"

    prompt = f"""
{SOUMYA_PROFILE}

RESUME VERSIONS — pick the single best match for this JD:
V1: Business & BI Analyst — BA, BI Analyst, Data Analyst, Systems Analyst, IT BA
V2: Business Operations Analyst — BizOps Analyst, Operations Analyst, Strategy & Ops, Revenue Ops
V3: SaaS Implementation Consultant — Implementation Consultant, Solutions Consultant, SaaS PM, Delivery Consultant
V4: Technical Program Manager — TPM, IT PM, Engineering PM, SAFe PM, Program Manager
V5: Product Analyst — Product Analyst, Product Ops, Feature Analyst, Growth Analyst
V6: Cloud Project Manager — Cloud PM, DevOps PM, Azure PM, Infrastructure PM, IT PM (cloud-heavy)
V7: Scrum Master — Scrum Master, Agile Coach, RTE, Delivery Lead, Agile PM
V8: BizOps Manager — BizOps Manager, Strategy Ops Lead, Program Operations Manager, Ops Program Manager

SCORING GUIDE (be honest and precise — do not default to 7):
10  = Perfect match, every requirement met, no gaps
8-9 = Strong fit, 1-2 minor gaps, apply immediately
6-7 = Decent fit, clear gaps that can be addressed, apply with tailoring
4-5 = Weak fit, multiple significant gaps, apply only if desperate
1-3 = Wrong role entirely, major misalignment

Analyze this job description and return ONLY a valid JSON object — no markdown, no extra text.

{{
  "decision": "GO or NO GO — GO if score >= 6, NO GO if score < 5",
  "decision_reason": "One specific sentence citing the strongest reason for the decision",
  "match_score": <integer 1-10 based on scoring guide above>,
  "role_family": "<exact role title from the JD>",
  "base_resume": "<one of: V1: Business & BI Analyst | V2: Business Operations Analyst | V3: SaaS Implementation Consultant | V4: Technical Program Manager | V5: Product Analyst | V6: Cloud Project Manager | V7: Scrum Master | V8: BizOps Manager>",
  "visa_flag": "<CLEAR | CHECK REQUIRED | SKIP>",
  "visa_note": "<specific note about this company's visa sponsorship history — SKIP means hard no-sponsorship in JD>",
  "strong_matches": ["specific skill or experience that matches", "another strong match", "third match"],
  "top_gaps": [
    {{"gap": "specific gap description", "severity": "HIGH"}},
    {{"gap": "specific gap description", "severity": "MEDIUM"}},
    {{"gap": "specific gap description", "severity": "LOW"}}
  ],
  "red_flags": ["specific red flag if any — e.g. contract role, no sponsorship, unrealistic YOE"]
}}

Rules:
- decision: "GO" if score >= 6, "NO GO" if score <= 4, your call at 5
- visa_flag: "SKIP" only if JD explicitly says no sponsorship. "CHECK REQUIRED" if unclear. "CLEAR" if company has strong H1B history.
- match_score: integer only, be honest — do NOT default to 7
- base_resume: pick exactly one of the 8 versions listed above
- strong_matches: real specific skills from Soumya's background, not generic phrases
- top_gaps: real gaps vs this JD's requirements

{company_line}

Job Description:
{jd_text}
"""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


def mock_screener_response(company_name):
    """Shown when no API key is set — lets you test the UI."""
    return {
        "decision": "GO",
        "decision_reason": "Strong alignment across BA/PM skills, Agile delivery, and data analysis experience.",
        "match_score": 7,
        "role_family": "Business Analyst",
        "base_resume": "V1: Business & BI Analyst",
        "visa_flag": "CHECK REQUIRED",
        "visa_note": f"Check myvisajobs.com for {company_name} before applying.",
        "strong_matches": [
            "BRD/FRD authoring across 11+ releases at Accenture",
            "Agile/Scrum delivery — PMP + CSPO certified",
            "Power BI dashboards and data analysis experience"
        ],
        "top_gaps": [
            {"gap": "No direct domain experience mentioned in JD", "severity": "MEDIUM"},
            {"gap": "Specific tool from JD not confirmed in experience bank", "severity": "LOW"},
            {"gap": "Stakeholder count could be stronger for this seniority level", "severity": "LOW"}
        ],
        "red_flags": [
            "MOCK RESPONSE — add your Anthropic API key to .env for real analysis"
        ]
    }

def rewrite_bullet(weak_bullet, jd_context=""):
    """
    Rewrites a bullet in Soumya's voice using Holy Grail rules.
    jd_context is optional — if provided, tailors the rewrite to the target role.
    Returns 3 versions.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if not api_key or api_key == "your_actual_key_here" or len(api_key) < 30:
        return mock_rewriter_response()

    client = anthropic.Anthropic(api_key=api_key)

    jd_section = f"""
TARGET JOB DESCRIPTION (tailor keywords and framing to this role):
{jd_context}
""" if jd_context else "No JD provided — rewrite for general use."

    prompt = f"""
You are rewriting a resume bullet for Soumya Singh. You know their full background:

{SOUMYA_PROFILE}

SOUMYA'S WRITING VOICE (Holy Grail rules — follow exactly):
- XYZ formula: Accomplished X, as measured by Y, by doing Z
- Business outcome FIRST, technical detail second
- No "I" — first person is implied
- Max 2 lines, ~40 words per bullet
- Keep EVERY metric from the original — never remove or soften numbers
- Strong distinctive action verbs only (NOT: managed, coordinated, spearheaded, leveraged,
  utilized, streamlined, synergized, driven, passionate, innovative, proactive, seamless)
- Sound like a real person writing about real work — not a formal document
- No buzzwords, no filler, no AI-sounding phrases
- Each bullet: one main idea, crystal clear

{jd_section}

WEAK BULLET TO REWRITE:
{weak_bullet}

Return ONLY valid JSON — no markdown, no extra text:
{{
  "issues_found": ["Specific issue 1 with the original", "Specific issue 2 with the original"],
  "versions": [
    {{
      "bullet": "Rewritten version 1",
      "tone": "e.g. Outcome-first",
      "why": "One sentence — what changed and why it works better"
    }},
    {{
      "bullet": "Rewritten version 2",
      "tone": "e.g. Technical depth",
      "why": "One sentence — what changed and why it works better"
    }},
    {{
      "bullet": "Rewritten version 3",
      "tone": "e.g. Stakeholder-focused",
      "why": "One sentence — what changed and why it works better"
    }}
  ]
}}
"""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1200,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


def mock_rewriter_response():
    return {
        "issues_found": [
            "Starts with weak verb — no impact",
            "No metric or outcome — just describes a task",
            "Too vague — doesn't show what actually changed"
        ],
        "versions": [
            {
                "bullet": "Cut cross-team deployment delays by 30% by owning release coordination across engineering, QA, and product from sprint planning through go-live.",
                "why": "Outcome first with real metric, strong verb, no buzzwords."
            },
            {
                "bullet": "Drove 11+ product releases to on-time delivery by building checklists, coordinating 3 teams, and tracking blockers daily in Jira.",
                "why": "Leads with volume and result, shows the actual method — concrete and specific."
            },
            {
                "bullet": "Reduced launch-day issues by 25% across 11 releases by standardizing go-live steps and support handoffs for onshore and offshore teams.",
                "why": "Quantified outcome upfront, explains the specific work — reads like a real person."
            }
        ]
    }


def build_resume(jd_text, resume_version, company_name):
    """
    Builds a full tailored resume for Soumya based on the JD and chosen version.
    Returns structured JSON with all resume sections + ATS scores.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if not api_key or api_key == "your_actual_key_here" or len(api_key) < 30:
        return mock_resume_response(resume_version, company_name)

    client = anthropic.Anthropic(api_key=api_key)

    version_guides = {
        "V1": """Business & BI Analyst — Lead with data and systems work.
  Job titles to use: UT Austin = 'Data and Operations Analyst', Accenture = 'Business Analyst', Zoho = 'Business Analyst – Presales & Onboarding'
  Emphasize: BRD/FRD, UML/process flows, data mapping + transformation rules, 6000+ record standardization, Power BI/Tableau/Excel dashboards, SQL, requirements gathering, UAT, Jira/Azure DevOps backlog management, data quality, 40%+ escalation reduction through RCA
  Skills sections: Business Intelligence (Power BI, KPI tracking, data mapping), Data & Tools (SQL, Excel, Tableau), Analysis & Reporting (reporting reqs, trend analysis, UAT), Business Analysis & Delivery (user stories, process flows, Jira)""",

        "V2": """Business Operations Analyst — Lead with operational impact and process control.
  Job titles to use: UT Austin = 'Project Manager', Accenture = 'Business Operations Analyst', Zoho = 'Customer Success Analyst – Zoho Expense', Bindal = 'Operations E-Commerce Associate'
  Emphasize: SOPs and process controls, data reconciliation, QA checks and error tracking, exception investigation, quota/performance reporting, Smartsheet reporting hub, 42% rework reduction, operational data analysis across 11 go-lives, 43% escalation reduction, weekly trend reporting
  Also include: ASEP/INCOSE certification
  Skills sections: Business Operations (SOPs, process controls, reconciliation, exception investigation), Automation and Systems (data pipelines, QA checks, workflow automation, runbooks), Tools (Excel, Salesforce, SQL, Python, Smartsheet, Tableau, ServiceNow)""",

        "V3": """SaaS Implementation Consultant — Lead with client-facing implementation and workshops.
  Job titles to use: UT Austin = 'SaaS Implementation Consultant (Library Systems)', Accenture = 'SaaS Product Implementation & Business Analyst', Zoho = 'Implementation Consultant – Zoho Expense'
  Emphasize: Discovery workshops and facilitation, requirements elicitation, SaaS configuration, go-live readiness, UAT, change management, training and knowledge transfer, client-facing delivery, release governance (11 releases), 30% deployment reliability improvement, 43% escalation reduction, 20% reporting reduction
  Skills sections: Implementation & Consulting (workshops, requirements elicitation, SaaS config, change management), Delivery & Operations (project planning, risk management, release governance, KPI tracking), Tools & Data (Jira, Azure DevOps, Smartsheet, Power BI, SQL, ServiceNow)""",

        "V4": """Technical Program Manager — Lead with SAFe delivery, OKRs, and program governance.
  Job titles to use: Saayam = 'Technical Program Manager', UT Austin = 'Technical Program Manager', Accenture = 'Technical Program Manager', Zoho = 'Business Analyst', Bindal = 'Operations Analyst'
  Emphasize: SAFe-aligned delivery, OKR alignment, RAID logs, milestone tracking, quarterly execution planning, PI Planning, program financials, Jira Align, Scrum of Scrums, ART Sync, velocity/defect trend Power BI dashboards for VP-level, CI/CD governance (Azure DevOps, Git, code freezes), 30% deployment reliability, 32% post-release defect reduction, 43% escalation reduction
  Also include: AZ-900 cert; Projects: Integration Control Center (PostgreSQL, Apache NiFi, Tableau, BRD/FRD/OpenAPI/UAT), Job Search AI Platform (Python, FastAPI, Claude API)
  Skills sections: Program Management (OKR alignment, RAID, release governance, stakeholder reporting), Agile & SAFe (SAFe delivery, Scrum of Scrums, ART Sync, sprint planning, Kanban), Technical & Compliance (Azure DevOps, Git, CI/CD, SOC 2, ISO 27001, SQL, Power BI, Gen AI), Tools (Jira, Jira Align, Confluence, Smartsheet, MS Project, Miro, SharePoint)""",

        "V5": """Product Analyst — Lead with feature adoption, data-driven product decisions.
  Job titles to use: Saayam = 'Product Analyst', UT Austin = 'Project Analyst', Accenture = 'Business Analyst / Project Manager', Zoho = 'Business Analyst', Bindal = 'Operations Analyst'
  Emphasize: SQL + Google Analytics for feature adoption metrics, build-measure-learn cycles, A/B and beta testing, KPI definition and tracking, product lifecycle management, go-to-market planning, hypothesis-driven analysis, 4 hrs/week reporting saved, 19% better projected ROI (decision modeling), RAID logs, retrospectives for continuous improvement, 90% on-time delivery
  Skills sections: Product & Analytics (PLM, KPI tracking, feature adoption, A/B testing, requirements prioritization, GTM), Data & Reporting (SQL, Power BI, Tableau, Google Analytics, Excel), Methodology (Lean, Agile, build-measure-learn, hypothesis validation, RCA), Tools (Jira, Smartsheet, Azure DevOps, Miro, Figma, Mixpanel)""",

        "V6": """Cloud Project Manager — Lead with Azure migration delivery and cloud governance.
  Job titles to use: Saayam = 'Project Manager', UT Austin = 'Technical Project Manager', Accenture = 'Business Analyst', Zoho = 'Business Analyst', Bindal = 'Operations Analyst'
  Emphasize: On-prem to Azure cloud migration (Lift and Shift, re-platforming), CI/CD governance (Git, Azure DevOps, code freezes, hotfix flows, release branches), SOC 2 / ISO 27001 / HIPAA / PCI-DSS frameworks, 30% deployment reliability improvement, 42% rework reduction, 40% on-time improvement, 43% escalation reduction, 4 hrs/week saved, cloud-native app delivery at Saayam, risk management and milestone tracking
  Also include: AZ-900 cert; Project: Go-to-Market Strategy (3D-Printed Carbon Fiber Bike, 4 global regions)
  Skills sections: Cloud & Technical Delivery (Azure Migration, Lift and Shift, CI/CD, Azure DevOps, Git, GCP, AWS awareness), Project Management (Schedules, Milestones, Risk tracking, Change Control, SAFe, SDLC), Compliance & Security (SOC 2, ISO 27001, HIPAA, PCI-DSS, IT Governance), Tools (Jira, Confluence, Smartsheet, Asana, MS Project, Miro, SharePoint, Power BI, SQL)""",

        "V7": """Scrum Master — Lead with Agile ceremony facilitation and impediment removal.
  Job titles to use: Saayam = 'Business Analyst (Scrum Master)', UT Austin = 'Data and Operations Analyst', Accenture = 'Business Analyst (acting Scrum Master)', Zoho = 'Business Analyst – Presales', Bindal = 'Operations Analyst'
  Emphasize: SAFe/Agile ceremony facilitation (sprint planning, standups, reviews, retros), impediment removal and escalation, backlog management and refinement with POs, cross-team dependency management, status reports to VP-level (4-6 stakeholders), Snowflake/EDW data analytics epics and user stories, 10+ retrospectives driving continuous improvement, 90% on-time delivery, 20+ defects tracked to closure
  Skills sections: Agile & Scrum Master (SAFe, Scrum, sprint facilitation, backlog refinement, impediment removal, dependency management, retrospectives, Kanban), Data & Analytics (SQL, Snowflake, EDW, Power BI, Tableau, Excel, Google Analytics, KPI tracking, data governance), Tools & Delivery (Jira, Confluence, Smartsheet, Azure DevOps, Miro, ChatGPT, GitHub Copilot, UAT, Release coordination)""",

        "V8": """BizOps Manager — Lead with strategic initiative delivery and cross-functional alignment.
  Job titles to use: Saayam = 'Business Operations Manager', UT Austin = 'Technical Project Manager', Accenture = 'Strategy and Operations Analyst', Zoho = 'Business Analyst – Presales & Onboarding', Bindal = 'Operations Analyst'
  Emphasize: Cross-functional strategic program execution in ambiguous environments, executive status updates and leadership one-pagers, McKinsey structured problem-solving frameworks (issue trees, hypothesis-driven analysis), financial modeling (NPV, 19% better ROI), Power BI KPI dashboards for VP-level, 43% escalation reduction, 32% post-release defect reduction, 42% rework reduction, 40% on-time improvement, SOP standardization across 3 global teams
  Projects: McKinsey Forward Program, Risk-Adjusted Decision Modeling
  Skills sections: Strategy & Operations (cross-functional program execution, strategic initiative delivery, stakeholder alignment, change management, process design, risk mitigation), Analysis & Modeling (data analysis, financial modeling, KPI tracking, Power BI, Tableau, SQL, Excel), Tools & Systems (Jira, Confluence, Smartsheet, Salesforce, CRM tools, Google Workspace, AI tools), Methodologies (Agile, Scrum, Waterfall, SDLC, sprint planning)""",
    }

    # Extract version key (V1-V8) from whatever format comes in
    v_key = "V1"
    for k in ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8"]:
        if k in (resume_version or ""):
            v_key = k
            break

    version_focus = version_guides.get(v_key, version_guides["V1"])

    prompt = f"""
You are building a tailored, ATS-optimized resume for Soumya Singh.

CANDIDATE PROFILE:
{SOUMYA_PROFILE}

CONTACT (use exactly):
- Email: soumya3436@gmail.com
- Phone: (737) 484-7648
- LinkedIn: linkedin.com/in/soumya-ssingh
- Location: Austin, TX | Open to Relocate

VERSION FOCUS — {v_key}: {version_focus}

HOLY GRAIL RESUME RULES (apply to every bullet):
1. XYZ formula: Accomplished [X] as measured by [Y] by doing [Z]
2. Business outcome FIRST, method/tool second
3. No "I" — first person implied
4. Max 2 lines, ~40 words per bullet
5. KEEP all metrics — never soften or remove numbers
6. Strong action verbs ONLY. BANNED verbs: managed, coordinated, spearheaded, leveraged, utilized, streamlined, synergized, led, driven, worked on, assisted, helped, supported, responsible for
7. Sound like a real person writing about real work
8. No buzzwords or AI-sounding filler phrases
9. One idea per bullet — crystal clear
10. Tailor keywords from the JD naturally into bullets

EXPERIENCE BANK (use these REAL metrics — do not invent numbers):
Saayam For All: 3+ workstreams, 90% on-time delivery, 20+ defects tracked, cloud-native app
UT Austin Libraries: 6000+ records, 42% rework reduction, 40% on-time delivery improvement, Smartsheet, Tableau
Accenture: 11+ releases, 50+ stakeholders, 43% escalation reduction, 32% post-release defect reduction, BRD/FRD, Power BI, Azure migration, SAP, Salesforce, Workday, UAT
Zoho: 13% resolution improvement, 20% retention improvement, CRM
Bindal Group: 1000+ SKUs, 3000+ orders/month, 17% dispatch improvement

Now build a complete tailored resume. Return ONLY valid JSON — no markdown, no extra text.

{{
  "version_used": "{v_key}",
  "header": {{
    "name": "Soumya Singh, PMP, CSPO",
    "tagline": "Tailored 6-7 word professional title line for this specific JD",
    "location": "Austin, TX | Open to Relocate",
    "email": "soumyasingh@utexas.edu",
    "phone": "(737) 304-6090",
    "linkedin": "linkedin.com/in/soumyasingh-pmp"
  }},
  "summary": "Two sentences — ATS-dense, first-person-free, outcome-driven. Sentence 1: who she is and her strongest qualification. Sentence 2: what she brings specifically to this type of role.",
  "experience": [
    {{
      "company": "Saayam For All",
      "title": "Technical Business Analyst",
      "dates": "Mar 2026 – Present",
      "location": "Austin, TX (Remote)",
      "bullets": ["4 bullets tailored to the JD using Holy Grail rules and real metrics from the experience bank above"]
    }},
    {{
      "company": "University of Texas at Austin — Libraries",
      "title": "Data & Operations Analyst",
      "dates": "Jan 2025 – Dec 2025",
      "location": "Austin, TX",
      "bullets": ["4 bullets tailored to the JD using Holy Grail rules"]
    }},
    {{
      "company": "Accenture",
      "title": "Business Analyst",
      "dates": "Dec 2021 – Oct 2023",
      "location": "Bengaluru, India",
      "bullets": ["5 bullets — this is the most impressive role, make them count, keep all metrics"]
    }},
    {{
      "company": "Zoho Corporation",
      "title": "Business Analyst, Pre-Sales",
      "dates": "Sep 2021 – Nov 2021",
      "location": "Chennai, India",
      "bullets": ["2 strong bullets with the real metrics"]
    }}
  ],
  "education": [
    {{
      "school": "University of Texas at Austin",
      "degree": "Master of Science, Engineering Management",
      "dates": "Aug 2024 – Dec 2025",
      "note": ""
    }},
    {{
      "school": "Alliance University",
      "degree": "B.Tech, Computer Science",
      "dates": "Jun 2017 – Jun 2021",
      "note": ""
    }}
  ],
  "certifications": [
    "Project Management Professional (PMP) — PMI, Oct 2025",
    "Certified Scrum Product Owner (CSPO) — Scrum Alliance, Jun 2025"
  ],
  "skills": {{
    "Analysis & Documentation": ["list 4-6 most relevant skills for this JD"],
    "Data & Reporting": ["list 3-5 most relevant tools for this JD"],
    "Project & Delivery": ["list 3-5 most relevant tools for this JD"],
    "Enterprise Systems": ["list 3-4 most relevant for this JD"]
  }},
  "ats_score_before": <integer 40-65 — realistic score if generic resume is submitted>,
  "ats_score_after": <integer 72-92 — realistic score after this tailoring>,
  "keywords_added": ["5-8 JD keywords that were woven into the resume"],
  "tailoring_notes": "One sentence on what was most specifically tailored for this JD and company."
}}

Company: {company_name or 'Not specified'}
Resume Version: {v_key}

Job Description:
{jd_text}
"""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


def refine_resume(current_resume, instruction, conversation_history=None):
    """
    Takes the current resume JSON + a natural language instruction and applies targeted edits.
    Returns the complete updated resume JSON in the same structure.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if not api_key or api_key == "your_actual_key_here" or len(api_key) < 30:
        return mock_refine_response(current_resume, instruction)

    client = anthropic.Anthropic(api_key=api_key)

    # Show last 4 turns of history so Claude has context
    history_text = ""
    if conversation_history:
        recent = conversation_history[-4:]
        history_text = "\n\nPREVIOUS CHANGES MADE IN THIS SESSION:\n" + "\n".join(
            f"  - \"{h['instruction']}\"" for h in recent
        )

    prompt = f"""You are refining Soumya Singh's resume based on a specific user instruction.

HOLY GRAIL RULES — apply to any new or changed bullets:
- XYZ formula: Accomplished X, as measured by Y, by doing Z
- Business outcome FIRST, method/tool second
- No "I" — first person implied
- Max ~40 words per bullet, max 2 lines
- KEEP all original metrics — never remove or soften numbers
- Strong action verbs only. BANNED: managed, coordinated, leveraged, utilized, streamlined, spearheaded, helped, assisted, supported, worked on, responsible for
- One idea per bullet, crystal clear
- No AI-sounding filler phrases

CURRENT RESUME JSON:
{json.dumps(current_resume, indent=2)}
{history_text}

USER'S INSTRUCTION: "{instruction}"

Rules for your response:
1. Make ONLY the changes the user requested — do not modify anything else
2. If the user says "add X skill", add it to the most relevant skill category
3. If the user asks to rewrite a bullet, apply Holy Grail rules
4. If the user asks to change a summary, keep it 2 sentences, ATS-dense, first-person-free
5. Return the COMPLETE updated resume in the EXACT same JSON structure as the input
6. Include a "change_summary" field at the top level describing what you changed in 1 sentence

Return ONLY valid JSON — no markdown, no extra text.
"""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    result = json.loads(raw)
    # Ensure change_summary exists
    if "change_summary" not in result:
        result["change_summary"] = "Applied your requested changes."
    return result


def mock_refine_response(current_resume, instruction):
    """Mock refine — echoes the resume with a note about what would change."""
    updated = dict(current_resume)
    updated["change_summary"] = f"MOCK: Would apply '{instruction}' — add your API key for real Claude edits."
    return updated


def mock_resume_response(resume_version, company_name):
    c = company_name or "the company"
    v = resume_version or "V1"
    return {
        "version_used": v,
        "header": {
            "name": "Soumya Singh, PMP, CSPO",
            "tagline": "Business Analyst | Data & Systems | Agile Delivery",
            "location": "Austin, TX | Open to Relocate",
            "email": "soumya3436@gmail.com",
            "phone": "(737) 484-7648",
            "linkedin": "linkedin.com/in/soumya-ssingh"
        },
        "summary": f"PMP- and CSPO-certified Business Analyst with 4 years of experience bridging technical teams and business stakeholders across Agile, ERP, and data-driven environments. Proven track record delivering measurable process improvements — 42% rework reduction at UT Austin, 43% escalation drop at Accenture — and ready to bring that discipline to {c}.",
        "experience": [
            {
                "company": "Saayam For All",
                "title": "Technical Business Analyst",
                "dates": "Mar 2026 – Present",
                "location": "Austin, TX (Remote)",
                "bullets": [
                    "Owned end-to-end requirements gathering and backlog grooming across 3+ concurrent workstreams for a cloud-native platform, achieving 90% on-time milestone delivery.",
                    "Tracked 20+ defects to resolution in Jira, reducing average defect age by coordinating daily with engineering and QA leads.",
                    "Authored acceptance criteria and user stories directly adopted by development — eliminating mid-sprint scope changes that had delayed 2 prior releases.",
                    "Facilitated sprint ceremonies and stakeholder demos for a 10-person cross-functional team, maintaining alignment across product, engineering, and customer success."
                ]
            },
            {
                "company": "University of Texas at Austin — Libraries",
                "title": "Data & Operations Analyst",
                "dates": "Jan 2025 – Dec 2025",
                "location": "Austin, TX",
                "bullets": [
                    "Cut rework in acquisition data processing by 42% by documenting a new data lineage map across 6,000+ records in Smartsheet — adopted org-wide within one quarter.",
                    "Improved on-time project delivery by 40% by building a Smartsheet dashboard that gave leadership real-time visibility into 12 concurrent initiatives.",
                    "Built Tableau reports tracking collection usage and budget KPIs, replacing 3 manual Excel processes used by 5 departments.",
                    "Standardized data entry protocols across teams, reducing inconsistencies that previously caused 1-week delays in monthly reporting cycles."
                ]
            },
            {
                "company": "Accenture",
                "title": "Business Analyst",
                "dates": "Dec 2021 – Oct 2023",
                "location": "Bengaluru, India",
                "bullets": [
                    "Authored BRDs and FRDs for 11+ product releases across SAP, Salesforce, and Workday integrations — coordinating requirements sign-off with 50+ business and technical stakeholders.",
                    "Reduced post-release defects by 32% by designing and executing UAT scripts that caught integration gaps before go-live across 3 enterprise systems.",
                    "Cut escalation volume by 43% by building a structured issue-triage protocol used by onshore and offshore teams across 6-hour time zones.",
                    "Drove Azure migration sprint planning by translating business requirements into technical epics in Azure DevOps — delivering 4 milestones on schedule across 18 months.",
                    "Produced Power BI dashboards consumed by Director-level stakeholders weekly, replacing 4 manual reporting processes and reducing report generation time by 60%."
                ]
            },
            {
                "company": "Zoho Corporation",
                "title": "Business Analyst, Pre-Sales",
                "dates": "Sep 2021 – Nov 2021",
                "location": "Chennai, India",
                "bullets": [
                    "Improved lead-to-demo conversion by 13% by building CRM workflows in Zoho CRM that automated follow-up sequences for 200+ inbound leads per month.",
                    "Boosted customer retention rate by 20% by identifying and resolving recurring onboarding friction points through analysis of support ticket patterns."
                ]
            }
        ],
        "education": [
            {
                "school": "University of Texas at Austin",
                "degree": "Master of Science, Engineering Management",
                "dates": "Aug 2024 – Dec 2025",
                "note": ""
            },
            {
                "school": "Alliance University",
                "degree": "B.Tech, Computer Science",
                "dates": "Jun 2017 – Jun 2021",
                "note": ""
            }
        ],
        "certifications": [
            "Project Management Professional (PMP) — PMI, Oct 2025",
            "Certified Scrum Product Owner (CSPO) — Scrum Alliance, Jun 2025"
        ],
        "skills": {
            "Analysis & Documentation": ["BRD / FRD", "User Stories", "UML", "UAT", "Process Mapping", "Gap Analysis"],
            "Data & Reporting": ["SQL", "Power BI", "Tableau", "Smartsheet", "Snowflake EDW"],
            "Project & Delivery": ["Jira", "Azure DevOps", "Confluence", "Agile/Scrum", "Kanban"],
            "Enterprise Systems": ["SAP ERP", "Salesforce CRM", "Workday", "Microsoft Azure"]
        },
        "ats_score_before": 52,
        "ats_score_after": 81,
        "keywords_added": ["data lineage", "UAT scripts", "sprint ceremonies", "backlog grooming", "stakeholder alignment", "KPI dashboard"],
        "tailoring_notes": f"MOCK RESPONSE — add your Anthropic API key to .env for a resume actually tailored to {c}."
    }


LINKEDIN_SEARCH_QUERIES = {
    'hiring_manager': 'linkedin.com/in "{company}" "hiring manager" OR "team lead" OR "delivery manager"',
    'recruiter':      'linkedin.com/in "{company}" "recruiter" OR "talent acquisition" OR "technical recruiter"',
    'peer':           'linkedin.com/in "{company}" "{role}"',
    'senior_leader':  'linkedin.com/in "{company}" "director" OR "VP" OR "vice president" OR "head of"',
    'alumni':         'linkedin.com/in "{company}" "University of Texas" OR "UT Austin" OR "Accenture" OR "Zoho" OR "Saayam"',
}


def _parse_linkedin_result(result):
    """Parse a DuckDuckGo result into a person dict. Returns None if not a real profile."""
    url   = result.get('href', '')
    title = result.get('title', '')
    body  = result.get('body', '')

    if 'linkedin.com/in/' not in url:
        return None

    # Strip trailing " | LinkedIn" or " - LinkedIn"
    clean = re.sub(r'\s*[\|·\-]\s*LinkedIn.*$', '', title, flags=re.IGNORECASE).strip()

    parts = [p.strip() for p in re.split(r'\s*[-–]\s*', clean)]
    name      = parts[0] if parts else ''
    job_title = parts[1] if len(parts) > 1 else ''

    # Filter garbage entries
    if len(name) < 3:
        return None
    if any(bad in name.lower() for bad in ('sign in', 'log in', 'linkedin', 'people', 'search')):
        return None
    # Must look like a real name (has a space, not all caps)
    if ' ' not in name and len(name) > 20:
        return None

    # Extract first name only for the message generator
    first_name = name.split()[0].strip("\"'")

    return {
        'name':         name,
        'first_name':   first_name,
        'title':        job_title,
        'linkedin_url': url,
        'snippet':      body[:200] if body else '',
    }


def search_linkedin_people(company, role, target_type, target_label):
    try:
        from ddgs import DDGS
    except ImportError:
        try:
            from duckduckgo_search import DDGS
        except ImportError:
            return {'people': [], 'note': 'Search package not installed. Run: pip install ddgs'}

    query_template = LINKEDIN_SEARCH_QUERIES.get(
        target_type,
        'linkedin.com/in "{company}" "{target_label}"'
    )
    query = query_template.format(company=company, role=role or 'business analyst', target_label=target_label)

    try:
        with DDGS() as ddgs:
            raw_results = list(ddgs.text(query, max_results=15))
    except Exception as e:
        return {'people': [], 'note': f'Search temporarily unavailable: {str(e)}'}

    people     = []
    seen_names = set()

    for r in raw_results:
        parsed = _parse_linkedin_result(r)
        if parsed and parsed['name'] not in seen_names and len(people) < 5:
            seen_names.add(parsed['name'])
            people.append(parsed)

    note = (
        'Found from public LinkedIn profiles via web search. '
        'Verify their current role before messaging — people move around.'
    )
    if not people:
        note = f'No public LinkedIn profiles found for {target_label} at {company}. Try the search string below directly on LinkedIn.'

    return {'people': people, 'note': note, 'query_used': query}


OUTREACH_VOICE_GUIDE = """
SOUMYA SINGH — LINKEDIN OUTREACH VOICE GUIDE (derived from 30+ real messages)

IDENTITY:
- Name: Soumya Singh, PMP, CSPO
- Education: MS Engineering Management, UT Austin (Dec 2025) | B.Tech CS, Alliance University
- Current: Technical Business Analyst, Saayam For All (Mar 2026-Present)
- Background: BA, Data Management, Agile, SQL, Jira, Release Coordination (~4 years total)
- Notable: Accenture (~2 yrs), UT Austin Libraries (1 yr), Zoho (3 mo)
- Location: Austin, TX | Open to Relocate
- Aliases she uses: 'recent UT Austin graduate', 'fellow Texas Ex', 'UT Austin alum from MEM program'

KEY PROOF POINTS (pick what is relevant — don't dump all of them):
- 32% post-release defect reduction (Accenture UAT coordination)
- 42% rework reduction (UT Austin data lineage documentation)
- 90% on-time milestone delivery (Saayam, 3+ concurrent workstreams)
- 11+ BRDs/FRDs authored, 50+ stakeholders managed (Accenture)
- PMP certified (Oct 2025), CSPO certified (June 2025)
- SQL: Snowflake EDW, data validation, ETL troubleshooting
- Tools: Jira, Smartsheet, Power BI, Tableau, MS Visio, Azure DevOps

VOICE RULES — STRICTLY FOLLOW ALL:
1. Open with 'Hi [First Name],' on its own line, comma after name
2. NEVER start the body's first sentence with 'I' — start with context or reference to them
3. NEVER use 'I hope this message finds you well'
4. NEVER use 'I wanted to reach out to introduce myself' as opener
5. Warm but professional — never stiff, never casual slang
6. Always reference something specific about their company, role, or domain
7. Use 'I believe I am a strong fit' — NEVER 'I am the perfect candidate'
8. For job outreach: use 3-reason bullet format with → or numbered list
9. Always end with ONE clear, specific ask only
10. Confident and humble — not desperate or needy
11. Cold connect = 2-4 sentences MAX — no walls of text
12. Always include a sign-off

SIGN-OFFS (match to formality of message):
- 'Best regards,\\nSoumya Singh' → hiring managers, formal InMail, job applications
- 'Best regards,\\nSoumya' → warm professional contacts, recruiters
- 'Best,\\nSoumya' → networking, alumni, warm contacts
- 'My Best,\\nSoumya' → casual connects, quick coffee chat asks

MESSAGE TYPE STRUCTURES:
TYPE connection_request — LinkedIn Connection Note (HARD LIMIT: 300 characters including spaces):
  Must fit in LinkedIn's connection note limit. 2-3 sentences MAX. Who she is + why this person specifically + brief what she hopes for. No sign-off needed if space is tight.
TYPE job_outreach — Job-Specific Message (InMail / DM after connecting):
  'I recently applied for [Role] at [Company] and wanted to reach out' + 3 bullet proof points mapped to role requirements + mention resume attached + ask for brief call with specific availability
TYPE coffee_chat — Coffee Chat Ask (3-5 sentences):
  Thanks for connecting + specific ask for 15-min chat + one specific topic to discuss
TYPE follow_up — Follow-Up (4-8 sentences):
  Warm opener ('How are you doing?') + optional brief personal update + ONE specific ask
TYPE inbound_reply — Reply to Inbound Recruiter:
  Thank you for reaching out + confirm interest + specific availability window + resume attached mention
TYPE post_interview — Post-Interview Thank You:
  Thank you mentioning company name + role discussed + one warm forward-looking sentence

SIGNATURE PHRASES (pull naturally — don't use all):
- 'I am a recent UT Austin graduate and wanted to connect with experienced leaders in the [X] space.'
- 'Wanted to connect with a fellow Texas Ex and learn more about your journey from UT to [Company].'
- 'I recently applied for the [Role] role at [Company] and wanted to reach out directly.'
- 'I believe I am a strong fit for three reasons:'
- 'I have attached my resume for your review.'
- 'Hoping to have a wonderful conversation.'
- 'I am available [days] from [time range] CST.'
- 'Would you be open to a 15-minute chat?'
- 'If you are open to it, I would appreciate the chance to connect briefly.'
"""


def generate_outreach_targets(jd_text, company, role):
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if not api_key or api_key == "your_actual_key_here" or len(api_key) < 30:
        return mock_outreach_targets(company, role)

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""
You are helping Soumya Singh figure out exactly who to reach out to on LinkedIn given this job description.

Based on the JD, company, and role — identify 5 types of people she should contact, in priority order.
For each, generate a realistic LinkedIn search string she can paste into LinkedIn's search bar.

Return ONLY valid JSON — no markdown, no extra text:
{{
  "company": "{company}",
  "role": "{role}",
  "targets": [
    {{
      "type": "hiring_manager",
      "label": "Hiring Manager",
      "priority": "HIGH",
      "icon": "👔",
      "why": "One sentence on why this person matters most",
      "search_tips": "Brief tip on how to find them on LinkedIn",
      "linkedin_search": "Search string to paste into LinkedIn search (using their name field or keywords)",
      "suggested_message_type": "job_outreach"
    }},
    {{
      "type": "recruiter",
      "label": "HR / Recruiter",
      "priority": "HIGH",
      "icon": "🎯",
      "why": "...",
      "search_tips": "...",
      "linkedin_search": "...",
      "suggested_message_type": "job_outreach"
    }},
    {{
      "type": "peer",
      "label": "Team Peer",
      "priority": "MEDIUM",
      "icon": "🤝",
      "why": "...",
      "search_tips": "...",
      "linkedin_search": "...",
      "suggested_message_type": "coffee_chat"
    }},
    {{
      "type": "senior_leader",
      "label": "Senior Leader",
      "priority": "MEDIUM",
      "icon": "🏆",
      "why": "...",
      "search_tips": "...",
      "linkedin_search": "...",
      "suggested_message_type": "connection_request"
    }},
    {{
      "type": "alumni",
      "label": "Shared Background",
      "priority": "MEDIUM",
      "icon": "🤘",
      "why": "People who share Soumya's school (UT Austin) or past employers (Accenture, Zoho, Saayam) are warm contacts — they reply at a much higher rate",
      "search_tips": "On LinkedIn filter People at this company by school (UT Austin) or past company (Accenture, Zoho, Saayam) — any overlap makes a warm opener",
      "linkedin_search": "\"University of Texas\" OR \"Accenture\" OR \"Zoho\" OR \"Saayam\" \"{company}\"",
      "suggested_message_type": "connection_request"
    }}
  ]
}}

priority must be HIGH or MEDIUM
suggested_message_type must be one of: connection_request, job_outreach, coffee_chat, follow_up

Company: {company}
Role: {role}

Job Description:
{jd_text[:2000]}
"""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1200,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


def mock_outreach_targets(company, role):
    c = company or "this company"
    r = role or "this role"
    return {
        "company": c,
        "role": r,
        "targets": [
            {
                "type": "hiring_manager",
                "label": "Hiring Manager",
                "priority": "HIGH",
                "icon": "👔",
                "why": f"Direct decision-maker for the {r} role. A message here has the highest chance of moving your application forward.",
                "search_tips": f"Search LinkedIn for '{c}' + 'manager' or 'lead' + the team name from the JD. Check who posted the job on LinkedIn.",
                "linkedin_search": f'"{c}" "hiring manager" OR "delivery manager" OR "team lead" "{r}"',
                "suggested_message_type": "job_outreach"
            },
            {
                "type": "recruiter",
                "label": "HR / Recruiter",
                "priority": "HIGH",
                "icon": "🎯",
                "why": "Recruiters control who gets screened. Reaching out shows initiative and gets you flagged as a motivated candidate.",
                "search_tips": f"Search '{c} recruiter' or '{c} talent acquisition' on LinkedIn. Look for 'Technical Recruiter' or 'Talent Partner'.",
                "linkedin_search": f'"{c}" "recruiter" OR "talent acquisition" OR "talent partner"',
                "suggested_message_type": "job_outreach"
            },
            {
                "type": "peer",
                "label": "Team Peer",
                "priority": "MEDIUM",
                "icon": "🤝",
                "why": "Someone currently doing a similar role at this company can give you insider context and may advocate for you internally.",
                "search_tips": f"Search for '{r}' at '{c}' on LinkedIn. Filter by current company.",
                "linkedin_search": f'"{c}" "{r}" OR "business analyst" OR "project manager"',
                "suggested_message_type": "coffee_chat"
            },
            {
                "type": "senior_leader",
                "label": "Senior Leader / Director",
                "priority": "MEDIUM",
                "icon": "🏆",
                "why": "Senior leaders often influence hiring even if they're not the direct manager. A concise, impressive connect can open doors.",
                "search_tips": f"Look for 'Director' or 'VP' of the department mentioned in the JD at '{c}' on LinkedIn.",
                "linkedin_search": f'"{c}" "director" OR "VP" OR "vice president" "operations" OR "technology" OR "product"',
                "suggested_message_type": "connection_request"
            },
            {
                "type": "alumni",
                "label": "Shared Background",
                "priority": "MEDIUM",
                "icon": "🤘",
                "why": "People who share your school or a past employer are warm contacts — they reply at a much higher rate than cold outreach.",
                "search_tips": f"On LinkedIn, filter People at '{c}' by school (UT Austin) or past employer (Accenture, Zoho, Saayam). Any overlap is a warm opener.",
                "linkedin_search": f'"University of Texas" OR "Accenture" OR "Zoho" OR "Saayam" "{c}"',
                "suggested_message_type": "connection_request"
            }
        ]
    }


def generate_outreach_message(jd_text, company, role, target_type, message_type, recipient_name, recipient_context):
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if not api_key or api_key == "your_actual_key_here" or len(api_key) < 30:
        return mock_outreach_message(company, role, target_type, message_type, recipient_name)

    client = anthropic.Anthropic(api_key=api_key)

    name_line = f"Recipient's first name: {recipient_name}" if recipient_name else "Recipient's name: unknown — use 'Hi there,' or leave placeholder [First Name]"
    context_line = f"Additional context about this person: {recipient_context}" if recipient_context else "No additional context provided."

    char_limit_note = ""
    if message_type == "connection_request":
        char_limit_note = "CRITICAL: This is a LinkedIn connection request note. HARD LIMIT of 300 characters including spaces. Count carefully. Cut anything not essential."

    prompt = f"""
{OUTREACH_VOICE_GUIDE}

---

Now write a LinkedIn outreach message for Soumya Singh.

{name_line}
Target type: {target_type}
Message type: {message_type}
Company: {company or 'the company in this JD'}
Role applied for: {role or 'the role in this JD'}
{context_line}
{char_limit_note}

Job Description (use to pull relevant skills/requirements for proof points):
{jd_text[:2000]}

Return ONLY valid JSON — no markdown, no extra text:
{{
  "message": "The full message text with real line breaks using \\n",
  "subject_line": "Subject line if message_type is job_outreach or inbound_reply, otherwise empty string",
  "char_count": 0,
  "message_type": "{message_type}",
  "notes": "One sentence explaining the key choice made in writing this message"
}}

char_count must be the actual character count of the message string.
"""

    msg = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = msg.content[0].text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    result = json.loads(raw)
    result["char_count"] = len(result.get("message", ""))
    return result


def mock_outreach_message(company, role, target_type, message_type, recipient_name):
    name = recipient_name or "[First Name]"
    c = company or "the company"
    r = role or "the role"

    messages = {
        "connection_request": {
            "hiring_manager": f"Hi {name},\n\nRecently applied for the {r} role at {c} and wanted to connect directly. I have 4 years of BA and Agile delivery experience — would love to learn more about the team.\n\nBest, Soumya",
            "recruiter": f"Hi {name},\n\nI applied for the {r} role at {c} and wanted to connect. PMP + CSPO certified BA with Accenture background. Happy to share more about my experience.\n\nBest, Soumya",
            "peer": f"Hi {name},\n\nI came across your profile and noticed you're working in a similar space at {c}. Would love to connect and learn more about your experience there.\n\nBest, Soumya",
            "senior_leader": f"Hi {name},\n\nRecent UT Austin grad and BA with a background in Agile delivery and data management. Excited to follow your work at {c} — would love to connect.\n\nBest, Soumya",
            "alumni": f"Hi {name},\n\nWanted to connect with a fellow Texas Ex at {c}! I'm a recent MEM grad from UT Austin and would love to learn more about your journey there.\n\nBest, Soumya",
        },
        "job_outreach": {
            "hiring_manager": f"Subject: {r} Role at {c}\n\nHi {name},\n\nI recently applied for the {r} role at {c} and wanted to reach out directly. I believe I am a strong fit for three reasons:\n\n1. At Accenture, I owned BRD/FRD authoring end-to-end across 11+ releases, coordinating with engineering, QA, and business stakeholders — reducing post-release defects by 32%.\n2. I am PMP and CSPO certified with hands-on sprint planning, backlog refinement, and cross-functional delivery experience.\n3. I have SQL, Power BI, and Azure experience directly relevant to the technical requirements in this role.\n\nI have attached my resume for your review. If you are open to it, I would appreciate a brief 15-minute conversation.\n\nI am available Monday through Thursday, 10 AM – 2 PM CST.\n\nBest regards,\nSoumya Singh",
            "recruiter": f"Subject: {r} Application at {c} — Soumya Singh\n\nHi {name},\n\nI recently applied for the {r} role at {c} and wanted to connect directly with the team. I believe I am a strong fit for three reasons:\n\n→ 4 years of BA experience across Accenture, UT Austin, and SaaS environments — BRD/FRD, UAT, Agile delivery\n→ PMP and CSPO certified, with hands-on sprint planning and stakeholder coordination\n→ SQL, Power BI, and cross-functional delivery skills aligned to what this role requires\n\nI have attached my resume. Happy to connect and tell you more.\n\nBest regards,\nSoumya Singh",
        },
        "coffee_chat": {
            "peer": f"Hi {name},\n\nThanks for connecting! I am exploring opportunities in the {r} space and noticed you have experience at {c}. Would you have 15 minutes for a quick coffee chat? I would love to hear about what the team culture is like and what you find most interesting about the work.\n\nLooking forward to hearing from you.\n\nBest, Soumya",
            "alumni": f"Hi {name},\n\nThanks for connecting — always great to find a fellow Texas Ex! I am a recent MEM grad currently exploring roles in the BA and ops space. Would love to grab a 15-minute virtual coffee and hear more about your path from UT to {c}.\n\nLooking forward to hearing from you.\n\nMy Best, Soumya",
        },
    }

    # Fall through to a generic message if specific combo not found
    msg_map = messages.get(message_type, {})
    message = msg_map.get(target_type) or msg_map.get(list(msg_map.keys())[0]) if msg_map else None

    if not message:
        message = f"Hi {name},\n\nI am Soumya Singh, a recent UT Austin graduate with experience in business analysis and Agile delivery. I came across your profile and wanted to connect — I am currently exploring opportunities at {c} and would love to learn more.\n\nBest, Soumya"

    subject = ""
    if message_type == "job_outreach":
        subject = f"{r} Application at {c} — Soumya Singh"

    return {
        "message": message,
        "subject_line": subject,
        "char_count": len(message),
        "message_type": message_type,
        "notes": "MOCK RESPONSE — add your Anthropic API key to .env for real Claude-generated messages tailored to this exact JD."
    }


def analyze_ats(jd_text, resume_text):
    """Compares resume against JD for ATS keyword gaps."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if not api_key or "placeholder" in api_key or len(api_key) < 30:
        return mock_ats_response()

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""
You are an ATS expert. Analyze the resume against the job description for keyword gaps.

Return ONLY valid JSON:
{{
  "ats_score": 72,
  "summary": "One sentence overall assessment",
  "missing_keywords": [
    {{"keyword": "keyword", "priority": "HIGH", "context": "Why this matters in the JD"}},
    {{"keyword": "keyword", "priority": "MEDIUM", "context": "Why this matters in the JD"}},
    {{"keyword": "keyword", "priority": "LOW", "context": "Why this matters in the JD"}}
  ],
  "weak_keywords": [
    {{"keyword": "keyword in resume but weak", "suggestion": "How to strengthen it"}}
  ],
  "strong_keywords": ["keyword 1", "keyword 2", "keyword 3"],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ]
}}

ats_score: number 0-100
priority: HIGH, MEDIUM, or LOW only
missing_keywords: in JD but NOT in resume
weak_keywords: in resume but used weakly
strong_keywords: well represented in resume

JOB DESCRIPTION:
{jd_text}

RESUME TEXT:
{resume_text}
"""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


def mock_ats_response():
    return {
        "ats_score": 68,
        "summary": "MOCK — Add API key for real analysis. Solid foundation but missing JD-specific keywords.",
        "missing_keywords": [
            {"keyword": "demand generation", "priority": "HIGH", "context": "Appears 4x in JD — core responsibility"},
            {"keyword": "marketing automation", "priority": "HIGH", "context": "Required tool in job requirements"},
            {"keyword": "ABM", "priority": "MEDIUM", "context": "Account-based marketing — nice to have"},
            {"keyword": "MQL", "priority": "MEDIUM", "context": "Marketing qualified leads — appears in metrics section"},
            {"keyword": "funnel optimization", "priority": "LOW", "context": "Mentioned once in nice to have"}
        ],
        "weak_keywords": [
            {"keyword": "Salesforce", "suggestion": "Add specific use case — CRM reporting, pipeline tracking"},
            {"keyword": "stakeholder communication", "suggestion": "Too generic — specify who, what level, what outcome"}
        ],
        "strong_keywords": ["cross-functional", "project management", "data analysis", "Power BI", "Agile"],
        "recommendations": [
            "Add 'demand generation' to skills section — HIGH priority missing keyword",
            "Reframe Accenture bullets to include campaign coordination language",
            "Add a bullet about pipeline metrics — your Power BI experience supports this"
        ]
    }