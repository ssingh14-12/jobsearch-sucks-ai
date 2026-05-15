/**
 * JDBar.jsx — Expandable JD Context Strip
 *
 * Shows on Resume Builder, Bullet Rewriter, LinkedIn Outreach.
 * NOT on Screener (Screener has its own full JD input).
 *
 * Two states:
 *   • No JD loaded  → amber warning bar with inline "Paste JD" button
 *   • JD loaded     → slim cyan bar showing role · company · date + "Change JD"
 *
 * In both cases: clicking the action button expands a textarea
 * inline so the user can paste a JD right here — no navigation needed.
 *
 * Why this matters:
 *   Some users land on Bullet Rewriter or LinkedIn Outreach directly.
 *   They have a JD in hand and just want to work. Forcing them to
 *   navigate to Screener first is friction. This removes that friction.
 */

import { useState } from 'react';
import { useJD } from '../context/JDContext';
import './JDBar.css';

// Simple client-side parser — extracts title and company from raw JD text.
// Not perfect, but good enough until we wire Flask /api/parse-jd.
// Rules: look for common patterns like "Job Title: X" or "at CompanyName".
function quickParse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Job title — first short line that isn't a location/url/label
  let title = '';
  for (const line of lines.slice(0, 8)) {
    if (line.length > 80) continue;
    if (line.toLowerCase().includes('http')) continue;
    if (/^(location|salary|apply|save|full.time|on.site|remote|hybrid)/i.test(line)) continue;
    if (line.length > 4 && line.length < 70) {
      title = line.replace(/^(job title|role|position)[:\-\s]*/i, '').trim();
      break;
    }
  }

  let company = '';

  // 1. LinkedIn format: "Company Name · City, ST" — most reliable
  //    Matches any line where something precedes " · " followed by a capitalised word
  const linkedInLine = text.match(/^([^·\n\d][^·\n]{2,60}?)\s*·\s*[A-Z][a-z]/m);
  if (linkedInLine) {
    const candidate = linkedInLine[1].trim();
    // reject if it looks like a city/state, a date, or the job title itself
    const looksLikeCity = /,\s*[A-Z]{2}$/.test(candidate);
    const isTitle = candidate.toLowerCase() === title.toLowerCase();
    if (!looksLikeCity && !isTitle && candidate.length > 3) {
      company = candidate;
    }
  }

  // 2. "About [Company]" section header
  if (!company) {
    const about = text.match(/About\s+([A-Z][A-Za-z0-9&,\s\-\.]{2,50}?)(?:\s*[-–|,\n:])/);
    if (about) company = about[1].trim();
  }

  // 3. "Hiring Department: University XYZ" or explicit label
  if (!company) {
    const dept = text.match(/(?:company|employer|organization|hiring department)[:\s]+([A-Z][A-Za-z0-9&,\s\-\.]{2,50}?)(?:\n|$)/i);
    if (dept) company = dept[1].trim();
  }

  // 4. Last resort — "at CompanyName" but skip single common words like cities
  if (!company) {
    const at = text.match(/\bat\s+((?:[A-Z][A-Za-z0-9&\-\.]+\s*){2,5})(?:\s*[-–|,\n·])/);
    if (at) company = at[1].trim();
  }

  return { title: title || 'Role', companyName: company || '' };
}

export default function JDBar() {
  const { jobTitle, company, postingDate, loadJD, clearJD } = useJD();

  const [expanded, setExpanded]  = useState(false);   // is the textarea open?
  const [draft, setDraft]        = useState('');       // what the user typed
  const [error, setError]        = useState('');

  function handleLoad() {
    if (!draft.trim()) {
      setError('Paste a job description first.');
      return;
    }

    const { title, companyName } = quickParse(draft);
    loadJD({ rawText: draft, title, companyName, date: '' });
    setExpanded(false);
    setDraft('');
    setError('');
  }

  function handleCancel() {
    setExpanded(false);
    setDraft('');
    setError('');
  }

  return (
    <div className="jdbar-wrap">

      {/* ── Collapsed Strip ── */}
      {!jobTitle ? (
        // No JD loaded — amber warning
        <div className="jdbar jdbar--empty">
          <span className="jdbar-warn-icon">⚠</span>
          <span className="jdbar-warn-text">No job description loaded.</span>
          <button
            className="jdbar-action-btn"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Cancel' : 'Paste JD here →'}
          </button>
        </div>
      ) : (
        // JD loaded — cyan strip
        <div className="jdbar jdbar--loaded">
          <span className="pulse-dot" />
          <span className="jdbar-role">{jobTitle}</span>
          {company    && <><span className="jdbar-sep">·</span><span className="jdbar-company">{company}</span></>}
          {postingDate && <><span className="jdbar-sep">·</span><span className="jdbar-date">{postingDate}</span></>}
          <div className="jdbar-right">
            <button
              className="jdbar-change"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Cancel' : 'Change JD'}
            </button>
            <button className="jdbar-clear" onClick={clearJD} title="Clear JD">✕</button>
          </div>
        </div>
      )}

      {/* ── Expanded Textarea (slides in) ── */}
      {expanded && (
        <div className="jdbar-expanded">
          <textarea
            className="jdbar-textarea"
            placeholder="Paste the full job description here — title, responsibilities, requirements, everything..."
            value={draft}
            onChange={e => { setDraft(e.target.value); setError(''); }}
            rows={8}
            autoFocus
          />
          {error && <p className="jdbar-error">{error}</p>}
          <div className="jdbar-actions">
            <button className="jdbar-load-btn" onClick={handleLoad}>
              Load JD →
            </button>
            <button className="jdbar-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <span className="jdbar-hint">
              Title and company will be extracted automatically.
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
