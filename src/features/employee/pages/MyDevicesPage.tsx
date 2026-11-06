import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import './MyDevicesPage.css';

const devices = [
  {
    name: 'MacBook Pro 14"',
    type: 'Laptop',
    id: 'DEV-1024',
    os: 'macOS Sequoia 15.1',
    lastActive: 'Today, 08:45',
    status: 'Compliant',
    icon: 'laptop' as const,
  },
  {
    name: 'iPhone 15',
    type: 'Mobile',
    id: 'DEV-1025',
    os: 'iOS 18.1',
    lastActive: 'Today, 08:30',
    status: 'Compliant',
    icon: 'smartphone' as const,
  },
];

const MyDevicesPage: React.FC = () => {
  return (
    <main className="employee-page">
      <div className="employee-page__content">
        <header className="employee-header">
          <img
            className="employee-header__logo"
            src="/assets/brainmint-logo.png"
            alt="BrainMint"
          />
          <Link className="employee-header__profile" to="/employee/profile" aria-label="My profile">
            <Icon name="user" size={20} />
          </Link>
        </header>

        <section className="employee-welcome">
          <div>
            <p className="employee-welcome__eyebrow">EMPLOYEE PORTAL</p>
            <h1>My Devices</h1>
            <p>View your registered devices and their security compliance.</p>
          </div>
        </section>

        <section className="employee-metrics" aria-label="Device summary">
          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Registered Devices</span>
              <Icon name="monitor" size={18} />
            </div>
            <strong>02</strong>
            <p>Devices assigned to you</p>
          </article>

          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Compliant Devices</span>
              <Icon name="shield-check" size={18} />
            </div>
            <strong>02</strong>
            <p>Meeting security requirements</p>
          </article>

          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Non-compliant</span>
              <Icon name="alert-triangle" size={18} />
            </div>
            <strong>00</strong>
            <p>No security issues detected</p>
          </article>

          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Device Health</span>
              <Icon name="check-circle" size={18} />
            </div>
            <strong>100%</strong>
            <p>All registered devices healthy</p>
          </article>
        </section>

        <section className="employee-panel">
          <div className="employee-panel__heading">
            <div>
              <h2>Registered devices</h2>
              <p>Devices currently associated with your account</p>
            </div>
            <span className="employee-status employee-status--approved">All compliant</span>
          </div>

          <div className="device-list">
            {devices.map((device) => (
              <article className="device-card" key={device.id}>
                <div className="device-card__icon">
                  <Icon name={device.icon} size={25} />
                </div>

                <div className="device-card__details">
                  <h3>{device.name}</h3>
                  <p>{device.type} · {device.id}</p>
                  <p>{device.os}</p>
                  <small>Last active: {device.lastActive}</small>
                </div>

                <span className="employee-status employee-status--approved">
                  {device.status}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="employee-panel device-security-panel">
          <h2>Device security requirements</h2>
          <p className="employee-panel__description">
            Your registered devices are checked against company security policies.
          </p>

          <div className="device-security-item">
            <Icon name="check-circle" size={18} />
            <span>Operating system is up to date</span>
            <strong>Passed</strong>
          </div>

          <div className="device-security-item">
            <Icon name="check-circle" size={18} />
            <span>Device encryption enabled</span>
            <strong>Passed</strong>
          </div>

          <div className="device-security-item">
            <Icon name="check-circle" size={18} />
            <span>Screen lock enabled</span>
            <strong>Passed</strong>
          </div>

          <div className="device-security-item">
            <Icon name="check-circle" size={18} />
            <span>Endpoint protection active</span>
            <strong>Passed</strong>
          </div>
        </section>
      </div>

      <EmployeeBottomNav />
    </main>
  );
};

export default MyDevicesPage;