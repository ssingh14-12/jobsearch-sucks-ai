/**
 * Screener.jsx — Page 1: Job Fit Screener (The Hub)
 *
 * Flow:
 *   1. Paste JD → hits Flask /screener/analyze → Claude runs Holy Grail rules
 *   2. Results: GO/NO GO, score ring, gaps, strong matches, ATS, visa flag
 *   3. "Build My Resume →" carries everything to Page 2
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJD } from '../context/JDContext';
import { api } from '../api';
import './Screener.css';

// Simple client-side extractor — gets company + title from raw JD text
// Flask gives us role_family but not the exact title from the JD itself
function quickParse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let title = '';
  for (const line of lines.slice(0, 8)) {
    if (line.length > 80 || line.toLowerCase().includes('http')) continue;
    if (/^(location|salary|apply|save|full.time|on.site|remote|hybrid)/i.test(line)) continue;
    if (line.length > 4 && line.length < 70) { title = line; break; }
  }

  let company = '';

  // LinkedIn format: "Company Name · City, ST"
  const linkedInLine = text.match(/^([^·\n\d][^·\n]{2,60}?)\s*·\s*[A-Z][a-z]/m);
  if (linkedInLine) {
    const candidate = linkedInLine[1].trim();
    const looksLikeCity = /,\s*[A-Z]{2}$/.test(candidate);
    if (!looksLikeCity && candidate.toLowerCase() !== title.toLowerCase() && candidate.length > 3)
      company = candidate;
  }

  if (!company) {
    const about = text.match(/About\s+([A-Z][A-Za-z0-9&,\s\-\.]{2,50}?)(?:\s*[-–|,\n:])/);
    if (about) company = about[1].trim();
  }

  if (!company) {
    const dept = text.match(/(?:company|employer|organization|hiring department)[:\s]+([A-Z][A-Za-z0-9&,\s\-\.]{2,50}?)(?:\n|$)/i);
    if (dept) company = dept[1].trim();
  }

  if (!company) {
    const at = text.match(/\bat\s+((?:[A-Z][A-Za-z0-9&\-\.]+\s*){2,5})(?:\s*[-–|,\n·])/);
    if (at) company = at[1].trim();
  }

  return { title: title || 'Role', company };
}

export default function Screener() {
  const { jd, loadJD, setScreenResult } = useJD();
  const navigate = useNavigate();

  // Pre-fill if JD already loaded from another page
  const [jdText, setJdText]   = useState(jd || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  async function handleAnalyze() {
    if (!jdText.trim()) { setError('Paste a job description first.'); return; }
    if (jdText.trim().length < 50) { setError('JD is too short — paste the full description.'); return; }
    setError('');
    setLoading(true);
    setResult(null);

    // Extract title + company client-side before calling Flask
    const { title, company } = quickParse(jdText);

    try {
      /**
       * POST http://localhost:5000/screener/analyze
       * Body: { jd_text: string, company_name: string }
       *
       * Flask calls Claude with Holy Grail rules and returns:
       * { decision, decision_reason, match_score, role_family,
       *   base_resume, visa_flag, visa_note, strong_matches,
       *   top_gaps: [{gap, severity}], red_flags }
       */
      const res  = await api.post('/screener/analyze', {
        jd_text:      jdText,
        company_name: company,
      });

      const data = res.data;

      // Write to global JDContext — all other pages can now see this JD
      loadJD({
        rawText:     jdText,
        title:       title || data.role_family || 'Role',
        companyName: company,
        date:        '',
      });

      // Save full screener result — Resume Builder reads this automatically
      setScreenResult(data);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach Flask — make sure it is running on port 5000.');
      } else {
        setError(`Analysis failed: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Colour based on score
  const score      = result?.match_score ?? 0;
  const scoreColor = score >= 8 ? '#10B981' : score >= 6 ? '#F59E0B' : '#EF4444';
  const verdict    = result?.decision ?? '';

  return (
    <div className="screener-page">

      {/* ── Header ── */}
      <div className="screener-header">
        <h1 className="screener-title">Job Fit <span>Screener</span></h1>
        <p className="screener-sub">
          Paste a JD — Claude runs your Holy Grail rules and gives you a GO / NO GO in seconds.
        </p>
      </div>

      {/* ── JD Input ── */}
      <div className="screener-card">
        <label className="field-label">Job Description</label>
        <textarea
          className="jd-textarea"
          placeholder="Paste the full job description — title, responsibilities, requirements, everything..."
          value={jdText}
          onChange={e => setJdText(e.target.value)}
          rows={9}
        />
        {error && <p className="screener-error">⚠ {error}</p>}
        <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Analyzing with Claude...' : 'Analyze This JD →'}
        </button>
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="screener-results">

          {/* ── HERO: Verdict + Score Ring combined ── */}
          <div className={`result-hero result-hero-${verdict === 'GO' ? 'go' : 'nogo'}`}>
            <div className="result-hero-inner">

              {/* Left: Verdict text */}
              <div className="verdict-block">
                <div className="verdict-tag">
                  <span className="verdict-icon">{verdict === 'GO' ? '✦' : '✕'}</span>
                  <span className={`verdict-word ${verdict === 'GO' ? 'verdict-go-color' : 'verdict-nogo-color'}`}>
                    {verdict}
                  </span>
                </div>
                <p className="verdict-reason">{result.decision_reason}</p>
                <div className="verdict-meta">
                  <span className="verdict-pill">📄 {result.role_family}</span>
                  {result.base_resume && (
                    <span className="verdict-pill">🎯 {result.base_resume}</span>
                  )}
                </div>
              </div>

              {/* Right: Score Ring */}
              <div className="score-ring-wrap">
                <svg viewBox="0 0 100 100" className="score-ring-svg" style={{ color: scoreColor }}>
                  <circle cx="50" cy="50" r="36" className="ring-track" />
                  <circle
                    cx="50" cy="50" r="36"
                    className="ring-fill"
                    stroke={scoreColor}
                    strokeDasharray="226.2"
                    strokeDashoffset={226.2 - (226.2 * score / 10)}
                  />
                </svg>
                <div className="score-ring-center">
                  <span className="score-num" style={{ color: scoreColor }}>{score}</span>
                  <span className="score-den">/ 10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gaps */}
          {result.top_gaps?.length > 0 && (
            <div className="result-section">
              <p className="section-label">Gaps to Bridge</p>
              <ul className="gap-list">
                {result.top_gaps.map((g, i) => (
                  <li key={i} className="gap-item">
                    <span className={`badge badge-${g.severity === 'HIGH' ? 'nogo' : g.severity === 'MEDIUM' ? 'warn' : 'gray'}`}>
                      {g.severity}
                    </span>
                    {g.gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strong Matches */}
          {result.strong_matches?.length > 0 && (
            <div className="result-section">
              <p className="section-label">Strong Matches</p>
              <div className="chip-row">
                {result.strong_matches.map((m, i) => (
                  <span key={i} className="chip chip-go">{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {result.red_flags?.length > 0 && (
            <div className="result-section">
              <p className="section-label">Red Flags</p>
              <div className="gap-list">
                {result.red_flags.map((f, i) => (
                  <div key={i} className="red-flag-item">⚑ {f}</div>
                ))}
              </div>
            </div>
          )}

          {/* Visa — always shown so you never miss a sponsorship issue */}
          {result.visa_flag && (
            <div className={`visa-flag visa-flag-${result.visa_flag === 'SKIP' ? 'skip' : result.visa_flag === 'CLEAR' ? 'clear' : 'check'}`}>
              <span className="visa-icon">
                {result.visa_flag === 'SKIP'  && '🚫'}
                {result.visa_flag === 'CHECK REQUIRED' && '⚠️'}
                {result.visa_flag === 'CLEAR' && '✅'}
              </span>
              <div className="visa-body">
                <span className="visa-label">
                  {result.visa_flag === 'SKIP'  && 'No Sponsorship — Skip'}
                  {result.visa_flag === 'CHECK REQUIRED' && 'Visa Check Required'}
                  {result.visa_flag === 'CLEAR' && 'Sponsorship Likely'}
                </span>
                <span className="visa-note">{result.visa_note}</span>
              </div>
            </div>
          )}

          {/* CTA */}
          {score >= 6 && (
            <button className="btn-primary btn-cta" onClick={() => navigate('/resume')}>
              Build My Resume →
            </button>
          )}

        </div>
      )}
    </div>
  );
}
