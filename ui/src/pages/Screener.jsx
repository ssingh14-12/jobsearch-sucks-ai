/**
 * Screener.jsx — Page 1: Job Fit Screener (The Hub)
 *
 * This is the first page every user lands on.
 * Flow:
 *   1. Paste JD → stored in JDContext (global)
 *   2. Upload vault (resumes, Holy Grail, LinkedIn PDF)
 *   3. Hit Analyze → Flask API runs Holy Grail rules
 *   4. Results: GO/NO GO, score ring, gaps, ATS check
 *   5. Chatbot for follow-up questions
 *   6. "Build My Resume →" carries everything to Page 2
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJD } from '../context/JDContext';
import './Screener.css';

export default function Screener() {
  const { jd, loadJD } = useJD();
  const navigate = useNavigate();

  // Pre-fill with any JD already loaded (e.g. user pasted it on another page first)
  const [jdText, setJdText]     = useState(jd || '');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  async function handleAnalyze() {
    if (!jdText.trim()) {
      setError('Paste a job description first.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // TODO: replace with real API call to Flask /api/screen
      // const res = await axios.post('http://localhost:5000/api/screen', { jd: jdText });
      // const data = res.data;

      // Mock result for now — remove when Flask API is ready
      await new Promise(r => setTimeout(r, 1500));
      const data = {
        score: 8,
        verdict: 'GO',
        jobTitle: 'Product Manager',
        company: 'Salesforce',
        postingDate: 'Apr 20, 2026',
        closestResume: 'V5: BA / Salesforce & AI',
        gaps: ['Salesforce CPQ experience', 'Enterprise B2B sales cycle'],
        strongMatches: ['Agile delivery', 'Stakeholder management', 'Power BI'],
        visaFlag: false,
        atsScore: 74,
      };

      // Write to global JD context so all pages can see it
      loadJD({
        rawText: jdText,
        title: data.jobTitle,
        companyName: data.company,
        date: data.postingDate,
      });

      setResult(data);
    } catch (err) {
      setError('Something went wrong. Is Flask running on port 5000?');
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result
    ? result.score >= 8 ? '#10B981'
    : result.score >= 6 ? '#F59E0B'
    : '#EF4444'
    : '#5A5A78';

  return (
    <div className="screener-page">

      {/* ── Hero Header ── */}
      <div className="screener-header">
        <h1 className="screener-title">Job Fit Screener</h1>
        <p className="screener-sub">Paste a JD. Get a GO / NO GO in seconds — powered by your Holy Grail rules.</p>
      </div>

      {/* ── JD Input ── */}
      <div className="screener-card">
        <label className="field-label">Job Description</label>
        <textarea
          className="jd-textarea"
          placeholder="Paste the full job description here — title, responsibilities, requirements, everything..."
          value={jdText}
          onChange={e => setJdText(e.target.value)}
          rows={10}
        />
        {error && <p className="screener-error">{error}</p>}
        <button
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Analyzing...' : 'Analyze This JD →'}
        </button>
      </div>

      {/* ── Results (shown after analysis) ── */}
      {result && (
        <div className="screener-results">

          {/* Verdict Banner */}
          <div className={`verdict-banner verdict-${result.verdict.toLowerCase()}`}>
            <span className="verdict-label">{result.verdict}</span>
            <span className="verdict-sub">
              {result.verdict === 'GO'
                ? `Score ${result.score}/10 · ${result.company} · ${result.closestResume}`
                : `Score ${result.score}/10 · Too many gaps to bridge cleanly`}
            </span>
          </div>

          {/* Score Ring */}
          <div className="score-ring-wrap">
            <svg viewBox="0 0 100 100" className="score-ring-svg">
              <circle cx="50" cy="50" r="36" className="ring-bg" />
              <circle
                cx="50" cy="50" r="36"
                className="ring-fill"
                stroke={scoreColor}
                strokeDasharray="226.2"
                strokeDashoffset={226.2 - (226.2 * result.score / 10)}
              />
            </svg>
            <div className="score-ring-text">
              <span className="score-number" style={{ color: scoreColor }}>{result.score}</span>
              <span className="score-denom">/10</span>
            </div>
          </div>

          {/* Gap Analysis */}
          {result.gaps.length > 0 && (
            <div className="result-section">
              <p className="section-label">Gaps to Bridge</p>
              <ul className="gap-list">
                {result.gaps.map(g => (
                  <li key={g} className="gap-item">
                    <span className="badge badge-warn">Gap</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strong Matches */}
          {result.strongMatches.length > 0 && (
            <div className="result-section">
              <p className="section-label">Strong Matches</p>
              <div className="chip-row">
                {result.strongMatches.map(m => (
                  <span key={m} className="chip chip-go">{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* ATS Score */}
          <div className="result-section">
            <p className="section-label">ATS Keyword Match</p>
            <div className="ats-bar-wrap">
              <div className="ats-bar" style={{ width: `${result.atsScore}%`, background: scoreColor }} />
            </div>
            <p className="ats-label">{result.atsScore}% keyword coverage</p>
          </div>

          {/* Visa Flag */}
          {result.visaFlag && (
            <div className="visa-flag">
              ⚠️ This role may not support visa sponsorship. Verify on myvisajobs.com before applying.
            </div>
          )}

          {/* CTA */}
          {result.score >= 6 && (
            <button className="btn-primary btn-cta" onClick={() => navigate('/resume')}>
              Build My Resume →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
