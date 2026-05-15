/**
 * ResumeBuilder.jsx — Page 2: Resume Builder
 *
 * Flow:
 *   1. Reads JD + screener result from JDContext (no re-paste needed)
 *   2. User picks resume version (V1–V5), pre-selected from screener
 *   3. Hits Flask /resume/build → Claude builds full tailored resume
 *   4. Shows ATS before→after, full resume sections, copy buttons
 *   5. Download as Word .docx
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJD } from '../context/JDContext';
import { api } from '../api';
import JDBar from '../components/JDBar';
import './ResumeBuilder.css';

// ── Resume version definitions ──────────────────────────────────────────────
const VERSIONS = [
  { key: 'V1', label: 'BA / Data & Systems',     desc: 'BA, Systems Analyst, Data Analyst', color: '#00C8E0' },
  { key: 'V2', label: 'ERP PM / SaaS Impl',       desc: 'Implementation, ERP, SaaS PM',      color: '#8B5CF6' },
  { key: 'V3', label: 'Technical PM',              desc: 'TPM, IT PM, Engineering PM',         color: '#10B981' },
  { key: 'V4', label: 'BizOps / Strategy',         desc: 'BizOps, Strategy & Ops, Prog Analyst', color: '#F59E0B' },
  { key: 'V5', label: 'BA / Salesforce & AI',      desc: 'CRM-heavy, AI-forward, Salesforce BA', color: '#EF4444' },
];

// Pull just the "V1", "V2" etc. key from whatever screenResult.base_resume sends back
function extractVersionKey(baseResume) {
  if (!baseResume) return null;
  const match = baseResume.match(/V[1-5]/);
  return match ? match[0] : null;
}

// ── Copy-to-clipboard hook ───────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(null);
  function copy(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }
  return { copied, copy };
}

// ── ATS score ring component ─────────────────────────────────────────────────
function ScoreRing({ score, label, delay = '0s' }) {
  const color  = score >= 80 ? '#10B981' : score >= 65 ? '#F59E0B' : '#EF4444';
  const radius = 30;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (circ * score / 100);

  return (
    <div className="ats-ring-wrap" style={{ animationDelay: delay }}>
      <svg viewBox="0 0 80 80" className="ats-ring-svg" style={{ color }}>
        <circle cx="40" cy="40" r={radius} className="ats-ring-track" />
        <circle
          cx="40" cy="40" r={radius}
          className="ats-ring-fill"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ats-ring-center">
        <span className="ats-ring-num" style={{ color }}>{score}</span>
        <span className="ats-ring-pct">%</span>
      </div>
      <p className="ats-ring-label">{label}</p>
    </div>
  );
}

// ── Section copy card ────────────────────────────────────────────────────────
function SectionCard({ title, children, copyText, copyId, copied, onCopy }) {
  return (
    <div className="rb-section-card">
      <div className="rb-section-header">
        <span className="rb-section-title">{title}</span>
        {copyText && (
          <button
            className={`rb-copy-btn ${copied === copyId ? 'copied' : ''}`}
            onClick={() => onCopy(copyText, copyId)}
          >
            {copied === copyId ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>
      <div className="rb-section-body">{children}</div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ResumeBuilder() {
  const { jd, jobTitle, company, screenResult } = useJD();
  const navigate = useNavigate();
  const { copied, copy } = useCopy();

  // Pre-select version from screener if available
  const recommended = screenResult ? extractVersionKey(screenResult.base_resume) : null;
  const [selectedVersion, setSelectedVersion] = useState(recommended || 'V1');
  const [loading, setLoading]  = useState(false);
  const [resume, setResume]    = useState(null);
  const [error, setError]      = useState('');
  const [downloading, setDownloading] = useState(false);

  async function handleBuild() {
    if (!jd) { setError('Load a job description first — use the bar above.'); return; }
    setError('');
    setLoading(true);
    setResume(null);

    try {
      const res = await api.post('/resume/build', {
        jd_text:        jd,
        resume_version: selectedVersion,
        company_name:   company,
      });
      setResume(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach Flask — make sure it is running on port 5000.');
      } else {
        setError(`Build failed: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!resume) return;
    setDownloading(true);
    try {
      const res = await api.post('/resume/download', {
        resume,
        company: company || 'Resume',
      }, { responseType: 'blob' });

      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `Soumya_Singh_${(company || 'Resume').replace(/\s+/g, '_')}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Download failed — check Flask is running.');
    } finally {
      setDownloading(false);
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────
  function bulletsCopyText(job) {
    return job.bullets.map(b => `• ${b}`).join('\n');
  }

  function allExpCopyText() {
    return (resume?.experience || []).map(job =>
      `${job.title} — ${job.company} (${job.dates})\n${job.bullets.map(b => `• ${b}`).join('\n')}`
    ).join('\n\n');
  }

  function skillsCopyText() {
    return Object.entries(resume?.skills || {})
      .map(([cat, items]) => `${cat}: ${items.join(', ')}`)
      .join('\n');
  }

  const versionObj = VERSIONS.find(v => v.key === selectedVersion) || VERSIONS[0];

  // ── No JD state ──────────────────────────────────────────────────────────
  if (!jd) {
    return (
      <div className="page-layout">
        <JDBar />
        <div className="page-content">
          <div className="rb-no-jd">
            <div className="rb-no-jd-icon">📋</div>
            <h2>No Job Description Loaded</h2>
            <p>Paste a JD in the bar above, or go to the Screener first to analyze a role and get a version recommendation.</p>
            <button className="rb-btn-secondary" onClick={() => navigate('/screener')}>
              Go to Screener →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="page-layout">
      <JDBar />
      <div className="page-content rb-page">

        {/* ── Header ── */}
        <div className="rb-header">
          <h1 className="rb-title">Resume <span>Builder</span></h1>
          <p className="rb-sub">
            Tailoring for <strong>{jobTitle || 'this role'}</strong>
            {company ? ` at ${company}` : ''} — Holy Grail rules applied to every bullet.
          </p>
        </div>

        {/* ── Version selector ── */}
        <div className="rb-version-wrap">
          <p className="rb-section-label">
            Resume Version
            {recommended && (
              <span className="rb-recommended-badge">
                ✦ Screener recommends {recommended}
              </span>
            )}
          </p>
          <div className="rb-version-grid">
            {VERSIONS.map(v => (
              <button
                key={v.key}
                className={`rb-version-btn ${selectedVersion === v.key ? 'active' : ''}`}
                style={selectedVersion === v.key ? { borderColor: v.color, color: v.color } : {}}
                onClick={() => setSelectedVersion(v.key)}
              >
                <span className="rb-version-key">{v.key}</span>
                <span className="rb-version-label">{v.label}</span>
                <span className="rb-version-desc">{v.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Screener context banner ── */}
        {screenResult && (
          <div className="rb-context-banner">
            <div className="rb-context-item">
              <span className="rb-context-key">Screener score</span>
              <span className="rb-context-val" style={{
                color: screenResult.match_score >= 8 ? '#10B981' : screenResult.match_score >= 6 ? '#F59E0B' : '#EF4444'
              }}>{screenResult.match_score}/10</span>
            </div>
            <div className="rb-context-sep" />
            <div className="rb-context-item">
              <span className="rb-context-key">Role family</span>
              <span className="rb-context-val">{screenResult.role_family}</span>
            </div>
            <div className="rb-context-sep" />
            <div className="rb-context-item">
              <span className="rb-context-key">Recommended version</span>
              <span className="rb-context-val" style={{ color: versionObj.color }}>{screenResult.base_resume}</span>
            </div>
          </div>
        )}

        {/* ── Build button ── */}
        <div className="rb-build-wrap">
          {error && <p className="rb-error">⚠ {error}</p>}
          <button className="rb-build-btn" onClick={handleBuild} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Building with Claude...' : `Build ${selectedVersion} Resume for ${company || 'this role'} →`}
          </button>
          {loading && (
            <p className="rb-loading-hint">
              Claude is writing tailored bullets using your Holy Grail rules — usually 15–25 seconds.
            </p>
          )}
        </div>

        {/* ── Results ── */}
        {resume && (
          <div className="rb-results">

            {/* ── ATS Score Cards ── */}
            <div className="rb-ats-card">
              <p className="rb-section-label">ATS Score</p>
              <div className="rb-ats-rings">
                <ScoreRing score={resume.ats_score_before} label="Before" delay="0s" />
                <div className="rb-ats-arrow">→</div>
                <ScoreRing score={resume.ats_score_after}  label="After"  delay="0.15s" />
              </div>
              {resume.keywords_added?.length > 0 && (
                <div className="rb-keywords-row">
                  <span className="rb-keywords-label">Keywords added:</span>
                  <div className="rb-keywords-chips">
                    {resume.keywords_added.map((kw, i) => (
                      <span key={i} className="rb-keyword-chip">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {resume.tailoring_notes && (
                <p className="rb-tailoring-note">✦ {resume.tailoring_notes}</p>
              )}
            </div>

            {/* ── Header ── */}
            <SectionCard
              title="Header"
              copyId="header"
              copyText={[
                resume.header?.name,
                resume.header?.tagline,
                [resume.header?.email, resume.header?.phone, resume.header?.linkedin, resume.header?.location].filter(Boolean).join('  |  ')
              ].filter(Boolean).join('\n')}
              copied={copied}
              onCopy={copy}
            >
              <div className="rb-header-preview">
                <p className="rb-preview-name">{resume.header?.name}</p>
                {resume.header?.tagline && (
                  <p className="rb-preview-tagline">{resume.header.tagline}</p>
                )}
                <p className="rb-preview-contact">
                  {[resume.header?.email, resume.header?.phone, resume.header?.linkedin, resume.header?.location]
                    .filter(Boolean)
                    .join('  ·  ')}
                </p>
              </div>
            </SectionCard>

            {/* ── Summary ── */}
            {resume.summary && (
              <SectionCard
                title="Professional Summary"
                copyId="summary"
                copyText={resume.summary}
                copied={copied}
                onCopy={copy}
              >
                <p className="rb-summary-text">{resume.summary}</p>
              </SectionCard>
            )}

            {/* ── Experience ── */}
            <SectionCard
              title="Experience"
              copyId="exp-all"
              copyText={allExpCopyText()}
              copied={copied}
              onCopy={copy}
            >
              <div className="rb-exp-list">
                {(resume.experience || []).map((job, ji) => (
                  <div key={ji} className="rb-job">
                    <div className="rb-job-header">
                      <div className="rb-job-meta">
                        <span className="rb-job-title">{job.title}</span>
                        <span className="rb-job-sep">—</span>
                        <span className="rb-job-company">{job.company}</span>
                        <span className="rb-job-dates">{job.dates}</span>
                        {job.location && <span className="rb-job-location">· {job.location}</span>}
                      </div>
                      <button
                        className={`rb-copy-btn sm ${copied === `exp-${ji}` ? 'copied' : ''}`}
                        onClick={() => copy(bulletsCopyText(job), `exp-${ji}`)}
                      >
                        {copied === `exp-${ji}` ? '✓' : 'Copy'}
                      </button>
                    </div>
                    <ul className="rb-bullets">
                      {job.bullets.map((b, bi) => (
                        <li key={bi} className="rb-bullet">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Skills ── */}
            <SectionCard
              title="Skills"
              copyId="skills"
              copyText={skillsCopyText()}
              copied={copied}
              onCopy={copy}
            >
              <div className="rb-skills-grid">
                {Object.entries(resume.skills || {}).map(([cat, items], i) => (
                  <div key={i} className="rb-skill-group">
                    <p className="rb-skill-cat">{cat}</p>
                    <div className="rb-skill-chips">
                      {items.map((s, si) => (
                        <span key={si} className="rb-skill-chip">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Education + Certs in a row ── */}
            <div className="rb-two-col">
              <SectionCard
                title="Education"
                copyId="education"
                copyText={(resume.education || []).map(e =>
                  `${e.degree} — ${e.school} (${e.dates})${e.note ? ' · ' + e.note : ''}`
                ).join('\n')}
                copied={copied}
                onCopy={copy}
              >
                {(resume.education || []).map((edu, i) => (
                  <div key={i} className="rb-edu-item">
                    <p className="rb-edu-degree">{edu.degree}</p>
                    <p className="rb-edu-school">{edu.school}</p>
                    <p className="rb-edu-dates">{edu.dates}{edu.note ? ` · ${edu.note}` : ''}</p>
                  </div>
                ))}
              </SectionCard>

              <SectionCard
                title="Certifications"
                copyId="certs"
                copyText={(resume.certifications || []).join('\n')}
                copied={copied}
                onCopy={copy}
              >
                <ul className="rb-cert-list">
                  {(resume.certifications || []).map((c, i) => (
                    <li key={i} className="rb-cert-item">{c}</li>
                  ))}
                </ul>
              </SectionCard>
            </div>

            {/* ── Download ── */}
            <div className="rb-download-wrap">
              <button
                className="rb-download-btn"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading && <span className="spinner" />}
                {downloading ? 'Generating .docx...' : '⬇ Download as Word (.docx)'}
              </button>
              <p className="rb-download-hint">
                Opens directly in Microsoft Word or Google Docs — ready to fine-tune.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
