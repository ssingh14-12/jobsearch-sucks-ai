import { useState, useEffect, useRef } from 'react';
import JDBar from '../components/JDBar';
import { useJD } from '../context/JDContext';
import { api } from '../api';
import './LinkedInOutreach.css';


const MESSAGE_TYPES = [
  {
    key: 'connection_request',
    label: 'Connection Request',
    short: 'Connect',
    limit: 300,
    desc: 'Short LinkedIn connection note. Hard 300-character limit. Gets you in the door.',
  },
  {
    key: 'job_outreach',
    label: 'Job Outreach',
    short: 'Job Ask',
    limit: null,
    desc: '3-reason format. Send as a DM or InMail after connecting. Your strongest message.',
  },
  {
    key: 'coffee_chat',
    label: 'Coffee Chat',
    short: 'Coffee',
    limit: null,
    desc: 'Casual ask for a 15-minute conversation. Works well with peers and alumni.',
  },
  {
    key: 'follow_up',
    label: 'Follow-Up',
    short: 'Follow-Up',
    limit: null,
    desc: 'After connecting or after a call. Warm check-in with one clear ask.',
  },
  {
    key: 'inbound_reply',
    label: 'Reply to Recruiter',
    short: 'Reply',
    limit: null,
    desc: 'When a recruiter messages you first. Confirm interest + give availability.',
  },
];

