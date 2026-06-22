import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../api';
import './Admin.css';

export default function Admin() {
  const [requests, setRequests] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(null); // id being approved/denied

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: reqs }, authRes] = await Promise.all([
      supabase.from('access_requests').select('*').order('requested_at', { ascending: false }),
      api.get('/admin/users').catch(() => ({ data: [] })),
    ]);
    setRequests(reqs || []);
    setUsers(authRes.data || []);
    setLoading(false);
  }

  async function approve(req) {
    setActing(req.id);
    try {
      await api.post('/admin/invite', { email: req.email, name: req.name });
      await supabase
        .from('access_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', req.id);
      await loadData();
    } catch (err) {
      alert('Approve failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setActing(null);
    }
  }

  async function deny(req) {
    setActing(req.id);
    await supabase
      .from('access_requests')
      .update({ status: 'denied', reviewed_at: new Date().toISOString() })
      .eq('id', req.id);
    await loadData();
    setActing(null);
  }

  async function removeUser(userId) {
    if (!window.confirm('Remove this user? They will lose access immediately.')) return;
    await api.delete(`/admin/user/${userId}`);
    await loadData();
  }

  const pending  = requests.filter(r => r.status === 'pending');
  const reviewed = requests.filter(r => r.status !== 'pending');

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <p className="admin-sub">Job Search Sucks — Access Control</p>
      </div>

      {loading ? (
        <div className="admin-loading"><span className="spinner" /></div>
      ) : (
        <>
          {/* Pending requests */}
          <section className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Pending Requests</h2>
              <span className="admin-badge">{pending.length}</span>
            </div>

            {pending.length === 0 ? (
              <p className="admin-empty">No pending requests.</p>
            ) : (
              <div className="admin-table">
                {pending.map(req => (
                  <div key={req.id} className="admin-row">
                    <div className="admin-row-info">
                      <span className="admin-name">{req.name}</span>
                      <span className="admin-email">{req.email}</span>
                      <span className="admin-date">{new Date(req.requested_at).toLocaleDateString()}</span>
                    </div>
                    <div className="admin-row-actions">
                      <button
                        className="admin-btn approve"
                        onClick={() => approve(req)}
                        disabled={acting === req.id}
                      >
                        {acting === req.id ? <span className="spinner dark sm" /> : 'Approve'}
                      </button>
                      <button
                        className="admin-btn deny"
                        onClick={() => deny(req)}
                        disabled={acting === req.id}
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Active users */}
          <section className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Active Users</h2>
              <span className="admin-badge">{users.length}</span>
            </div>
            {users.length === 0 ? (
              <p className="admin-empty">No users yet.</p>
            ) : (
              <div className="admin-table">
                {users.map(u => (
                  <div key={u.id} className="admin-row">
                    <div className="admin-row-info">
                      <span className="admin-email">{u.email}</span>
                      <span className="admin-date">
                        Joined {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                      <span className="admin-date" style={{ color: u.last_sign_in_at ? '#10B981' : '#5A5A78' }}>
                        {u.last_sign_in_at
                          ? `Last login ${new Date(u.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date(u.last_sign_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Never logged in'}
                      </span>
                    </div>
                    {u.email !== 'soumya3436@gmail.com' && (
                      <div className="admin-row-actions">
                        <button className="admin-btn deny" onClick={() => removeUser(u.id)}>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reviewed history */}
          {reviewed.length > 0 && (
            <section className="admin-section">
              <h2 className="admin-section-title">Request History</h2>
              <div className="admin-table">
                {reviewed.map(req => (
                  <div key={req.id} className="admin-row muted">
                    <div className="admin-row-info">
                      <span className="admin-name">{req.name}</span>
                      <span className="admin-email">{req.email}</span>
                      <span className={`admin-status ${req.status}`}>{req.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
