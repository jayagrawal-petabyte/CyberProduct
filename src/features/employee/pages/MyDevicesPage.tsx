import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import {
  getMyDevices,
  registerDevice,
  type BackendDevice,
} from '../../../services/api/devicesApi';
import { ApiError } from '../../../services/api/apiClient';
import './MyDevicesPage.css';

function deviceIcon(deviceType: string): 'laptop' | 'smartphone' {
  const t = deviceType.toLowerCase();
  if (t === 'mobile' || t === 'tablet' || t === 'smartphone') return 'smartphone';
  return 'laptop';
}

function statusClass(status: string): string {
  if (status === 'active') return 'approved';
  if (status === 'revoked') return 'rejected';
  return 'pending';
}

function statusLabel(status: string): string {
  if (status === 'active') return 'Active';
  if (status === 'revoked') return 'Revoked';
  if (status === 'pending') return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
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

const MyDevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<BackendDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('laptop');
  const [platform, setPlatform] = useState('');
  const [osVersion, setOsVersion] = useState('');
  const [hardwareId, setHardwareId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  async function loadDevices() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyDevices();
      setDevices(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load devices.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDevices();
  }, []);

  const handleRegisterDevice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deviceName.trim() || !platform.trim() || !hardwareId.trim()) return;

    setIsSubmitting(true);
    setRegisterError(null);
    try {
      const newDevice = await registerDevice({
        device_name: deviceName.trim(),
        device_type: deviceType,
        platform: platform.trim(),
        os_version: osVersion.trim() || undefined,
        hardware_id: hardwareId.trim(),
      });
      setDevices((prev) => [newDevice, ...prev]);
      setDeviceName('');
      setDeviceType('laptop');
      setPlatform('');
      setOsVersion('');
      setHardwareId('');
      setIsRegisterModalOpen(false);
    } catch (err) {
      setRegisterError(err instanceof ApiError ? err.message : 'Failed to register device.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => d.status === 'active').length;
  const revokedDevices = devices.filter((d) => d.status === 'revoked').length;
  const healthPct = totalDevices ? Math.round((activeDevices / totalDevices) * 100) : 0;

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
            <p>View your registered devices and their security compliance.</p>
          </div>
        </section>

        {error && (
          <div className="employee-panel" style={{ color: 'var(--color-danger, #c0392b)', padding: '0.75rem 1rem' }}>
            <Icon name="alert-triangle" size={16} /> {error}{' '}
            <button type="button" onClick={() => void loadDevices()} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        )}

        <section className="employee-metrics" aria-label="Device summary">
          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Registered Devices</span>
              <Icon name="monitor" size={18} />
            </div>
            <strong>{isLoading ? '—' : String(totalDevices).padStart(2, '0')}</strong>
            <p>Devices assigned to you</p>
          </article>

          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Active Devices</span>
              <Icon name="shield-check" size={18} />
            </div>
            <strong>{isLoading ? '—' : String(activeDevices).padStart(2, '0')}</strong>
            <p>Meeting security requirements</p>
          </article>

          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Revoked</span>
              <Icon name="alert-triangle" size={18} />
            </div>
            <strong>{isLoading ? '—' : String(revokedDevices).padStart(2, '0')}</strong>
            <p>{revokedDevices > 0 ? 'Review revoked devices' : 'No revoked devices'}</p>
          </article>

          <article className="employee-metric-card">
            <div className="employee-metric-card__top">
              <span>Device Health</span>
              <Icon name="check-circle" size={18} />
            </div>
            <strong>{isLoading ? '—' : `${healthPct}%`}</strong>
            <p>Active / registered ratio</p>
          </article>
        </section>

        <section className="employee-panel">
          <div className="employee-panel__heading">
            <div>
              <h2>Registered devices</h2>
              <p>Devices currently associated with your account</p>
            </div>

            <div className="device-heading-actions">
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

          {isLoading ? (
            <p style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Loading devices…</p>
          ) : devices.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Icon name="monitor" size={32} />
              <p style={{ marginTop: '0.5rem' }}>No devices registered yet.</p>
              <button
                type="button"
                className="register-device-btn"
                style={{ marginTop: '1rem' }}
                onClick={() => setIsRegisterModalOpen(true)}
              >
                Register your first device
              </button>
            </div>
          ) : (
            <div className="device-list">
              {devices.map((device) => (
                <article className="device-card" key={device.id}>
                  <div className="device-card__icon">
                    <Icon name={deviceIcon(device.device_type)} size={25} />
                  </div>

                  <div className="device-card__details">
                    <h3>{device.device_name}</h3>
                    <p>
                      {device.device_type} · {device.platform}
                    </p>
                    {device.os_version && <p>{device.os_version}</p>}
                    <small>Registered: {formatDate(device.created_at)}</small>
                  </div>

                  <span className={`employee-status employee-status--${statusClass(device.status)}`}>
                    {statusLabel(device.status)}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="employee-panel device-security-panel">
          <h2>Device security requirements</h2>
          <p className="employee-panel__description">
            Your registered devices are checked against company security policies.
          </p>

          <div className="device-security-item">
            <Icon name="check-circle" size={18} />
            <span>Device registered through official portal</span>
            <strong>Required</strong>
          </div>

          <div className="device-security-item">
            <Icon name="check-circle" size={18} />
            <span>Hardware ID verified</span>
            <strong>Required</strong>
          </div>

          <div className="device-security-item">
            <Icon name="shield-check" size={18} />
            <span>Contact IT for compliance checks</span>
            <strong>Guidance</strong>
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

            {registerError && (
              <div style={{ color: 'var(--color-danger, #c0392b)', padding: '0.5rem 0', fontSize: '0.875rem' }}>
                {registerError}
              </div>
            )}

            <form onSubmit={(e) => void handleRegisterDevice(e)}>
              <label>
                Device Name *
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro 14"
                  value={deviceName}
                  onChange={(event) => setDeviceName(event.target.value)}
                  required
                />
              </label>

              <label>
                Device Type *
                <select
                  value={deviceType}
                  onChange={(event) => setDeviceType(event.target.value)}
                >
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>
              </label>

              <label>
                Platform *
                <input
                  type="text"
                  placeholder="e.g. macOS, Windows, Android"
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value)}
                  required
                />
              </label>

              <label>
                OS Version
                <input
                  type="text"
                  placeholder="e.g. macOS Sequoia 15.1"
                  value={osVersion}
                  onChange={(event) => setOsVersion(event.target.value)}
                />
              </label>

              <label>
                Hardware ID *
                <input
                  type="text"
                  placeholder="e.g. serial number or IMEI"
                  value={hardwareId}
                  onChange={(event) => setHardwareId(event.target.value)}
                  required
                />
              </label>

              <div className="device-modal-actions">
                <button
                  type="button"
                  className="device-cancel-btn"
                  onClick={() => setIsRegisterModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button type="submit" className="register-device-btn" disabled={isSubmitting}>
                  <Icon name="plus" size={16} />
                  {isSubmitting ? 'Registering…' : 'Register Device'}
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
