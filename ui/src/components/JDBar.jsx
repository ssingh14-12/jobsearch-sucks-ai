/**
 * JDBar.jsx — Collapsed JD Context Strip
 *
 * Shows on Resume Builder, Bullet Rewriter, LinkedIn Outreach.
 * NOT on Screener (that's where the JD gets pasted).
 *
 * If no JD is loaded yet, shows a warning with a link back to Screener.
 * If JD is loaded, shows a slim bar: role · company · date
 */

import { Link } from 'react-router-dom';
import { useJD } from '../context/JDContext';
import './JDBar.css';

export default function JDBar() {
  const { jobTitle, company, postingDate } = useJD();

  if (!jobTitle) {
    return (
      <div className="jdbar jdbar--empty">
        <span>⚠️ No job description loaded.</span>
        <Link to="/" className="jdbar-link">Go to Screener to paste one →</Link>
      </div>
    );
  }

  return (
    <div className="jdbar jdbar--loaded">
      <span className="pulse-dot" />
      <span className="jdbar-role">{jobTitle}</span>
      {company && <><span className="jdbar-sep">·</span><span className="jdbar-company">{company}</span></>}
      {postingDate && <><span className="jdbar-sep">·</span><span className="jdbar-date">{postingDate}</span></>}
      <Link to="/" className="jdbar-change">Change JD</Link>
    </div>
  );
}
