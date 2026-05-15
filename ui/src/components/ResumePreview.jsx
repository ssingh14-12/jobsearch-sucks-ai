/**
 * ResumePreview.jsx
 *
 * Renders resume JSON as a styled document that matches Soumya's actual
 * resume PDFs exactly. Used for the side-by-side preview AND print-to-PDF.
 *
 * Section order (matches real vault PDFs):
 *   1. Header: Name → Contact line → Tagline (pipe-separated specialties)
 *   2. EDUCATION
 *   3. EXPERIENCE
 *   4. LEADERSHIP PROGRAMS AND PROJECTS
 *   5. SKILLS
 *   6. CERTIFICATIONS
 *
 * No summary/objective section — ever.
 */

import { forwardRef } from 'react';
import './ResumePreview.css';

const ResumePreview = forwardRef(function ResumePreview({ resume }, ref) {
  if (!resume) return null;

  const { header, experience, education, projects, skills, certifications } = resume;

  // Contact line: location | phone | email | linkedin
  const contactParts = [
    header?.location,
    header?.phone,
    header?.email,
    header?.linkedin,
  ].filter(Boolean);

  return (
    <div className="rp-page" ref={ref}>

      {/* ── Header ── */}
      <div className="rp-header">
        <p className="rp-name">{header?.name || 'Soumya Singh, PMP, CSPO'}</p>
        <p className="rp-contact">{contactParts.join('  |  ')}</p>
        {header?.tagline && <p className="rp-tagline">{header.tagline}</p>}
      </div>

      {/* ── 1. Education ── */}
      {education?.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-heading">Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="rp-edu-entry">
              {/* Row 1: School name left, city right */}
              <div className="rp-edu-row">
                <span className="rp-edu-school">{edu.school}</span>
                <span className="rp-edu-city">{edu.city}</span>
              </div>
              {/* Row 2: Degree left, date right */}
              <div className="rp-edu-row">
                <span className="rp-edu-degree">{edu.degree}</span>
                <span className="rp-edu-dates">{edu.dates}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── 2. Experience ── */}
      {experience?.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-heading">Experience</h2>
          {experience.map((job, ji) => (
            <div key={ji} className="rp-job">
              {/* Single header line: "Title | Company, Location"  +  Date right */}
              <div className="rp-job-header">
                <span className="rp-job-title-line">
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

      {/* ── 3. Leadership Programs and Projects ── */}
      {projects?.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-heading">Leadership Programs and Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} className="rp-project">
              <div className="rp-project-header">
                <strong className="rp-project-name">{proj.name}</strong>
                <span className="rp-project-date">{proj.date}</span>
              </div>
              {proj.bullet && (
                <ul className="rp-bullets">
                  <li>{proj.bullet}</li>
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── 4. Skills ── */}
      {skills && Object.keys(skills).length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-heading">Skills</h2>
          <div className="rp-skills">
            {Object.entries(skills).map(([cat, items], i) => (
              <p key={i} className="rp-skill-line">
                <strong>{cat}:</strong>{' '}
                {Array.isArray(items) ? items.join(', ') : items}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. Certifications ── */}
      {certifications?.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-heading">Certifications</h2>
          {certifications.map((cert, i) => {
            // Support both object {name, date} and legacy plain strings
            const certName = typeof cert === 'string' ? cert : cert.name;
            const certDate = typeof cert === 'string' ? null  : cert.date;
            return (
              <div key={i} className="rp-cert-row">
                <strong className="rp-cert-name">{certName}</strong>
                {certDate && <span className="rp-cert-date">{certDate}</span>}
              </div>
            );
          })}
        </section>
      )}

    </div>
  );
});

export default ResumePreview;
