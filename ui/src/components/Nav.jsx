/**
 * Nav.jsx — Persistent Top Navigation Bar
 *
 * Shows on every page. Reads background task state from JDContext
 * and shows live indicators on nav links:
 *   - Amber pulsing dot  → task is running in background
 *   - Green solid dot    → task finished with a new result waiting
 *   - Nothing            → idle or already seen
 */

import { NavLink, useLocation } from 'react-router-dom';
import { useJD } from '../context/JDContext';
import './Nav.css';

// Small dot that appears next to a nav link
function TaskDot({ status, seenByUser, isCurrentPage }) {
  // Running: always show amber pulse, even on the current page
  if (status === 'loading') {
    return <span className="nav-task-dot loading" title="Running in background…" />;
  }
  // Done but user hasn't visited the page yet — show green
  if (status === 'done' && !seenByUser && !isCurrentPage) {
    return <span className="nav-task-dot done" title="New result ready!" />;
  }
  return null;
}

export default function Nav() {
  const location = useLocation();
  const {
    jobTitle, company,
    resumeTask, outreachTask,
  } = useJD();

  const onResume   = location.pathname === '/resume';
  const onOutreach = location.pathname === '/outreach';

  return (
    <nav className="nav">
      {/* Left: Logo / Brand */}
      <div className="nav-brand">
        <span className="nav-logo-mark">JSS</span>
        <span className="nav-logo-text">Job Search <span className="nav-accent">Sucks</span></span>
      </div>

      {/* Center: Page Links */}
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Screener
        </NavLink>

        <NavLink to="/resume" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-link-inner">
            Resume Builder
            <TaskDot
              status={resumeTask.status}
              seenByUser={resumeTask.seenByUser}
              isCurrentPage={onResume}
            />
          </span>
        </NavLink>

        <NavLink to="/rewriter" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Bullet Rewriter
        </NavLink>

        <NavLink to="/outreach" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-link-inner">
            LinkedIn Outreach
            <TaskDot
              status={outreachTask.status}
              seenByUser={outreachTask.seenByUser}
              isCurrentPage={onOutreach}
            />
          </span>
        </NavLink>
      </div>

      {/* Right: Active JD context pill */}
      <div className="nav-right">
        {jobTitle ? (
          <div className="nav-jd-pill">
            <span className="pulse-dot" />
            <span>{jobTitle}{company ? ` · ${company}` : ''}</span>
          </div>
        ) : (
          <span className="nav-jd-empty">No JD loaded</span>
        )}
      </div>
    </nav>
  );
}
