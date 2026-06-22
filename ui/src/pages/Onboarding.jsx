import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

const ROLE_OPTIONS = [
  'Business Analyst', 'Business Systems Analyst', 'IT Business Analyst',
  'Business Operations Analyst', 'BizOps Manager', 'Strategy & Operations',
  'Technical Program Manager', 'IT Project Manager', 'Scrum Master',
  'Product Manager', 'Product Owner', 'Product Analyst',
  'SaaS Implementation Consultant', 'Solutions Consultant',
  'Data Analyst', 'BI Analyst', 'Cloud Project Manager',
  'Operations Analyst', 'Program Analyst', 'Project Coordinator',
];

const EXPERIENCE_LEVELS = [
  { key: 'entry',  label: 'Entry Level',  desc: '0–2 years' },
  { key: 'mid',    label: 'Mid Level',    desc: '3–5 years' },
  { key: 'senior', label: 'Senior',       desc: '6–9 years' },
  { key: 'lead',   label: 'Lead / Staff', desc: '10+ years' },
];

const STEPS = ['Your Info', 'Resumes', 'LinkedIn', 'Target Roles'];

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // Step 0 — profile info
  const [name,         setName]         = useState(user?.user_metadata?.name || '');
  const [phone,        setPhone]        = useState('');
  const [location,     setLocation]     = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [linkedinUrl,  setLinkedinUrl]  = useState('');

  // Step 1 — resume files
  const [resumeFiles,   setResumeFiles]   = useState([]);
  const [uploadingRes,  setUploadingRes]  = useState(false);
  const [uploadedRes,   setUploadedRes]   = useState([]); // [{name, path}]

  // Step 2 — LinkedIn PDF
  const [linkedinFile,      setLinkedinFile]      = useState(null);
  const [uploadingLinkedin, setUploadingLinkedin] = useState(false);
  const [uploadedLinkedin,  setUploadedLinkedin]  = useState(null);

  // Step 3 — target roles
  const [targetRoles,   setTargetRoles]   = useState([]);
  const [expLevel,      setExpLevel]      = useState('');
  const [customRole,    setCustomRole]    = useState('');

  // ── helpers ──────────────────────────────────────────────────────────────────
  function toggleRole(role) {
    setTargetRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  }

  async function uploadResumeFiles() {
    if (!resumeFiles.length) { next(); return; }
    setUploadingRes(true);
    setError('');
    const uploaded = [];
    for (const file of resumeFiles) {
      const path = `${user.id}/resumes/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage
        .from('resumes')
        .upload(path, file, { upsert: true });
      if (upErr) { setError(`Upload failed: ${upErr.message}`); setUploadingRes(false); return; }
      uploaded.push({ name: file.name, path });
    }
    setUploadedRes(uploaded);
    setUploadingRes(false);
    next();
  }

  async function uploadLinkedinFile() {
    if (!linkedinFile) { next(); return; }
    setUploadingLinkedin(true);
    setError('');
    const path = `${user.id}/linkedin/${Date.now()}_${linkedinFile.name}`;
    const { error: upErr } = await supabase.storage
      .from('linkedin')
      .upload(path, linkedinFile, { upsert: true });
    if (upErr) { setError(`Upload failed: ${upErr.message}`); setUploadingLinkedin(false); return; }
    setUploadedLinkedin(path);
    setUploadingLinkedin(false);
    next();
  }

  async function finish() {
    setSaving(true);
    setError('');

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        name:               name.trim(),
        phone:              phone.trim(),
        location:           location.trim(),
        current_title:      currentTitle.trim(),
        linkedin_url:       linkedinUrl.trim(),
        target_roles:       targetRoles,
        experience_level:   expLevel,
        onboarding_complete: true,
      })
      .eq('id', user.id);

    if (profileErr) {
      setError('Failed to save profile: ' + profileErr.message);
      setSaving(false);
      return;
    }

    // Insert vault resume records
    if (uploadedRes.length) {
      await supabase.from('vault_resumes').insert(
        uploadedRes.map(r => ({ user_id: user.id, filename: r.name, storage_path: r.path, version_label: r.name.replace(/\.[^/.]+$/, '') }))
      );
    }

    await refreshProfile();
    navigate('/');
  }

  function next() { setStep(s => s + 1); setError(''); }
  function back() { setStep(s => s - 1); setError(''); }

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="ob-page">
      <div className="ob-card">

        {/* Logo */}
        <div className="ob-logo">Job Search <span>Sucks</span></div>

        {/* Progress */}
        <div className="ob-progress">
          {STEPS.map((s, i) => (
            <div key={i} className={`ob-step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="ob-dot" />
              <span className="ob-step-label">{s}</span>
            </div>
          ))}
          <div className="ob-progress-track">
            <div className="ob-progress-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
          </div>
        </div>

        {/* ── Step 0: Profile Info ───────────────────────────────────────────── */}
        {step === 0 && (
          <div className="ob-step">
            <h2 className="ob-title">Tell Us About You</h2>
            <p className="ob-sub">This pre-fills your resume header on every resume you build.</p>

            <div className="ob-fields">
              <div className="ob-field">
                <label className="ob-label">Full Name *</label>
                <input className="ob-input" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson" required />
              </div>
              <div className="ob-field">
                <label className="ob-label">Current Title</label>
                <input className="ob-input" value={currentTitle} onChange={e => setCurrentTitle(e.target.value)}
                  placeholder="e.g. Business Analyst | Product Manager" />
              </div>
              <div className="ob-row">
                <div className="ob-field">
                  <label className="ob-label">Phone</label>
                  <input className="ob-input" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 555-5555" />
                </div>
                <div className="ob-field">
                  <label className="ob-label">Location</label>
                  <input className="ob-input" value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="City, ST · Open to Relocate" />
                </div>
              </div>
              <div className="ob-field">
                <label className="ob-label">LinkedIn URL</label>
                <input className="ob-input" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/your-name" />
              </div>
            </div>

            {error && <p className="ob-error">{error}</p>}
            <button className="ob-btn" onClick={next} disabled={!name.trim()}>
              Next: Upload Resumes →
            </button>
          </div>
        )}

        {/* ── Step 1: Resume Upload ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="ob-step">
            <h2 className="ob-title">Upload Your Resume Vault</h2>
            <p className="ob-sub">
              Upload up to 8 resume versions (PDF or DOCX). These become your vault —
              the Resume Builder will pick the closest one to each JD and tailor it.
            </p>

            <div className="ob-dropzone" onClick={() => document.getElementById('res-upload').click()}>
              <input
                id="res-upload"
                type="file"
                accept=".pdf,.docx,.doc"
                multiple
                style={{ display: 'none' }}
                onChange={e => setResumeFiles(Array.from(e.target.files).slice(0, 8))}
              />
              {resumeFiles.length === 0 ? (
                <>
                  <div className="ob-drop-icon">📄</div>
                  <p className="ob-drop-text">Click to select files</p>
                  <p className="ob-drop-hint">PDF or DOCX · up to 8 files</p>
                </>
              ) : (
                <div className="ob-file-list">
                  {resumeFiles.map((f, i) => (
                    <div key={i} className="ob-file-chip">
                      <span className="ob-file-icon">📄</span>
                      <span className="ob-file-name">{f.name}</span>
                    </div>
                  ))}
                  <p className="ob-drop-hint" style={{ marginTop: '0.5rem' }}>Click to change selection</p>
                </div>
              )}
            </div>

            {error && <p className="ob-error">{error}</p>}

            <div className="ob-btn-row">
              <button className="ob-btn-secondary" onClick={back}>← Back</button>
              <button className="ob-btn" onClick={uploadResumeFiles} disabled={uploadingRes}>
                {uploadingRes ? <><span className="spinner dark" /> Uploading...</> : 'Next: LinkedIn →'}
              </button>
            </div>
            <p className="ob-skip" onClick={next}>Skip for now →</p>
          </div>
        )}

        {/* ── Step 2: LinkedIn PDF ───────────────────────────────────────────── */}
        {step === 2 && (
          <div className="ob-step">
            <h2 className="ob-title">Upload Your LinkedIn Profile</h2>
            <p className="ob-sub">
              Export your LinkedIn profile as a PDF and upload it here. Claude uses it to
              fill in experience details you might have missed in your resumes.
            </p>

            <div className="ob-how-to">
              <p className="ob-how-label">How to export from LinkedIn:</p>
              <ol className="ob-how-list">
                <li>Go to your LinkedIn profile</li>
                <li>Click <strong>More</strong> → <strong>Save to PDF</strong></li>
                <li>Upload that file below</li>
              </ol>
            </div>

            <div className="ob-dropzone" onClick={() => document.getElementById('li-upload').click()}>
              <input
                id="li-upload"
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => setLinkedinFile(e.target.files[0] || null)}
              />
              {!linkedinFile ? (
                <>
                  <div className="ob-drop-icon">💼</div>
                  <p className="ob-drop-text">Click to select your LinkedIn PDF</p>
                  <p className="ob-drop-hint">PDF only</p>
                </>
              ) : (
                <div className="ob-file-list">
                  <div className="ob-file-chip">
                    <span className="ob-file-icon">💼</span>
                    <span className="ob-file-name">{linkedinFile.name}</span>
                  </div>
                  <p className="ob-drop-hint" style={{ marginTop: '0.5rem' }}>Click to change</p>
                </div>
              )}
            </div>

            {error && <p className="ob-error">{error}</p>}

            <div className="ob-btn-row">
              <button className="ob-btn-secondary" onClick={back}>← Back</button>
              <button className="ob-btn" onClick={uploadLinkedinFile} disabled={uploadingLinkedin}>
                {uploadingLinkedin ? <><span className="spinner dark" /> Uploading...</> : 'Next: Target Roles →'}
              </button>
            </div>
            <p className="ob-skip" onClick={next}>Skip for now →</p>
          </div>
        )}

        {/* ── Step 3: Target Roles ──────────────────────────────────────────── */}
        {step === 3 && (
          <div className="ob-step">
            <h2 className="ob-title">What Roles Are You Targeting?</h2>
            <p className="ob-sub">
              Select all that apply. This helps Claude pick the right resume version and
              tailor bullets to the right job family.
            </p>

            <div className="ob-role-grid">
              {ROLE_OPTIONS.map(role => (
                <button
                  key={role}
                  className={`ob-role-chip ${targetRoles.includes(role) ? 'selected' : ''}`}
                  onClick={() => toggleRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Custom role */}
            <div className="ob-field" style={{ marginTop: '1rem' }}>
              <label className="ob-label">Other role not listed?</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="ob-input"
                  value={customRole}
                  onChange={e => setCustomRole(e.target.value)}
                  placeholder="e.g. Revenue Operations Manager"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customRole.trim()) {
                      toggleRole(customRole.trim());
                      setCustomRole('');
                    }
                  }}
                />
                <button
                  className="ob-btn-secondary"
                  style={{ whiteSpace: 'nowrap', padding: '0 1rem' }}
                  onClick={() => { if (customRole.trim()) { toggleRole(customRole.trim()); setCustomRole(''); } }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Experience level */}
            <div style={{ marginTop: '1.25rem' }}>
              <p className="ob-label">Experience Level</p>
              <div className="ob-exp-grid">
                {EXPERIENCE_LEVELS.map(lvl => (
                  <button
                    key={lvl.key}
                    className={`ob-exp-btn ${expLevel === lvl.key ? 'active' : ''}`}
                    onClick={() => setExpLevel(lvl.key)}
                  >
                    <span className="ob-exp-label">{lvl.label}</span>
                    <span className="ob-exp-desc">{lvl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="ob-error">{error}</p>}

            <div className="ob-btn-row" style={{ marginTop: '1.5rem' }}>
              <button className="ob-btn-secondary" onClick={back}>← Back</button>
              <button
                className="ob-btn"
                onClick={finish}
                disabled={saving || targetRoles.length === 0 || !expLevel}
              >
                {saving ? <><span className="spinner dark" /> Saving...</> : 'Enter the App →'}
              </button>
            </div>
            {(targetRoles.length === 0 || !expLevel) && (
              <p className="ob-skip-hint">Select at least one role and an experience level to continue.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
