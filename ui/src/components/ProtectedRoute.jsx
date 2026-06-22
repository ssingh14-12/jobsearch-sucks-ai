import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile } = useAuth();

  // Still loading auth state
  if (user === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#07070F' }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (profile && !profile.onboarding_complete && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (adminOnly && profile?.email !== 'soumya3436@gmail.com') {
    return <Navigate to="/" replace />;
  }

  return children;
}
