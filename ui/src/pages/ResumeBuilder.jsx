/**
 * ResumeBuilder.jsx — Page 2: Resume Builder
 *
 * Gets JD from global context (no re-paste needed).
 * Flow:
 *   1. Auto-loads JD + screener results from context
 *   2. Assembles resume using Holy Grail rules
 *   3. Side-by-side: old resume (left) vs new (right)
 *   4. Before → After ATS score
 *   5. Download as Word .docx or PDF
 */

import JDBar from '../components/JDBar';
import { useJD } from '../context/JDContext';
import './ResumeBuilder.css';

export default function ResumeBuilder() {
  const { jobTitle, company } = useJD();

  return (
    <div className="page-layout">
      <JDBar />
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Resume Builder</h1>
          <p className="page-sub">
            Tailored to <strong>{jobTitle || 'your target role'}</strong>
            {company ? ` at ${company}` : ''} — using your Holy Grail rules.
          </p>
        </div>

        <div className="coming-soon-card">
          <span className="coming-soon-icon">🔨</span>
          <h2>Being Built</h2>
          <p>
            This page will show your old resume on the left and the AI-tailored
            version on the right — with ATS score before and after, every change
            highlighted, and one-click Word download.
          </p>
          <div className="feature-list">
            <div className="feature-item"><span className="check">✓</span> JD loaded from Screener automatically</div>
            <div className="feature-item"><span className="check">✓</span> Holy Grail §1–§14 rules applied</div>
            <div className="feature-item"><span className="check">✓</span> Side-by-side diff view</div>
            <div className="feature-item"><span className="check">✓</span> ATS score: before → after</div>
            <div className="feature-item"><span className="check">✓</span> Download as Word .docx</div>
          </div>
        </div>
      </div>
    </div>
  );
}