export default function LinkedInOutreach() {
  const {
    jd, jobTitle, company,
    outreachTask, patchOutreachTask, markOutreachSeen,
  } = useJD();

  // ── Persistent state (survives navigation) — lives in JDContext ─────────
  const {
    status: outreachStatus,
    targets,
    peopleByTarget,
    loadingPeople,
    peopleNoteByTarget,
    error: targetError,
  } = outreachTask;

  const loadingTargets = outreachStatus === 'loading';

  // ── Local-only state (ephemeral — fast ops, fine to lose on nav) ─────────
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [messageType, setMessageType]       = useState('connection_request');
  const [recipientName, setRecipientName]   = useState('');
  const [recipientCtx, setRecipientCtx]     = useState('');
  const [generatedMsg, setGeneratedMsg]     = useState('');
  const [editedMsg, setEditedMsg]           = useState('');
  const [subject, setSubject]               = useState('');
  const [notes, setNotes]                   = useState('');
  const [generating, setGenerating]         = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [copiedSearch, setCopiedSearch]     = useState(null);
  const [error, setError]                   = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const generatorRef = useRef(null);

  // Mark as seen when user lands on this page
  useEffect(() => {
    if (outreachStatus === 'done') markOutreachSeen();
  }, [outreachStatus, markOutreachSeen]);

  // Auto-fetch targets when JD loads (only if we don't have them already)
  useEffect(() => {
    if (jd && jd.length > 50 && targets.length === 0 && outreachStatus === 'idle') {
      fetchTargets();
    }
  }, [jd]); // eslint-disable-line

  // When a target is selected, set the default message type to its suggestion
  useEffect(() => {
    if (selectedTarget?.suggested_message_type) {
      setMessageType(selectedTarget.suggested_message_type);
    }
  }, [selectedTarget]);

  // Keep editedMsg in sync when generatedMsg updates
  useEffect(() => {
    setEditedMsg(generatedMsg);
  }, [generatedMsg]);

  async function fetchPeople(target) {
    const key = target.type;
    if (loadingPeople[key]) return;
    // Write loading state to context
    patchOutreachTask({ loadingPeople: { ...loadingPeople, [key]: true } });
    try {
      const res = await api.post('/outreach/people', {
        company:      company || '',
        role:         jobTitle || '',
        target_type:  target.type,
        target_label: target.label,
      });
      patchOutreachTask({
        peopleByTarget:     { ...peopleByTarget,     [key]: res.data.people || [] },
        peopleNoteByTarget: { ...peopleNoteByTarget, [key]: res.data.note || '' },
        loadingPeople:      { ...loadingPeople,      [key]: false },
      });
    } catch {
      patchOutreachTask({
        peopleByTarget:     { ...peopleByTarget,     [key]: [] },
        peopleNoteByTarget: { ...peopleNoteByTarget, [key]: 'Search failed. Try the LinkedIn search string above.' },
        loadingPeople:      { ...loadingPeople,      [key]: false },
      });
    }
  }

  async function fetchTargets() {
    patchOutreachTask({ status: 'loading', error: '', seenByUser: true });
    try {
      const res = await api.post('/outreach/targets', {
        jd_text: jd,
        company: company || '',
        role: jobTitle || '',
      });
      patchOutreachTask({ status: 'done', targets: res.data.targets || [] });
    } catch {
      patchOutreachTask({ status: 'error', error: 'Could not load target suggestions. Check that Flask is running.' });
    }
  }

  async function handleGenerate() {
    if (!selectedTarget) return;
    setGenerating(true);
    setError('');
    setGeneratedMsg('');
    setSubject('');
    setNotes('');
    try {
      const res = await api.post('/outreach/generate', {
        jd_text: jd,
        company: company || '',
        role: jobTitle || '',
        target_type: selectedTarget.type,
        message_type: messageType,
        recipient_name: recipientName,
        recipient_context: recipientCtx,
      });
      setGeneratedMsg(res.data.message || '');
      setSubject(res.data.subject_line || '');
      setNotes(res.data.notes || '');
    } catch (e) {
      setError('Message generation failed. Check that Flask is running at localhost:5000.');
    } finally {
      setGenerating(false);
    }
  }

  function handleSelectTarget(target) {
    setSelectedTarget(target);
    setSelectedPerson(null);
    setRecipientName('');
    setRecipientCtx('');
    setGeneratedMsg('');
    setSubject('');
    setNotes('');
    setError('');
    setTimeout(() => {
      generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleSelectPerson(person, target) {
    setSelectedTarget(target);
    setSelectedPerson(person);
    setRecipientName(person.first_name);
    setRecipientCtx(person.title ? `${person.title}` : '');
    setGeneratedMsg('');
    setSubject('');
    setNotes('');
    setError('');
    setTimeout(() => {
      generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleCopy() {
    if (!editedMsg) return;
    const full = subject ? `Subject: ${subject}\n\n${editedMsg}` : editedMsg;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopySearch(str, idx) {
    navigator.clipboard.writeText(str);
    setCopiedSearch(idx);
    setTimeout(() => setCopiedSearch(null), 1500);
  }

  function handleRegenerate() {
    setGeneratedMsg('');
    handleGenerate();
  }

  const charLimit   = MESSAGE_TYPES.find(m => m.key === messageType)?.limit;
  const charCount   = editedMsg.length;
  const overLimit   = charLimit && charCount > charLimit;
  const nearLimit   = charLimit && charCount > charLimit * 0.85;
  const charColor   = overLimit ? '#EF4444' : nearLimit ? '#F59E0B' : '#10B981';

  const noJD = !jd || jd.length < 50;

  return (
    <div className="page-layout">
      <JDBar />

      <div className="outreach-page">
        {/* Header */}
        <div className="outreach-header">
          <div className="outreach-header-left">
            <h1 className="outreach-title">LinkedIn Outreach</h1>
            <p className="outreach-sub">
              {company || jobTitle
                ? `Who to contact at ${company || 'this company'} — and exactly what to say, in your voice.`
                : 'Paste a JD to get target suggestions and ready-to-send messages.'}
            </p>
          </div>
          {(company || jobTitle) && (
            <div className="outreach-jd-pill">
              <span className="pulse-dot" />
              <span>{jobTitle}{company ? ` · ${company}` : ''}</span>
            </div>
          )}
        </div>

        {/* No JD state */}
        {noJD ? (
          <div className="outreach-no-jd">
            <div className="no-jd-icon">📋</div>
            <h3>Paste a JD to get started</h3>
            <p>Use the JD bar above to paste a job description. As soon as it's loaded, this page will show you exactly who to reach out to — and generate messages in your voice.</p>
          </div>
        ) : (
          <div className="outreach-body">
            {/* LEFT — Target Finder */}
            <div className="target-panel">
              <div className="panel-heading">
                <span className="panel-label">Who to reach out to</span>
                {targets.length > 0 && (
                  <button className="btn-refresh" onClick={fetchTargets} disabled={loadingTargets}>
                    {loadingTargets ? '...' : '↻'}
                  </button>
                )}
              </div>

              {loadingTargets && (
                <div className="targets-loading">
                  <div className="spinner-lg" />
                  <span>Figuring out your best targets…</span>
                </div>
              )}

              {targetError && !loadingTargets && (
                <p className="outreach-error">{targetError}</p>
              )}

              {!loadingTargets && targets.length === 0 && !targetError && (
                <button className="btn-load-targets" onClick={fetchTargets}>
                  Find my targets →
                </button>
              )}

              {targets.map((t, i) => {
                const isSelected   = selectedTarget?.type === t.type;
                const people       = peopleByTarget[t.type] || [];
                const isSearching  = loadingPeople[t.type];
                const searched     = t.type in peopleByTarget;
                const peopleNote   = peopleNoteByTarget[t.type] || '';

                return (
                  <div
                    key={t.type}
                    className={`target-card ${isSelected ? 'target-card--selected' : ''}`}
                    onClick={() => handleSelectTarget(t)}
                  >
                    <div className="target-card-top">
                      <span className="target-icon">{t.icon}</span>
                      <div className="target-meta">
                        <span className="target-label">{t.label}</span>
                        <span className={`target-priority priority-${t.priority?.toLowerCase()}`}>
                          {t.priority}
                        </span>
                      </div>
                      {isSelected && <span className="target-check">✓</span>}
                    </div>
                    <p className="target-why">{t.why}</p>

                    {/* Find Real People button */}
                    {!searched && (
                      <button
                        className="btn-find-people"
                        onClick={e => { e.stopPropagation(); fetchPeople(t); }}
                        disabled={isSearching}
                      >
                        {isSearching
                          ? <><div className="spinner-xs" /> Searching LinkedIn…</>
                          : '🔍 Find real people to message'}
                      </button>
                    )}

                    {/* People results */}
                    {searched && (
                      <div className="people-section" onClick={e => e.stopPropagation()}>
                        {people.length > 0 ? (
                          <>
                            <div className="people-section-label">
                              {people.length} people found · click to write their message
                            </div>
                            {people.map((person, pi) => {
                              const isActivePerson = selectedPerson?.linkedin_url === person.linkedin_url && isSelected;
                              return (
                                <div
                                  key={pi}
                                  className={`person-card ${isActivePerson ? 'person-card--active' : ''}`}
                                  onClick={() => handleSelectPerson(person, t)}
                                >
                                  <div className="person-card-main">
                                    <div className="person-info">
                                      <span className="person-name">{person.name}</span>
                                      {person.title && <span className="person-title">{person.title}</span>}
                                    </div>
                                    <div className="person-actions">
                                      <a
                                        href={person.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-linkedin"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        View ↗
                                      </a>
                                      <button className="btn-use-person">
                                        {isActivePerson ? '✓ Selected' : 'Write message'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <p className="people-empty">No public profiles found.</p>
                        )}
                        {peopleNote && <p className="people-note">{peopleNote}</p>}
                        <button
                          className="btn-research"
                          onClick={() => fetchPeople(t)}
                          disabled={isSearching}
                        >
                          {isSearching ? 'Searching…' : '↻ Search again'}
                        </button>
                      </div>
                    )}

                    {/* LinkedIn search string (fallback) */}
                    <div className="search-string-row">
                      <span className="search-string-label">Or search LinkedIn manually:</span>
                      <div className="search-string-box">
                        <code className="search-string-text">{t.linkedin_search}</code>
                        <button
                          className="btn-copy-search"
                          onClick={e => { e.stopPropagation(); handleCopySearch(t.linkedin_search, i); }}
                        >
                          {copiedSearch === i ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — Message Generator */}
            <div className="generator-panel" ref={generatorRef}>
              {!selectedTarget ? (
                <div className="generator-empty">
                  <div className="generator-empty-icon">←</div>
                  <p>Select a target on the left to generate your message</p>
                </div>
              ) : (
                <>
                  <div className="generator-for">
                    <span className="panel-label">Generating for</span>
                    <span className="generator-target-badge">
                      {selectedTarget.icon} {selectedTarget.label}
                    </span>
                    {selectedPerson && (
                      <span className="generator-person-badge">
                        → {selectedPerson.name}
                        <a
                          href={selectedPerson.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="person-verify-link"
                          title="Verify on LinkedIn"
                        >↗</a>
                      </span>
                    )}
                  </div>

                  {/* Message type tabs */}
                  <div className="msg-type-tabs">
                    {MESSAGE_TYPES.map(mt => (
                      <button
                        key={mt.key}
                        className={`msg-tab ${messageType === mt.key ? 'msg-tab--active' : ''}`}
                        onClick={() => { setMessageType(mt.key); setGeneratedMsg(''); setSubject(''); }}
                      >
                        {mt.short}
                        {mt.limit && <span className="tab-limit">{mt.limit}</span>}
                      </button>
                    ))}
                  </div>

                  {/* Message type description */}
                  <p className="msg-type-desc">
                    {MESSAGE_TYPES.find(m => m.key === messageType)?.desc}
                  </p>

                  {/* Optional inputs */}
                  <div className="generator-inputs">
                    <div className="input-row">
                      <label className="input-label">Recipient first name</label>
                      <input
                        type="text"
                        className="gen-input"
                        placeholder="e.g. Matt, Priya, Alex (optional)"
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                      />
                    </div>
                    <div className="input-row">
                      <label className="input-label">Anything specific about them?</label>
                      <input
                        type="text"
                        className="gen-input"
                        placeholder="e.g. posted the job, spoke at SaaStock, UT Austin alum, referred by…"
                        value={recipientCtx}
                        onChange={e => setRecipientCtx(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="btn-generate"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? (
                      <><div className="spinner" /> Writing in your voice…</>
                    ) : (
                      generatedMsg ? '↻ Regenerate' : '✦ Generate Message'
                    )}
                  </button>

                  {error && <p className="outreach-error">{error}</p>}

                  {/* Output area */}
                  {(generatedMsg || editedMsg) && (
                    <div className="message-output">
                      {subject && (
                        <div className="subject-row">
                          <span className="subject-label">Subject:</span>
                          <span className="subject-text">{subject}</span>
                        </div>
                      )}

                      <textarea
                        className="message-textarea"
                        value={editedMsg}
                        onChange={e => setEditedMsg(e.target.value)}
                        rows={10}
                        spellCheck
                      />

                      {/* Character counter */}
                      <div className="char-counter-row">
                        <div className="char-counter-left">
                          {charLimit && (
                            <div className="char-bar-wrap">
                              <div
                                className="char-bar-fill"
                                style={{
                                  width: `${Math.min((charCount / charLimit) * 100, 100)}%`,
                                  background: charColor,
                                }}
                              />
                            </div>
                          )}
                          <span className="char-count" style={{ color: charColor }}>
                            {charCount}{charLimit ? ` / ${charLimit}` : ''} chars
                            {overLimit && ' — over limit!'}
                          </span>
                        </div>

                        <div className="output-actions">
                          <button
                            className="btn-action"
                            onClick={handleRegenerate}
                            disabled={generating}
                          >
                            ↻ Redo
                          </button>
                          <button
                            className={`btn-action btn-copy ${copied ? 'btn-copy--done' : ''}`}
                            onClick={handleCopy}
                          >
                            {copied ? '✓ Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      {notes && (
                        <p className="message-notes">{notes}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
