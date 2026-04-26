/**
 * LinkedInOutreach.jsx — Page 4: LinkedIn Outreach
 *
 * ⚠️ BLOCKED: Do not build real functionality until Soumya
 * drops their real LinkedIn message examples. The AI needs
 * those to match Soumya's voice and style.
 *
 * Shell only for now. Structure is ready, logic is not.
 *
 * When unblocked:
 *   - Suggests who to target (hiring manager, HR, peer, senior leader)
 *   - Per person: LinkedIn search string + connection request + cold email
 *   - Voice baked in from Soumya's real message examples
 *   - Hunter.io for email finding
 *   - User copies + sends manually
 */

import JDBar from '../components/JDBar';
import { useJD } from '../context/JDContext';
import './LinkedInOutreach.css';

export default function LinkedInOutreach() {
  const { jobTitle, company } = useJD();

  return (
    <div className="page-layout">
      <JDBar />
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">LinkedIn Outreach</h1>
          <p className="page-sub">
            Who to reach out to at {company || 'this company'} — and exactly what to say, in your voice.
          </p>
        </div>

        <div className="coming-soon-card blocked">
          <span className="coming-soon-icon">🔒</span>
          <h2>Waiting on One Thing</h2>
          <p>
            This page needs <strong>your real LinkedIn message examples</strong> before it gets built.
            Once you drop those, Claude will extract your tone, structure, and what you never say —
            and bake it into every generated message so it sounds like you, not a template.
          </p>
          <div className="feature-list">
            <div className="feature-item blocked-item">⏳ Drop your real outreach messages to unblock this</div>
            <div className="feature-item"><span className="check">✓</span> Suggests: hiring manager, HR, peer, senior leader</div>
            <div className="feature-item"><span className="check">✓</span> LinkedIn search string per target</div>
            <div className="feature-item"><span className="check">✓</span> Connection request + follow-up + cold email per person</div>
            <div className="feature-item"><span className="check">✓</span> Hunter.io email lookup (25 free/mo)</div>
            <div className="feature-item"><span className="check">✓</span> You copy + send manually — no automation, no ToS risk</div>
          </div>
        </div>
      </div>
    </div>
  );
}
