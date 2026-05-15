/**
 * JDContext.jsx — Global Job Description State
 *
 * This is the "shared whiteboard" for the entire app.
 * Any page can READ the JD (to tailor its output) or
 * WRITE to it (when the user pastes a new one).
 *
 * How it works:
 *   1. JDProvider wraps the whole app in App.jsx
 *   2. Any component calls useJD() to get or set the JD
 *   3. When JD changes, every page that uses it re-renders automatically
 */

import { createContext, useContext, useState, useCallback } from 'react';

// Step A: Create the context (the whiteboard itself)
const JDContext = createContext(null);

// ── Default task shapes ──────────────────────────────────────────────────────
const DEFAULT_RESUME_TASK = {
  status: 'idle',      // 'idle' | 'loading' | 'done' | 'error'
  resume: null,        // the full resume JSON from Flask
  chatHistory: [],     // [{instruction, change_summary, ts}]
  error: '',
  version: null,       // e.g. 'V4'
  seenByUser: false,   // true once the user has visited the page and seen the result
};

const DEFAULT_OUTREACH_TASK = {
  status: 'idle',           // 'idle' | 'loading' | 'done' | 'error'
  targets: [],              // who-to-contact list from Claude
  peopleByTarget: {},       // { type: [person, ...] }
  loadingPeople: {},        // { type: bool }
  peopleNoteByTarget: {},   // { type: 'note string' }
  error: '',
  seenByUser: false,
};

// Step B: The Provider — wraps the whole app, holds ALL shared state
export function JDProvider({ children }) {
  const [jd, setJd] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [postingDate, setPostingDate] = useState('');

  // Screener result — saved so Resume Builder can use it without re-analyzing
  const [screenResult, setScreenResult] = useState(null);

  // ── Background task state — survives navigation ──────────────────────────
  // Resume Builder task (generation + refinement chat)
  const [resumeTask, setResumeTask] = useState(DEFAULT_RESUME_TASK);

  // LinkedIn Outreach task (target list + people search results)
  const [outreachTask, setOutreachTask] = useState(DEFAULT_OUTREACH_TASK);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function loadJD({ rawText, title, companyName, date }) {
    setJd(rawText || '');
    setJobTitle(title || '');
    setCompany(companyName || '');
    setPostingDate(date || '');
  }

  function clearJD() {
    setJd('');
    setJobTitle('');
    setCompany('');
    setPostingDate('');
    setScreenResult(null);
    // Reset tasks when JD changes — old resume no longer relevant
    setResumeTask(DEFAULT_RESUME_TASK);
    setOutreachTask(DEFAULT_OUTREACH_TASK);
  }

  // Patch just the fields you need (like setState in class components)
  const patchResumeTask  = useCallback(patch => setResumeTask(prev => ({ ...prev, ...patch })), []);
  const patchOutreachTask = useCallback(patch => setOutreachTask(prev => ({ ...prev, ...patch })), []);

  // Mark a task as "seen" once the user lands on its page
  const markResumeSeen   = useCallback(() => setResumeTask(prev => ({ ...prev, seenByUser: true })), []);
  const markOutreachSeen = useCallback(() => setOutreachTask(prev => ({ ...prev, seenByUser: true })), []);

  return (
    <JDContext.Provider value={{
      // JD fields
      jd, jobTitle, company, postingDate, loadJD, clearJD,

      // Screener
      screenResult, setScreenResult,

      // Background tasks
      resumeTask,   patchResumeTask,   markResumeSeen,
      outreachTask, patchOutreachTask, markOutreachSeen,
    }}>
      {children}
    </JDContext.Provider>
  );
}

// Step C: The hook — how any component reads/writes the JD
// Usage in any page: const { jd, jobTitle, company, loadJD } = useJD();
export function useJD() {
  const ctx = useContext(JDContext);
  if (!ctx) throw new Error('useJD must be used inside <JDProvider>');
  return ctx;
}
