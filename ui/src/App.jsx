import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { JDProvider }   from './context/JDContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import Nav              from './components/Nav';

import RequestAccess    from './pages/RequestAccess';
import Login            from './pages/Login';
import Onboarding       from './pages/Onboarding';
import Admin            from './pages/Admin';
import Screener         from './pages/Screener';
import ResumeBuilder    from './pages/ResumeBuilder';
import BulletRewriter   from './pages/BulletRewriter';
import LinkedInOutreach from './pages/LinkedInOutreach';

const AUTH_PATHS = ['/login', '/request-access'];

export default function App() {
  return (
    <AuthProvider>
      <JDProvider>
        <BrowserRouter>
          <NavWrapper />
          <Routes>
            {/* Public auth routes */}
            <Route path="/request-access" element={<RequestAccess />} />
            <Route path="/login"          element={<Login />} />

            {/* Onboarding — auth required, but no onboarding_complete check */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />

            {/* Admin — Soumya only */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            } />

            {/* Main app — auth + onboarding required */}
            <Route path="/" element={
              <ProtectedRoute><Screener /></ProtectedRoute>
            } />
            <Route path="/resume" element={
              <ProtectedRoute><ResumeBuilder /></ProtectedRoute>
            } />
            <Route path="/rewriter" element={
              <ProtectedRoute><BulletRewriter /></ProtectedRoute>
            } />
            <Route path="/outreach" element={
              <ProtectedRoute><LinkedInOutreach /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </JDProvider>
    </AuthProvider>
  );
}

// Nav is hidden on auth + onboarding pages
function NavWrapper() {
  const { pathname } = useLocation();
  const hide = AUTH_PATHS.includes(pathname) || pathname === '/onboarding';
  return hide ? null : <Nav />;
}
