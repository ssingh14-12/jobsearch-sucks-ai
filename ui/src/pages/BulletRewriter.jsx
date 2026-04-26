/**
 * BulletRewriter.jsx — Page 3: Bullet Rewriter
 *
 * Gets JD from global context — no re-paste.
 * User pastes a weak bullet → gets 3–5 rewrites in their voice,
 * tailored to the JD, Holy Grail rules applied.
 */

import { useState } from 'react';
import JDBar from '../components/JDBar';
import { useJD } from '../context/JDContext';
import './BulletRewriter.css';

export default function BulletRewriter() {
  const { jd, jobTitle } = useJD();
  const [bullet, setBullet]     = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(null);

  async function handleRewrite() {
    if (!bullet.trim()) return;
    setLoading(true);

    try {
      // TODO: replace with real Flask API call
      // const res = await axios.post('http://localhost:5000/api/rewrite', { bullet, jd });
      await new Promise(r => setTimeout(r, 1200));

      // Mock results — remove when Flask is wired
      setResults([
        {
          id: 1,
          text: 'Reduced client onboarding time by 32% across 11 enterprise releases by standardizing BRD templates and coordinating UAT sign-off across 3 cross-functional teams.',
          tone: 'Outcome-first',
        },
        {
          id: 2,
          text: 'Accelerated deployment reliability by 30% through CI/CD pipeline improvements in Azure DevOps, eliminating 10 recurring defect patterns across quarterly releases.',
          tone: 'Technical depth',
        },
        {
          id: 3,
          text: 'Cut repeat escalations by 43% by building a defect tracking framework adopted across 3 teams — translating raw QA data into actionable pattern reports for 50+ stakeholders.',
          tone: 'Stakeholder-focused',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="page-layout">
      <JDBar />
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Bullet Rewriter</h1>
          <p className="page-sub">
            Paste a weak bullet. Get 3–5 rewrites in your voice
            {jobTitle ? `, tailored for ${jobTitle}` : ''} — Holy Grail rules applied.
          </p>
        </div>

        <div className="rewriter-card">
          <label className="field-label">Your Original Bullet</label>
          <textarea
            className="bullet-textarea"
            placeholder="Paste the bullet you want to improve..."
            value={bullet}
            onChange={e => setBullet(e.target.value)}
            rows={4}
          />
          {!jd && (
            <p className="rewriter-note">
              💡 Tip: Go to Screener and paste a JD first — rewrites will be tailored to that role.
            </p>
          )}
          <button className="btn-primary" onClick={handleRewrite} disabled={loading || !bullet.trim()}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Rewriting...' : 'Rewrite This Bullet →'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="results-stack">
            {results.map((r, i) => (
              <div key={r.id} className={`rewrite-card accent-${i}`}>
                <div className="rewrite-top">
                  <span className="rewrite-tone">{r.tone}</span>
                  <button
                    className={`copy-btn ${copied === r.id ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(r.text, r.id)}
                  >
                    {copied === r.id ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="rewrite-text">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
