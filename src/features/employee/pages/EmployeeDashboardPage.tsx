import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import { useAuth } from '../../auth/hooks/useAuth';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import { getMyAccessRequests, type BackendAccessRequest } from '../../../services/api/accessRequestsApi';
import { getMyDevices, type BackendDevice } from '../../../services/api/devicesApi';
import { apiGet } from '../../../services/api/apiClient';
import './EmployeeDashboardPage.css';

interface NotificationsResponse {
  success: boolean;
  data: unknown[];
  unreadCount: number;
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    if (isToday) {
      return `Today, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return isoString;
  }
}

function statusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    default: return 'pending';
  }
}

const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const [requests, setRequests] = useState<BackendAccessRequest[]>([]);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [reqs, devices, notifs] = await Promise.allSettled([
          getMyAccessRequests(),
          getMyDevices(),
          apiGet<NotificationsResponse>('/api/v1/notifications?limit=10'),
        ]);

        if (cancelled) return;

        if (reqs.status === 'fulfilled') setRequests(reqs.value.slice(0, 3));
        if (devices.status === 'fulfilled') setDeviceCount(devices.value.length);
        if (notifs.status === 'fulfilled') setUnreadCount(notifs.value.unreadCount ?? 0);
      } catch {
        if (!cancelled) setError('Could not load dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const metrics = [
    {
      title: 'Pending Requests',
      value: loading ? '—' : String(pendingCount).padStart(2, '0'),
      detail: 'Awaiting approval',
      icon: 'clock' as const,
    },
    {
      title: 'Registered Devices',
      value: loading || deviceCount === null ? '—' : String(deviceCount).padStart(2, '0'),
      detail: 'Devices on your account',
      icon: 'monitor' as const,
    },
    {
      title: 'Unread Notifications',
      value: loading || unreadCount === null ? '—' : String(unreadCount).padStart(2, '0'),
      detail: 'In your inbox',
      icon: 'alert-triangle' as const,
    },
    {
      title: 'Total Requests',
      value: loading ? '—' : String(requests.length > 0 ? requests.length : '—'),
      detail: 'All time',
      icon: 'file-text' as const,
    },
  ];

  return (
    <main className="employee-page">
      <div className="employee-page__content">
        <header className="employee-header">
          <img
            className="employee-header__logo"
            src="/assets/brainmint-logo.png"
            alt="BrainMint"
          />
          <Link className="employee-header__profile" to="/employee/profile">
            <Icon name="user" size={20} />
          </Link>
        </header>

        <section className="employee-welcome">
          <div>
            <p className="employee-welcome__eyebrow">EMPLOYEE PORTAL</p>
            <h1>Good morning, {firstName}</h1>
            <p>Your access, devices, and security tasks — all in one place.</p>
          </div>
          <Link className="employee-primary-button" to="/employee/access-requests/new">
            <Icon name="plus" size={16} />
            Request Access
          </Link>
        </section>

        {error && (
          <div className="employee-panel" style={{ color: 'var(--color-danger, #c0392b)', padding: '0.75rem 1rem' }}>
            <Icon name="alert-triangle" size={16} /> {error}
          </div>
        )}

        <section className="employee-metrics" aria-label="Account overview">
          {metrics.map((metric) => (
            <article className="employee-metric-card" key={metric.title}>
              <div className="employee-metric-card__top">
                <span>{metric.title}</span>
                <Icon name={metric.icon} size={18} />
              </div>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </section>

        <div className="employee-dashboard-grid">
          <section className="employee-panel employee-requests">
            <div className="employee-panel__heading">
              <div>
                <h2>Recent requests</h2>
                <p>Updates on the resources you need</p>
              </div>
              <Link to="/employee/access-requests">My Requests →</Link>
            </div>

            <div className="employee-table-wrap">
              {loading ? (
                <p style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Loading…</p>
              ) : requests.length === 0 ? (
                <p style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                  No requests yet.{' '}
                  <Link to="/employee/access-requests/new">Submit your first request →</Link>
                </p>
              ) : (
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>Resource</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.resource?.name ?? 'Resource'}</strong>
                          <small>{req.requested_duration_minutes ? `${req.requested_duration_minutes} min` : ''}</small>
                        </td>
                        <td>{req.reason.slice(0, 40)}{req.reason.length > 40 ? '…' : ''}</td>
                        <td>
                          <span className={`employee-status employee-status--${statusClass(req.status)}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </td>
                        <td>{formatDate(req.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="employee-panel__footer">
              <span>{loading ? '…' : `${requests.length} recent requests`}</span>
              <Link to="/employee/access-requests">View all →</Link>
            </div>
          </section>

          <div className="employee-side-panels">
            <section className="employee-panel">
              <h2>Needs your attention</h2>
              <p className="employee-panel__description">Keep your account in good standing</p>

              {pendingCount > 0 ? (
                <div className="employee-attention-item">
                  <Icon name="clock" size={17} />
                  <div>
                    <strong>{pendingCount} pending request{pendingCount !== 1 ? 's' : ''}</strong>
                    <p>Awaiting approval from your manager.</p>
                  </div>
                </div>
              ) : (
                <div className="employee-attention-item">
                  <Icon name="check-circle" size={17} />
                  <div>
                    <strong>All caught up</strong>
                    <p>No pending requests.</p>
                  </div>
                </div>
              )}

              {(unreadCount ?? 0) > 0 && (
                <div className="employee-attention-item">
                  <Icon name="alert-triangle" size={17} />
                  <div>
                    <strong>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</strong>
                    <p><Link to="/employee/notifications">View inbox →</Link></p>
                  </div>
                </div>
              )}
            </section>

            <section className="employee-panel">
              <h2>Quick actions</h2>
              <div className="employee-activity-item">
                <Icon name="plus" size={17} />
                <div>
                  <strong><Link to="/employee/access-requests/new">Request resource access</Link></strong>
                  <p>Submit a new access request.</p>
                </div>
              </div>
              <div className="employee-activity-item">
                <Icon name="monitor" size={17} />
                <div>
                  <strong><Link to="/employee/devices">Manage my devices</Link></strong>
                  <p>View or register devices.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <EmployeeBottomNav />
    </main>
  );
};

export default EmployeeDashboardPage;
