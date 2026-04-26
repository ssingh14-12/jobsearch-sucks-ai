/**
 * Nav.jsx — Persistent Top Navigation Bar
 *
 * Shows on every page. Lets the user switch between the 4 pages
 * without the browser ever doing a full reload.
 *
 * NavLink from react-router-dom automatically adds an "active" class
 * to the current page's link — we use that to highlight it.
 */

import { NavLink } from 'react-router-dom';
import { useJD } from '../context/JDContext';
import './Nav.css';

export default function Nav() {
  const { jobTitle, company } = useJD();

  return (
    <nav className="nav">
      {/* Left: Logo / Brand */}
      <div className="nav-brand">
        <span className="nav-logo-mark">JS</span>
        <span className="nav-logo-text">JobSearch<span className="nav-accent">.AI</span></span>
      </div>

      {/* Center: Page Links */}
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Screener
        </NavLink>
        <NavLink to="/resume" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Resume Builder
        </NavLink>
        <NavLink to="/rewriter" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Bullet Rewriter
        </NavLink>
        <NavLink to="/outreach" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          LinkedIn Outreach
        </NavLink>
      </div>

      {/* Right: Active JD context pill (shows what job you're working on) */}
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
