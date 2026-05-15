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

import { createContext, useContext, useState } from 'react';

// Step A: Create the context (the whiteboard itself)
const JDContext = createContext(null);

// Step B: The Provider — wraps the whole app, holds the state
export function JDProvider({ children }) {
  const [jd, setJd] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [postingDate, setPostingDate] = useState('');

  // Screener result — saved so Resume Builder can use it without re-analyzing
  // Contains: decision, match_score, base_resume, role_family, top_gaps, etc.
  const [screenResult, setScreenResult] = useState(null);

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
  }

  return (
    <JDContext.Provider value={{
      jd, jobTitle, company, postingDate, loadJD, clearJD,
      screenResult, setScreenResult,
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
