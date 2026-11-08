
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import './MyDevicesPage.css';

type Device = {
  name: string;
  type: string;
  id: string;
  os: string;
  lastActive: string;
  status: 'Compliant';
  icon: 'laptop' | 'smartphone';
};

const initialDevices: Device[] = [
  {
    name: 'MacBook Pro 14"',
    type: 'Laptop',
    id: 'DEV-1024',
    os: 'macOS Sequoia 15.1',
    lastActive: 'Today, 08:45',
    status: 'Compliant',
    icon: 'laptop',
  },
  {
    name: 'iPhone 15',
    type: 'Mobile',
    id: 'DEV-1025',
    os: 'iOS 18.1',
    lastActive: 'Today, 08:30',
    status: 'Compliant',
    icon: 'smartphone',
  },
];

const MyDevicesPage: React.FC = () => {
  const [registeredDevices, setRegisteredDevices] =
    useState<Device[]>(initialDevices);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('Laptop');
  const [operatingSystem, setOperatingSystem] = useState('');

  const handleRegisterDevice = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!deviceName.trim() || !operatingSystem.trim()) {
      return;
    }

    const newDevice: Device = {
      name: deviceName.trim(),
      type: deviceType,
      id: `DEV-${Date.now().toString().slice(-6)}`,
      os: operatingSystem.trim(),
      lastActive: 'Just registered',
      status: 'Compliant',
      icon:
        deviceType === 'Mobile' || deviceType === 'Tablet'
          ? 'smartphone'
          : 'laptop',
    };

    setRegisteredDevices((current) => [...current, newDevice]);

    setDeviceName('');
    setDeviceType('Laptop');
    setOperatingSystem('');
    setIsRegisterModalOpen(false);
  };

  const totalDevices = registeredDevices.length;

  const compliantDevices = registeredDevices.filter(
    (device) => device.status === 'Compliant'
  ).length;

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
            <h1>My Devices</h1>
            <p>
              View your registered devices and their security compliance.
            </p>
          </div>
        </section>

        <section className="employee-metrics" aria-label="Device summary">
          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Registered Devices</span>
              <Icon name="monitor" size={18} />
            </div>
            <strong>{String(totalDevices).padStart(2, '0')}</strong>
            <p>Devices assigned to you</p>
          </article>

          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Compliant Devices</span>
              <Icon name="shield-check" size={18} />
            </div>
            <strong>{String(compliantDevices).padStart(2, '0')}</strong>
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
            <strong>
              {totalDevices
                ? Math.round((compliantDevices / totalDevices) * 100)
                : 0}%
            </strong>
            <p>All registered devices healthy</p>
          </article>
        </section>

        <section className="employee-panel">
          <div className="employee-panel__heading">
            <div>
              <h2>Registered devices</h2>
              <p>Devices currently associated with your account</p>
            </div>

            <div className="device-heading-actions">
              <span className="employee-status employee-status--approved">
                All compliant
              </span>

              <button
                type="button"
                className="register-device-btn"
                onClick={() => setIsRegisterModalOpen(true)}
              >
                <Icon name="plus" size={16} />
                Register Device
              </button>
            </div>
          </div>

          <div className="device-list">
            {registeredDevices.map((device) => (
              <article className="device-card" key={device.id}>
                <div className="device-card__icon">
                  <Icon name={device.icon} size={25} />
                </div>

                <div className="device-card__details">
                  <h3>{device.name}</h3>
                  <p>
                    {device.type} · {device.id}
                  </p>
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
            Your registered devices are checked against company security
            policies.
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

      {isRegisterModalOpen && (
        <div
          className="device-modal-overlay"
          onClick={() => setIsRegisterModalOpen(false)}
        >
          <div
            className="device-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="device-modal-header">
              <div>
                <h2>Register New Device</h2>
                <p>Add a device to your employee account.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon name="x" />
              </button>
            </div>

            <form onSubmit={handleRegisterDevice}>
              <label>
                Device Name
                <input
                  type="text"
                  placeholder="e.g. Dell Laptop"
                  value={deviceName}
                  onChange={(event) => setDeviceName(event.target.value)}
                  required
                />
              </label>

              <label>
                Device Type
                <select
                  value={deviceType}
                  onChange={(event) => setDeviceType(event.target.value)}
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Tablet">Tablet</option>
                </select>
              </label>

              <label>
                Operating System
                <input
                  type="text"
                  placeholder="e.g. Windows 11"
                  value={operatingSystem}
                  onChange={(event) =>
                    setOperatingSystem(event.target.value)
                  }
                  required
                />
              </label>

              <div className="device-modal-actions">
                <button
                  type="button"
                  className="device-cancel-btn"
                  onClick={() => setIsRegisterModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="register-device-btn">
                  <Icon name="plus" size={16} />
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EmployeeBottomNav />
    </main>
  );
};

export default MyDevicesPage;
