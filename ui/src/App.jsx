/**
 * App.jsx — The Root of the React App
 *
 * This file does 3 things:
 *   1. Wraps the whole app in JDProvider (global JD state)
 *   2. Wraps the whole app in BrowserRouter (page routing)
 *   3. Defines which URL maps to which page component
 *
 * Think of it as the blueprint of the building:
 *   - JDProvider = the shared whiteboard visible from every room
 *   - BrowserRouter = the hallway connecting all rooms
 *   - Routes = the room map (/resume → Resume Builder, etc.)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JDProvider } from './context/JDContext';
import Nav from './components/Nav';
import Screener from './pages/Screener';
import ResumeBuilder from './pages/ResumeBuilder';
import BulletRewriter from './pages/BulletRewriter';
import LinkedInOutreach from './pages/LinkedInOutreach';

export default function App() {
  return (
    // JDProvider wraps everything — JD state is available to all pages
    <JDProvider>
      {/* BrowserRouter enables client-side routing (no full page reloads) */}
      <BrowserRouter>
        {/* Nav is OUTSIDE Routes so it shows on every page */}
        <Nav />

        {/* Routes: each Route maps a URL path to a page component */}
        <Routes>
          <Route path="/"         element={<Screener />} />
          <Route path="/resume"   element={<ResumeBuilder />} />
          <Route path="/rewriter" element={<BulletRewriter />} />
          <Route path="/outreach" element={<LinkedInOutreach />} />
        </Routes>
      </BrowserRouter>
    </JDProvider>
  );
}
