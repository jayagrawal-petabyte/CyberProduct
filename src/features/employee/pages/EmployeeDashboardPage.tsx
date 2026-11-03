import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import './EmployeeDashboardPage.css';

const metrics = [
  { title: 'Active Resource Access', value: '08', detail: '2 time-bound grants', icon: 'key' as const },
  { title: 'Pending Requests', value: '01', detail: 'Awaiting approval', icon: 'clock' as const },
  { title: 'Registered Devices', value: '02', detail: 'All devices compliant', icon: 'monitor' as const },
  { title: 'Policy Acknowledgements', value: '4 / 5', detail: '1 acknowledgement due', icon: 'shield-check' as const },
];

const requests = [
  { resource: 'Snowflake Analytics', access: 'Read-only · 7 days', id: 'AR-2048', status: 'Pending', date: 'Today, 09:18' },
  { resource: 'GitHub - Insights', access: 'Contributor · 7 days', id: 'AR-2047', status: 'Approved', date: '23 Oct, 14:10' },
  { resource: 'Looker', access: 'Viewer · 90 days', id: 'AR-2039', status: 'Approved', date: '21 Oct, 11:05' },
];

const EmployeeDashboardPage: React.FC = () => {
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
            <h1>Good morning, Maya</h1>
            <p>Your access, devices, and security tasks — all in one place.</p>
          </div>
          <Link className="employee-primary-button" to="/employee/access-requests/new">
            <Icon name="plus" size={16} />
            Request Access
          </Link>
        </section>

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
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Request</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.resource}</strong>
                        <small>{request.access}</small>
                      </td>
                      <td>{request.id}</td>
                      <td>
                        <span className={`employee-status employee-status--${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{request.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="employee-panel__footer">
              <span>3 recent requests · View all 12</span>
              <Link to="/employee/access-requests">View all →</Link>
            </div>
          </section>

          <div className="employee-side-panels">
            <section className="employee-panel">
              <h2>Needs your attention</h2>
              <p className="employee-panel__description">Keep your account in good standing</p>

              <div className="employee-attention-item">
                <Icon name="alert-triangle" size={17} />
                <div>
                  <strong>Review Acceptable Use v3.2</strong>
                  <p>Acknowledge the updated policy by 28 Oct.</p>
                </div>
              </div>

              <div className="employee-attention-item">
                <Icon name="shield-check" size={17} />
                <div>
                  <strong>Recovery methods verified</strong>
                  <p>Your security methods are ready.</p>
                </div>
              </div>
            </section>

            <section className="employee-panel">
              <h2>Recent activity</h2>
              <div className="employee-activity-item">
                <Icon name="arrow-right" size={17} />
                <div>
                  <strong>Snowflake request submitted</strong>
                  <p>Sent to Daniel Brooks for approval.</p>
                  <small>09:18 UTC</small>
                </div>
              </div>
              <div className="employee-activity-item">
                <Icon name="monitor" size={17} />
                <div>
                  <strong>MacBook compliance checked</strong>
                  <p>All 8 security checks passed.</p>
                  <small>08:45 UTC</small>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className="employee-expiry-banner">
          <div>
            <strong>Your GitHub access expires in 6 days</strong>
            <p>Need more time on Insights? Submit a renewal before 30 Oct to avoid an interruption.</p>
          </div>
          <Link to="/employee/access-requests/new">Renew access →</Link>
        </section>
      </div>

      <EmployeeBottomNav />
    </main>
  );
};

export default EmployeeDashboardPage;