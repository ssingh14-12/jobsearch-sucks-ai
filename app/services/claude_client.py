import anthropic
import os
import json

# This is Soumya's profile — the brain behind every analysis
SOUMYA_PROFILE = """
You are analyzing job descriptions for Soumya Singh:
- PMP + CSPO certified. MS Engineering Management, UT Austin (Dec 2025). B.Tech CS, Alliance University.
- F-1 STEM OPT — no sponsorship needed until Oct 2026 H1B lottery deadline.
- Based in Austin TX, open to relocate.

EXPERIENCE:
- Saayam For All (Mar 2026-Present): Project/Product role, cloud-native app, 3+ workstreams, 90% on-time delivery, 20+ defects tracked
- UT Austin Libraries (Jan-Dec 2025): Data/Ops Analyst, Smartsheet, Tableau, 6000+ records, 42% rework reduction, 40% on-time improvement
- Accenture (Dec 2021-Oct 2023): Business Analyst — BRD/FRD, UAT, Power BI, Azure migration, SAP, Salesforce, Workday, 11+ releases, 50+ stakeholders, 43% escalation reduction
- Zoho Corporation (Sep-Nov 2021): BA/Presales, CRM, requirements, 13% resolution improvement, 20% retention improvement
- Bindal Group (Sep 2020-Sep 2021): Ops Analyst, 1000+ SKUs, 3000+ orders/month, 17% dispatch improvement

SKILLS: BRD/FRD, UML, UAT, ETL, Power BI, Tableau, SQL, Azure, SAP ERP, Salesforce, Workday, Jira, Confluence, Smartsheet, Agile/Scrum, CI/CD, Azure DevOps, REST API, Postman

TARGET ROLES (priority order):
1. Business Operations Analyst / BizOps
2. Business Systems Analyst / IT BA
3. Technical Project Manager / IT PM
4. Product Owner / Product Manager
5. Implementation Specialist / SaaS Implementation
6. Operations Analyst / Strategy & Ops

VISA RULES:
- SKIP: JD has explicit no-sponsorship language
- FLAG: No sponsorship history found — user decides
- FLAG: Contract roles — OPT compliance check needed
- FLAG: Staffing agency roles — rarely support H1B
"""

def analyze_job_fit(jd_text, company_name):
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    # No real key — return mock so UI still works
    if not api_key or "placeholder" in api_key or len(api_key) < 30:
        return mock_screener_response(company_name)

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""
{SOUMYA_PROFILE}

Analyze this job description and return ONLY a valid JSON object — no markdown, no extra text.

Use this exact structure:
{{
  "decision": "GO",
  "decision_reason": "One clear sentence why",
  "match_score": 7,
  "role_family": "Business Analyst",
  "base_resume": "Version 1: Business Analyst / Data & Systems Analysis",
  "visa_flag": "CHECK REQUIRED",
  "visa_note": "Short note about visa situation for this company/role",
  "strong_matches": ["match 1", "match 2", "match 3"],
  "top_gaps": [
    {{"gap": "Gap description", "severity": "HIGH"}},
    {{"gap": "Gap description", "severity": "MEDIUM"}},
    {{"gap": "Gap description", "severity": "LOW"}}
  ],
  "red_flags": ["flag 1", "flag 2"]
}}

decision must be "GO" or "NO GO"
visa_flag must be "CLEAR", "CHECK REQUIRED", or "SKIP"
severity must be "HIGH", "MEDIUM", or "LOW"
match_score must be a number 1-10

Company: {company_name}

Job Description:
{jd_text}
"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
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
        "base_resume": "Version 1: Business Analyst / Data & Systems Analysis",
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

def rewrite_bullet(weak_bullet, writing_style):
    """Rewrites a bullet in the user's specified writing style. Returns 3 versions."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if not api_key or "placeholder" in api_key or len(api_key) < 30:
        return mock_rewriter_response()

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""
You are a resume bullet rewriter. Rewrite the given bullet in the user's writing style.

BANNED WORDS — never use these:
spearheaded, leveraged, utilized, streamlined, synergized, robust, dynamic, 
cutting-edge, innovative, passionate, driven, results-oriented, detail-oriented, 
proactive, seamless, managed, coordinated, genuinely, honestly

RULES:
- XYZ formula: Accomplished X, measured by Y, by doing Z
- Outcome first, technical detail second  
- No "I" — first person implied
- Max 2 lines per bullet
- Keep every metric from the original — never remove numbers
- Strong distinctive action verbs only
- Sound like a real person, not a formal document

USER'S WRITING STYLE:
{writing_style}

WEAK BULLET:
{weak_bullet}

Return ONLY valid JSON:
{{
  "issues_found": ["Issue 1 with original", "Issue 2 with original"],
  "versions": [
    {{
      "bullet": "Rewritten version 1",
      "why": "One sentence — what changed and why it works"
    }},
    {{
      "bullet": "Rewritten version 2",
      "why": "One sentence — what changed and why it works"
    }},
    {{
      "bullet": "Rewritten version 3",
      "why": "One sentence — what changed and why it works"
    }}
  ]
}}
"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
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
        model="claude-sonnet-4-20250514",
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