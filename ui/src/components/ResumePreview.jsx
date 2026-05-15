/**
 * ResumePreview.jsx
 *
 * Renders a resume JSON as a styled document that looks exactly like
 * Soumya's real resume PDFs. Used for side-by-side preview AND for
 * print-to-PDF (the printable ref is forwarded from the parent).
 *
 * Layout mirrors the real vault resumes:
 *   - Centered name (bold, large)
 *   - Centered tagline
 *   - Centered contact line
 *   - Section headers: ALL CAPS + bottom border rule
 *   - Experience: Title — Company (dates right-aligned)
 *   - Bullets: indented, tight
 *   - Education + Certs: same header style
 *   - Skills: bold category: items inline
 */

import { forwardRef } from 'react';
import './ResumePreview.css';

const ResumePreview = forwardRef(function ResumePreview({ resume }, ref) {
  if (!resume) return null;

  const { header, summary, experience, education, certifications, skills } = resume;

  const contactParts = [
    header?.phone,
    header?.email,
    header?.linkedin,
    header?.location,
  ].filter(Boolean);

  return (
    <div className="rp-page" ref={ref}>

      {/* ── Header ── */}
      <div className="rp-header">
        <p className="rp-name">{header?.name || 'Soumya Singh, PMP, CSPO'}</p>
        {header?.tagline && <p className="rp-tagline">{header.tagline}</p>}
        <p className="rp-contact">{contactParts.join('  |  ')}</p>
      </div>

      {/* ── Education (real resumes put Education before Experience) ── */}
      {education?.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-heading">Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="rp-edu-row">
              <div className="rp-edu-left">
                <span className="rp-edu-school">{edu.school}</span>
                <span className="rp-edu-degree">{edu.degree}</span>
              </div>
              <span className="rp-edu-dates">{edu.dates}</span>
            </div>
          ))}
        </section>
      )}

      {/* ── Experience ── */}
      {experience?.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-heading">Experience</h2>
          {experience.map((job, ji) => (
            <div key={ji} className="rp-job">
              <div className="rp-job-header">
                <span className="rp-job-title-company">
                  <strong>{job.title}</strong>
                  {job.company && <span className="rp-job-sep"> | {job.company}</span>}
                  {job.location && <span className="rp-job-loc">, {job.location}</span>}
                </span>
                <span className="rp-job-dates">{job.dates}</span>
              </div>
              <ul className="rp-bullets">
                {(job.bullets || []).map((b, bi) => (
                  <li key={bi}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ── Skills ── */}
      {skills && Object.keys(skills).length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-heading">Skills</h2>
          <div className="rp-skills">
            {Object.entries(skills).map(([cat, items], i) => (
              <p key={i} className="rp-skill-line">
                <strong>{cat}:</strong> {items.join(', ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── Certifications ── */}
      {certifications?.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-heading">Certifications</h2>
          {certifications.map((cert, i) => (
            <div key={i} className="rp-cert-row">
              <span>{cert}</span>
            </div>
          ))}
        </section>
      )}

      {/* ── Summary (shown if present — some versions include it) ── */}
      {summary && (
        <section className="rp-section rp-summary-section">
          <h2 className="rp-section-heading">Professional Summary</h2>
          <p className="rp-summary-text">{summary}</p>
        </section>
      )}

    </div>
  );
});

export default ResumePreview;
