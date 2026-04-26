/**
 * BulletRewriter.jsx — Page 3: Bullet Rewriter
 *
 * Calls Flask /rewriter/rewrite → Claude rewrites in Soumya's voice.
 * JD from global context tailors the rewrite to the target role.
 * No JD? Still works — rewrites for general use.
 */

import { useState } from 'react';
import JDBar from '../components/JDBar';
import { useJD } from '../context/JDContext';
import { api } from '../api';
import './BulletRewriter.css';

export default function BulletRewriter() {
  const { jd, jobTitle } = useJD();

  const [bullet, setBullet]   = useState('');
  const [results, setResults] = useState(null);   // { issues_found, versions }
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(null);

  async function handleRewrite() {
    if (!bullet.trim()) return;
    setError('');
    setLoading(true);
    setResults(null);

    try {
      /**
       * POST http://localhost:5000/rewriter/rewrite
       * Body: { weak_bullet: string, jd: string (optional) }
       *
       * Flask returns:
       * { issues_found: string[], versions: [{ bullet, tone, why }] }
       */
      const res = await api.post('/rewriter/rewrite', {
        weak_bullet: bullet,
        jd:          jd || '',   // send JD from context so Claude can tailor the rewrite
      });

      setResults(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach Flask — make sure it is running on port 5000.');
      } else {
        setError(`Rewrite failed: ${msg}`);
      }
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
            Paste a weak bullet. Get 3 rewrites in your voice
            {jobTitle ? `, tailored for ${jobTitle}` : ''} — Holy Grail rules applied.
          </p>
        </div>

        {/* Input Card */}
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
              💡 No JD loaded — rewrites will be general. Paste a JD in the bar above to tailor them to a specific role.
            </p>
          )}

          {error && <p className="screener-error">{error}</p>}

          <button
            className="btn-primary"
            onClick={handleRewrite}
            disabled={loading || !bullet.trim()}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Rewriting with Claude...' : 'Rewrite This Bullet →'}
          </button>
        </div>

        {/* Issues found */}
        {results?.issues_found?.length > 0 && (
          <div className="issues-card">
            <p className="section-label">What's Wrong with the Original</p>
            <ul className="issues-list">
              {results.issues_found.map((issue, i) => (
                <li key={i} className="issue-item">
                  <span className="issue-dot">·</span> {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewritten versions */}
        {results?.versions?.length > 0 && (
          <div className="results-stack">
            {results.versions.map((v, i) => (
              <div key={i} className={`rewrite-card accent-${i}`}>
                <div className="rewrite-top">
                  <span className="rewrite-tone">{v.tone || `Version ${i + 1}`}</span>
                  <button
                    className={`copy-btn ${copied === i ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(v.bullet, i)}
                  >
                    {copied === i ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="rewrite-text">{v.bullet}</p>
                {v.why && <p className="rewrite-why">{v.why}</p>}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
