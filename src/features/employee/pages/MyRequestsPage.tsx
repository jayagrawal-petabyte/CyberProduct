import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import './MyRequestsPage.css';

type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

type AccessRequest = {
  id: string;
  resource: string;
  access: string;
  submitted: string;
  updated: string;
  status: RequestStatus;
};

const initialRequests: AccessRequest[] = [
  {
    id: 'AR-2048',
    resource: 'Snowflake Analytics',
    access: 'Read-only · 7 days',
    submitted: '04 Nov 2026',
    updated: 'Today, 09:18',
    status: 'Pending',
  },
  {
    id: 'AR-2047',
    resource: 'GitHub Repository',
    access: 'Contributor · 7 days',
    submitted: '23 Oct 2026',
    updated: '23 Oct, 14:10',
    status: 'Approved',
  },
  {
    id: 'AR-2039',
    resource: 'Looker',
    access: 'Viewer · 90 days',
    submitted: '21 Oct 2026',
    updated: '21 Oct, 11:05',
    status: 'Approved',
  },
  {
    id: 'AR-2035',
    resource: 'AWS Console',
    access: 'Administrator · 30 days',
    submitted: '18 Oct 2026',
    updated: '19 Oct, 10:30',
    status: 'Rejected',
  },
];

const MyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState('All');

  const filteredRequests = useMemo(
    () =>
      filter === 'All'
        ? requests
        : requests.filter((request) => request.status === filter),
    [filter, requests],
  );

  const counts = {
    All: requests.length,
    Pending: requests.filter((request) => request.status === 'Pending').length,
    Approved: requests.filter((request) => request.status === 'Approved').length,
    Rejected: requests.filter((request) => request.status === 'Rejected').length,
  };

  const cancelRequest = (id: string) => {
    setRequests((current) =>
      current.filter((request) => request.id !== id),
    );
  };

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

        <section className="employee-metrics" aria-label="Request summary">
          {[
            { label: 'Total Requests', value: counts.All, icon: 'file-text' as const },
            { label: 'Pending', value: counts.Pending, icon: 'clock' as const },
            { label: 'Approved', value: counts.Approved, icon: 'check-circle' as const },
            { label: 'Rejected', value: counts.Rejected, icon: 'x-circle' as const },
          ].map((item) => (
            <article className="employee-metric-card" key={item.label}>
              <div className="employee-metric-card__top">
                <span>{item.label}</span>
                <Icon name={item.icon} size={18} />
              </div>
              <strong>{item.value.toString().padStart(2, '0')}</strong>
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
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                type="button"
                className={filter === status ? 'request-filter request-filter--active' : 'request-filter'}
                onClick={() => setFilter(status)}
                aria-pressed={filter === status}
              >
                {status}
                <span>{counts[status as keyof typeof counts]}</span>
              </button>
            ))}
          </div>

          <div className="my-requests-list">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <article className="my-request-card" key={request.id}>
                  <div className="my-request-card__main">
                    <div className="my-request-card__icon">
                      <Icon name="key" size={20} />
                    </div>
                    <div>
                      <h3>{request.resource}</h3>
                      <p>{request.id} · {request.access}</p>
                      <small>Submitted: {request.submitted}</small>
                    </div>
                  </div>

                  <div className="my-request-card__meta">
                    <span className={`employee-status employee-status--${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                    <small>Updated: {request.updated}</small>
                    {request.status === 'Pending' && (
                      <button
                        type="button"
                        className="request-cancel-action"
                        onClick={() => cancelRequest(request.id)}
                      >
                        Cancel request
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="my-requests-empty">
                <Icon name="file-text" size={30} />
                <h3>No {filter.toLowerCase()} requests</h3>
                <p>There are no requests in this category.</p>
                <Link to="/employee/access-requests/new">
                  Create a request →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <EmployeeBottomNav />
    </main>
  );
};

export default MyRequestsPage;