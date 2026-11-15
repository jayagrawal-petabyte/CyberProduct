import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import {
  getMyAccessRequests,
  type BackendAccessRequest,
  type BackendRequestStatus,
} from '../../../services/api/accessRequestsApi';
import { ApiError } from '../../../services/api/apiClient';
import './MyRequestsPage.css';

// Keep type exports for any downstream consumers
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export interface AccessRequest {
  id: string;
  resource: string;
  access: string;
  submitted: string;
  updated: string;
  status: RequestStatus;
}

type FilterKey = 'All' | 'Pending' | 'Approved' | 'Rejected';

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

function uiStatus(status: BackendRequestStatus): RequestStatus {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function statusClass(status: RequestStatus): string {
  if (status === 'Approved') return 'approved';
  if (status === 'Rejected') return 'rejected';
  return 'pending';
}

const MyRequestsPage: React.FC = () => {
  const location = useLocation();
  const [requests, setRequests] = useState<BackendAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('All');
  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(
    () => Boolean((location.state as { submittedSuccess?: boolean } | null)?.submittedSuccess),
  );

  async function loadRequests() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyAccessRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load requests.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  const counts: Record<FilterKey, number> = useMemo(
    () => ({
      All: requests.length,
      Pending: requests.filter((r) => r.status === 'pending').length,
      Approved: requests.filter((r) => r.status === 'approved').length,
      Rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    if (filter === 'All') return requests;
    const statusMap: Record<Exclude<FilterKey, 'All'>, BackendRequestStatus> = {
      Pending: 'pending',
      Approved: 'approved',
      Rejected: 'rejected',
    };
    return requests.filter((r) => r.status === statusMap[filter as Exclude<FilterKey, 'All'>]);
  }, [filter, requests]);

  return (
    <main className="employee-page">
      <div className="employee-page__content">
        <header className="employee-header">
          <img
            className="employee-header__logo"
            src="/assets/brainmint-logo.png"
            alt="BrainMint"
          />
          <Link
            className="employee-header__profile"
            to="/employee/profile"
            aria-label="My profile"
          >
            <Icon name="user" size={20} />
          </Link>
        </header>

        <section className="employee-welcome">
          <div>
            <p className="employee-welcome__eyebrow">EMPLOYEE PORTAL</p>
            <h1>My Requests</h1>
            <p>Track your access requests and approval progress.</p>
          </div>
          <Link
            className="employee-primary-button"
            to="/employee/access-requests/new"
          >
            <Icon name="plus" size={16} />
            New Request
          </Link>
        </section>

        {showSuccessBanner && (
          <section
            className="employee-panel request-success-banner"
            role="status"
            aria-live="polite"
          >
            <div className="request-success-banner__content">
              <span className="request-success-banner__icon">
                <Icon name="check-circle" size={24} />
              </span>
              <div>
                <h2>Request submitted successfully</h2>
                <p>
                  Your access request has been submitted and is pending approval.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="request-success-banner__close"
              onClick={() => setShowSuccessBanner(false)}
              aria-label="Dismiss success message"
            >
              <Icon name="x" size={16} />
            </button>
          </section>
        )}

        {error && (
          <div
            className="employee-panel"
            style={{ color: 'var(--color-danger, #c0392b)', padding: '0.75rem 1rem' }}
          >
            <Icon name="alert-triangle" size={16} /> {error}{' '}
            <button
              type="button"
              onClick={() => void loadRequests()}
              style={{
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        <section className="employee-metrics" aria-label="Request summary">
          {(
            [
              { label: 'Total Requests', key: 'All' as FilterKey, icon: 'file-text' as const },
              { label: 'Pending', key: 'Pending' as FilterKey, icon: 'clock' as const },
              { label: 'Approved', key: 'Approved' as FilterKey, icon: 'check-circle' as const },
              { label: 'Rejected', key: 'Rejected' as FilterKey, icon: 'x-circle' as const },
            ] as const
          ).map((item) => (
            <article className="employee-metric-card" key={item.label}>
              <div className="employee-metric-card__top">
                <span>{item.label}</span>
                <Icon name={item.icon} size={18} />
              </div>
              <strong>
                {isLoading ? '—' : counts[item.key].toString().padStart(2, '0')}
              </strong>
              <p>Your request overview</p>
            </article>
          ))}
        </section>

        <section className="employee-panel my-requests-panel">
          <div className="employee-panel__heading">
            <div>
              <h2>Access request history</h2>
              <p>Review the status and details of your requests.</p>
            </div>
          </div>

          <div className="request-filters" aria-label="Filter requests">
            {(['All', 'Pending', 'Approved', 'Rejected'] as FilterKey[]).map((f) => (
              <button
                key={f}
                type="button"
                className={`request-filter-btn${filter === f ? ' request-filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
                {!isLoading && (
                  <span className="request-filter-count">{counts[f]}</span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p style={{ padding: '1.5rem', color: 'var(--color-text-secondary)' }}>
              Loading your requests…
            </p>
          ) : filteredRequests.length === 0 ? (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Icon name="file-text" size={32} />
              <p style={{ marginTop: '0.5rem' }}>
                {filter === 'All'
                  ? 'No access requests yet.'
                  : `No ${filter.toLowerCase()} requests.`}
              </p>
              {filter === 'All' && (
                <Link
                  to="/employee/access-requests/new"
                  className="employee-primary-button"
                  style={{ display: 'inline-flex', marginTop: '1rem' }}
                >
                  <Icon name="plus" size={16} />
                  Submit your first request
                </Link>
              )}
            </div>
          ) : (
            <div className="employee-table-wrap">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => {
                    const ui = uiStatus(req.status);
                    return (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.resource?.name ?? '—'}</strong>
                          {req.requested_duration_minutes && (
                            <small>
                              {Math.round(req.requested_duration_minutes / (60 * 24))} day
                              {req.requested_duration_minutes / (60 * 24) !== 1 ? 's' : ''}
                            </small>
                          )}
                        </td>
                        <td>{req.reason.slice(0, 50)}{req.reason.length > 50 ? '…' : ''}</td>
                        <td>
                          <span
                            className={`employee-status employee-status--${statusClass(ui)}`}
                          >
                            {ui}
                          </span>
                        </td>
                        <td>{formatDate(req.created_at)}</td>
                        <td>{formatDate(req.updated_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <EmployeeBottomNav />
    </main>
  );
};

export default MyRequestsPage;
