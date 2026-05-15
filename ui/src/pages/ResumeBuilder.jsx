/**
 * ResumeBuilder.jsx — Page 2: Resume Builder
 *
 * Flow:
 *   1. JD + screener result auto-loaded from JDContext
 *   2. User picks version (V1–V8), hits Generate
 *   3. Side-by-side: LEFT = live document preview, RIGHT = chat + controls
 *   4. Chat box lets user refine with natural language — preview updates live
 *   5. Download Word (.docx) or PDF (browser print) when satisfied
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJD } from '../context/JDContext';
import { api } from '../api';
import JDBar from '../components/JDBar';
import ResumePreview from '../components/ResumePreview';
import './ResumeBuilder.css';

// ── Version definitions ──────────────────────────────────────────────────────
const VERSIONS = [
  { key: 'V1', label: 'Business & BI Analyst',          desc: 'BA, BI Analyst, Data Analyst, Systems Analyst',        color: '#00C8E0' },
  { key: 'V2', label: 'Business Operations Analyst',     desc: 'BizOps Analyst, Operations Analyst, Revenue Ops',      color: '#F59E0B' },
  { key: 'V3', label: 'SaaS Implementation Consultant',  desc: 'Impl Consultant, Solutions Consultant, SaaS PM',       color: '#8B5CF6' },
  { key: 'V4', label: 'Technical Program Manager',       desc: 'TPM, IT PM, Engineering PM, SAFe PM',                  color: '#10B981' },
  { key: 'V5', label: 'Product Analyst',                 desc: 'Product Analyst, Product Ops, Growth Analyst',         color: '#EC4899' },
  { key: 'V6', label: 'Cloud Project Manager',           desc: 'Cloud PM, Azure PM, DevOps PM, Infrastructure PM',     color: '#3B82F6' },
  { key: 'V7', label: 'Scrum Master',                    desc: 'Scrum Master, Agile Coach, RTE, Delivery Lead',        color: '#EF4444' },
  { key: 'V8', label: 'BizOps Manager',                  desc: 'BizOps Manager, Strategy Ops Lead, Program Ops Mgr',  color: '#14B8A6' },
];

// Quick-action prompts for the chat
const QUICK_ACTIONS = [
  'Make the Accenture bullets more concise',
  'Add a stronger opening to the summary',
  'Emphasize stakeholder management more',
  'Make bullets more metric-heavy',
  'Rewrite the Saayam bullets for this JD',
  'Shorten bullets to under 35 words each',
];

function extractVersionKey(baseResume) {
  if (!baseResume) return null;
  const match = (baseResume || '').match(/V[1-8]/);
  return match ? match[0] : null;
}

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

// ── ATS Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, label }) {
  const color  = score >= 80 ? '#10B981' : score >= 65 ? '#F59E0B' : '#EF4444';
  const radius = 28;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (circ * score / 100);
  return (
    <div className="ats-ring-wrap">
      <svg viewBox="0 0 72 72" className="ats-ring-svg" style={{ color }}>
        <circle cx="36" cy="36" r={radius} className="ats-ring-track" />
        <circle cx="36" cy="36" r={radius} className="ats-ring-fill"
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="ats-ring-center">
        <span className="ats-ring-num" style={{ color }}>{score}</span>
        <span className="ats-ring-pct">%</span>
      </div>
      <p className="ats-ring-label">{label}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResumeBuilder() {
  const {
    jd, jobTitle, company, screenResult,
    resumeTask, patchResumeTask, markResumeSeen,
  } = useJD();
  const navigate = useNavigate();
  const { copied, copy } = useCopy();
  const previewRef = useRef(null);

  // Destructure the shared task state
  const { status: taskStatus, resume, chatHistory, error, version: taskVersion } = resumeTask;
  const loading = taskStatus === 'loading';

  const recommended = extractVersionKey(screenResult?.base_resume);
  // selectedVersion is still local (UI preference, doesn't need to be global)
  const [selectedVersion, setSelectedVersion] = useState(taskVersion || recommended || 'V1');

  // Local-only UI state (ephemeral, fine to lose on nav)
  const [downloading, setDownloading] = useState(false);
  const [chatInput, setChatInput]     = useState('');
  const [refining, setRefining]       = useState(false);
  const [refineError, setRefineError] = useState('');
  const chatEndRef = useRef(null);

  // Mark as seen every time user is on this page and task is done
  useEffect(() => {
    if (taskStatus === 'done') markResumeSeen();
  }, [taskStatus, markResumeSeen]);

  // Helpers to update context task state
  function setResume(r)      { patchResumeTask({ resume: r }); }
  function setError(e)       { patchResumeTask({ error: e }); }
  function setChatHistory(h) { patchResumeTask({ chatHistory: typeof h === 'function' ? h(chatHistory) : h }); }

  // ── Generate ───────────────────────────────────────────────────────────────
  async function handleBuild() {
    if (!jd) { setError('Load a job description first — use the bar above.'); return; }
    // Write to context: mark as loading, clear old resume + chat
    patchResumeTask({
      status: 'loading',
      resume: null,
      chatHistory: [],
      error: '',
      version: selectedVersion,
      seenByUser: true, // user is on this page right now
    });

    try {
      const res = await api.post('/resume/build', {
        jd_text:        jd,
        resume_version: selectedVersion,
        company_name:   company,
      });
      // Write result to context — survives navigation
      patchResumeTask({ status: 'done', resume: res.data, error: '' });
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      patchResumeTask({
        status: 'error',
        error: err.code === 'ERR_NETWORK'
          ? 'Cannot reach Flask — make sure it is running on port 5000.'
          : `Build failed: ${msg}`,
      });
    }
  }

  // ── Refine via chat ────────────────────────────────────────────────────────
  const handleRefine = useCallback(async (instruction) => {
    if (!instruction.trim() || !resume) return;
    setRefineError('');
    setRefining(true);
    setChatInput('');

    try {
      const res = await api.post('/resume/refine', {
        resume,
        instruction: instruction.trim(),
        conversation_history: chatHistory,
      });
      const updated = res.data;
      const newTurn = {
        instruction: instruction.trim(),
        change_summary: updated.change_summary || 'Applied your changes.',
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      // Write both updated resume AND new chat turn to context
      patchResumeTask({
        resume: updated,
        chatHistory: [...chatHistory, newTurn],
      });
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setRefineError(`Refinement failed: ${msg}`);
    } finally {
      setRefining(false);
    }
  }, [resume, chatHistory, patchResumeTask]);

  // ── Download Word ──────────────────────────────────────────────────────────
  async function handleDownloadWord() {
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
      setError('Word download failed — check Flask is running.');
    } finally {
      setDownloading(false);
    }
  }

  // ── Download PDF via browser print ────────────────────────────────────────
  function handleDownloadPDF() {
    if (!previewRef.current) return;
    const content  = previewRef.current.innerHTML;
    const printWin = window.open('', '_blank', 'width=900,height=700');
    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Resume — ${company || 'Soumya Singh'}</title>
  <link rel="stylesheet" href="${window.location.origin}/src/components/ResumePreview.css">
  <style>
    body { margin: 0; padding: 0; background: white; }
    @media print {
      body { margin: 0; }
      @page { margin: 0.5in; size: letter portrait; }
    }
  </style>
</head>
<body>
  <div class="rp-page">${content}</div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`);
    printWin.document.close();
  }

  const versionObj = VERSIONS.find(v => v.key === selectedVersion) || VERSIONS[0];

  // ── No JD ──────────────────────────────────────────────────────────────────
  if (!jd) {
    return (
      <div className="page-layout">
        <JDBar />
        <div className="page-content">
          <div className="rb-no-jd">
            <div className="rb-no-jd-icon">📋</div>
            <h2>No Job Description Loaded</h2>
            <p>Paste a JD in the bar above, or run the Screener first to get a version recommendation.</p>
            <button className="rb-btn-secondary" onClick={() => navigate('/screener')}>Go to Screener →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pre-generate view ──────────────────────────────────────────────────────
  if (!resume) {
    return (
      <div className="page-layout">
        <JDBar />
        <div className="page-content rb-page">

          <div className="rb-header">
            <h1 className="rb-title">Resume <span>Builder</span></h1>
            <p className="rb-sub">
              Tailoring for <strong>{jobTitle || 'this role'}</strong>
              {company ? ` at ${company}` : ''} — Holy Grail rules on every bullet.
            </p>
          </div>

          {/* Version selector */}
          <div className="rb-version-wrap">
            <p className="rb-section-label">
              Resume Version
              {recommended && (
                <span className="rb-recommended-badge">✦ Screener recommends {recommended}</span>
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

          {/* Screener context */}
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
                <span className="rb-context-key">Recommended</span>
                <span className="rb-context-val" style={{ color: versionObj.color }}>{screenResult.base_resume}</span>
              </div>
            </div>
          )}

          {/* Generate button */}
          <div className="rb-build-wrap">
            {error && <p className="rb-error">⚠ {error}</p>}
            <button className="rb-build-btn" onClick={handleBuild} disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Building with Claude...' : `Build ${selectedVersion} Resume →`}
            </button>
            {loading && (
              <p className="rb-loading-hint">
                Claude is writing tailored bullets with your Holy Grail rules — usually 15–25 seconds.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Post-generate: side-by-side view ──────────────────────────────────────
  return (
    <div className="page-layout">
      <JDBar />

      {/* Top bar — version info + rebuild */}
      <div className="rb-topbar">
        <div className="rb-topbar-left">
          <span className="rb-topbar-version" style={{ color: versionObj.color }}>
            {selectedVersion}: {versionObj.label}
          </span>
          {company && <span className="rb-topbar-company">— {company}</span>}
        </div>
        <div className="rb-topbar-right">
          <button className="rb-rebuild-btn" onClick={() => patchResumeTask({ status: 'idle', resume: null, chatHistory: [], error: '' })}>
            ← Change Version
          </button>
          <button className="rb-build-btn sm" onClick={handleBuild} disabled={loading}>
            {loading && <span className="spinner sm" />}
            {loading ? 'Rebuilding...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Side-by-side layout */}
      <div className="rb-split">

        {/* LEFT: Document preview */}
        <div className="rb-preview-panel">
          <div className="rb-preview-header">
            <span className="rb-preview-label">Document Preview</span>
            <div className="rb-preview-actions">
              <button className="rb-dl-btn word" onClick={handleDownloadWord} disabled={downloading}>
                {downloading ? '...' : '⬇ Word'}
              </button>
              <button className="rb-dl-btn pdf" onClick={handleDownloadPDF}>
                ⬇ PDF
              </button>
            </div>
          </div>
          <div className="rb-preview-scroll">
            <div className="rb-preview-paper">
              <ResumePreview resume={resume} ref={previewRef} />
            </div>
          </div>
        </div>

        {/* RIGHT: Chat + ATS + info */}
        <div className="rb-right-panel">

          {/* ATS scores */}
          <div className="rb-ats-mini">
            <ScoreRing score={resume.ats_score_before} label="Before" />
            <div className="rb-ats-arrow">→</div>
            <ScoreRing score={resume.ats_score_after}  label="After" />
            <div className="rb-ats-info">
              {resume.keywords_added?.length > 0 && (
                <div className="rb-kw-chips">
                  {resume.keywords_added.map((kw, i) => (
                    <span key={i} className="rb-kw-chip">{kw}</span>
                  ))}
                </div>
              )}
              {resume.tailoring_notes && (
                <p className="rb-tailoring-note">✦ {resume.tailoring_notes}</p>
              )}
            </div>
          </div>

          {/* Chat refinement */}
          <div className="rb-chat-panel">
            <p className="rb-chat-label">Refine with Claude</p>

            {/* Quick action chips */}
            <div className="rb-quick-chips">
              {QUICK_ACTIONS.map((q, i) => (
                <button key={i} className="rb-quick-chip" onClick={() => handleRefine(q)} disabled={refining}>
                  {q}
                </button>
              ))}
            </div>

            {/* Chat history */}
            {chatHistory.length > 0 && (
              <div className="rb-chat-history">
                {chatHistory.map((h, i) => (
                  <div key={i} className="rb-chat-turn">
                    <div className="rb-chat-user">
                      <span className="rb-chat-bubble user">{h.instruction}</span>
                      <span className="rb-chat-ts">{h.ts}</span>
                    </div>
                    <div className="rb-chat-claude">
                      <span className="rb-chat-bubble claude">✦ {h.change_summary}</span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {refineError && <p className="rb-error">{refineError}</p>}

            {/* Input */}
            <div className="rb-chat-input-wrap">
              <textarea
                className="rb-chat-input"
                placeholder='e.g. "Add Workato to skills" or "Rewrite Accenture bullet 2 to focus on stakeholder impact"'
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleRefine(chatInput);
                  }
                }}
                rows={2}
                disabled={refining}
              />
              <button
                className="rb-chat-send"
                onClick={() => handleRefine(chatInput)}
                disabled={refining || !chatInput.trim()}
              >
                {refining ? <span className="spinner dark" /> : '→'}
              </button>
            </div>
            <p className="rb-chat-hint">Enter to send · Shift+Enter for new line · Preview updates live</p>
          </div>

          {/* Download section */}
          <div className="rb-download-section">
            <p className="rb-section-label" style={{ marginBottom: '0.625rem' }}>Download</p>
            <div className="rb-download-btns">
              <button className="rb-download-btn word" onClick={handleDownloadWord} disabled={downloading}>
                {downloading && <span className="spinner dark" />}
                {downloading ? 'Generating...' : '⬇ Download Word (.docx)'}
              </button>
              <button className="rb-download-btn pdf" onClick={handleDownloadPDF}>
                ⬇ Save as PDF
              </button>
            </div>
            <p className="rb-download-hint">
              Word opens in Microsoft Word / Google Docs. PDF uses your browser's print dialog — choose "Save as PDF".
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
