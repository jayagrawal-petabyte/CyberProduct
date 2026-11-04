/**
 * BrainMint Security Profile Page
 * CyberProduct Platform
 *
 * Implements the Security Administrator Profile screen matching the approved Figma design:
 * - Brand logo & page heading
 * - Identity card with avatar, role, status badge, employee ID, and change photo action
 * - Tabs for Personal Information, Security & Sessions, and Preferences
 * - Personal Information & Organization details
 * - Security overview with MFA & compliance indicators
 * - Current session details with verified network status & logout action
 * - Notification delivery preferences with functional toggle switches
 * - Bottom Floating Dock with Profile active
 */

import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { BrandLogo } from '../../../components/shared/BrandLogo';
import { FloatingDock, type DockItem } from '../../../components/shared/FloatingDock';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Toggle } from '../../../components/ui/Toggle';
import { Icon } from '../../../components/ui/Icon';
import './SecurityProfilePage.css';

interface SecurityProfileMockData {
  joinedDate: string;
  department: string;
  reportsTo: string;
  accessScope: string;
  device: string;
  signedInAt: string;
  networkStatus: string;
  passwordLastChanged: string;
  mfaDetails: string;
  recoveryEmailStatus: string;
}

const DEFAULT_SECURITY_MOCK_DATA: SecurityProfileMockData = {
  joinedDate: '16 Jan 2023',
  department: 'Security',
  reportsTo: 'Marcus Lee · CISO',
  accessScope: 'Organization-wide security administration · Privileged role',
  device: 'Chrome 130 · MBP-PSHAH-01',
  signedInAt: '24 Oct 2026, 07:30 UTC',
  networkStatus: 'Acme Corporate VPN · Trusted',
  passwordLastChanged: '02 Oct 2026 · Managed by Acme SSO',
  mfaDetails: 'Authenticator app + FIDO2 security key',
  recoveryEmailStatus: 'Your recovery method is up to date.',
};

const LOCATION_OPTIONS = [
  'San Francisco, US',
  'New York, US',
  'London, UK',
  'Bengaluru, IN',
  'Remote, Global',
];

type ProfileTab = 'personal' | 'security' | 'preferences';

export const SecurityProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Identity defaults derived from authenticated user or fallback values
  const defaultName = user?.name || 'Priya Shah';
  const defaultEmail = user?.email || 'priya.shah@acme.com';
  const defaultEmployeeId = user?.id || 'EMP-1003';

  // State management
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [fullName, setFullName] = useState(defaultName);
  const [location, setLocation] = useState('San Francisco, US');
  const [workPhone, setWorkPhone] = useState('+1 (415) 555-0103');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Saved snapshot for Cancel reversion
  const [savedSnapshot, setSavedSnapshot] = useState({
    fullName: defaultName,
    location: 'San Francisco, US',
    workPhone: '+1 (415) 555-0103',
  });

  // Notification toggles
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailSummaries, setEmailSummaries] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);

  // Feedback & validation state
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute initials for the avatar bubble
  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'PS';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [fullName]);

  // Handle Photo upload
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      setFeedbackMessage('Profile photo updated successfully.');
      setTimeout(() => setFeedbackMessage(null), 3500);
    }
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Full name cannot be empty.');
      return;
    }

    setErrorMessage(null);
    setSavedSnapshot({
      fullName,
      location,
      workPhone,
    });
    setFeedbackMessage('Personal information saved successfully.');
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Handle Cancel
  const handleCancel = () => {
    setFullName(savedSnapshot.fullName);
    setLocation(savedSnapshot.location);
    setWorkPhone(savedSnapshot.workPhone);
    setErrorMessage(null);
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Security navigation dock items
  const securityDockItems: DockItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home', href: '/security/profile' },
    { id: 'requests', label: 'Requests', icon: 'file-text', href: '/security/profile' },
    { id: 'devices', label: 'Devices', icon: 'monitor', href: '/security/profile' },
    { id: 'cloud', label: 'Cloud Resources', icon: 'shield', href: '/security/profile' },
    { id: 'grid', label: 'Applications', icon: 'grid', href: '/security/profile' },
    { id: 'audit', label: 'Audit Logs', icon: 'file-text', href: '/security/profile' },
    { id: 'alerts', label: 'Threat Alerts', icon: 'bell', href: '/security/notifications' },
    { id: 'profile', label: 'Security Profile', icon: 'user', href: '/security/profile' },
  ];

  return (
    <main className="security-profile-page">
      {/* Decorative ambient background waves */}
      <div className="security-profile-decorations" aria-hidden="true">
        <svg
          className="security-profile-wave-top"
          viewBox="0 0 520 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M520 0H220C280 90 380 120 420 220C460 320 380 390 520 420V0Z"
            fill="var(--color-brand-wave-dark, #2b193d)"
          />
          <path
            d="M520 0H310C360 80 430 110 470 190C500 250 490 320 520 360V0Z"
            fill="var(--color-brand-wave-mid, #4a235c)"
            opacity="0.6"
          />
        </svg>
        <div className="security-profile-accent-dot" />
      </div>

      <div className="security-profile-container">
        {/* Top Header */}
        <header className="security-profile-header">
          <div className="security-profile-logo-wrap">
            <BrandLogo size="md" />
          </div>
          <h1 className="security-profile-title">Profile</h1>
          <p className="security-profile-subtitle">
            Manage your administrator identity, account security, and notification preferences.
          </p>
        </header>

        {/* Feedback Alert Banner */}
        {feedbackMessage && (
          <div className="security-feedback-toast" role="status">
            <Icon name="check-circle" size={16} />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            className="security-feedback-toast"
            style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}
            role="alert"
          >
            <Icon name="alert-triangle" size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── 1. Profile Identity Card (Top Card) ─────────────────────────── */}
        <section className="security-identity-card" aria-label="Identity overview">
          <div className="security-identity-left">
            <div className="security-avatar-circle">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="security-avatar-img" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="security-identity-meta">
              <div className="security-identity-name-row">
                <span className="security-identity-name">{fullName}</span>
                <StatusBadge status="active" label="Active account" />
              </div>
              <p className="security-identity-role">Security Administrator · Security</p>
              <p className="security-identity-sub">
                {defaultEmployeeId} · Joined {DEFAULT_SECURITY_MOCK_DATA.joinedDate}
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              className="security-change-photo-btn"
              onClick={handlePhotoClick}
              aria-label="Change profile photo"
            >
              {/* Camera icon matching Figma */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span>Change photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              aria-hidden="true"
            />
          </div>
        </section>

        {/* ── 2. Tabs Navigation ────────────────────────────────────────── */}
        <nav className="security-profile-tabs" aria-label="Profile sections">
          <button
            type="button"
            className={`security-profile-tab ${
              activeTab === 'personal' ? 'security-profile-tab--active' : ''
            }`}
            onClick={() => setActiveTab('personal')}
            aria-current={activeTab === 'personal' ? 'page' : undefined}
          >
            Personal information
          </button>
          <button
            type="button"
            className={`security-profile-tab ${
              activeTab === 'security' ? 'security-profile-tab--active' : ''
            }`}
            onClick={() => setActiveTab('security')}
            aria-current={activeTab === 'security' ? 'page' : undefined}
          >
            Security &amp; sessions
          </button>
          <button
            type="button"
            className={`security-profile-tab ${
              activeTab === 'preferences' ? 'security-profile-tab--active' : ''
            }`}
            onClick={() => setActiveTab('preferences')}
            aria-current={activeTab === 'preferences' ? 'page' : undefined}
          >
            Preferences
          </button>
        </nav>

        {/* ── 3. Main Two-Column Layout ─────────────────────────────────── */}
        <div className="security-profile-grid">
          {/* Left Column */}
          <div className="security-profile-col">
            {/* Personal Information Form Card */}
            <section className="security-panel-card" aria-label="Personal information">
              <h2 className="security-card-title">Personal information</h2>
              <p className="security-card-subtitle">
                Your work identity is managed by Acme's identity provider
              </p>

              <form onSubmit={handleSave}>
                <div className="security-form-row">
                  <div className="security-form-group">
                    <label htmlFor="sec-fullname" className="security-form-label">
                      Full name
                    </label>
                    <input
                      id="sec-fullname"
                      type="text"
                      className="security-form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="security-form-group">
                    <label htmlFor="sec-empid" className="security-form-label">
                      Employee ID
                    </label>
                    <input
                      id="sec-empid"
                      type="text"
                      className="security-form-input"
                      value={defaultEmployeeId}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className="security-form-group security-form-group--full">
                  <label htmlFor="sec-email" className="security-form-label">
                    Work email
                  </label>
                  <input
                    id="sec-email"
                    type="email"
                    className="security-form-input"
                    value={defaultEmail}
                    disabled
                    readOnly
                  />
                  <span className="security-form-hint">
                    Contact IT to change your work email or assigned role.
                  </span>
                </div>

                <div className="security-form-row" style={{ marginTop: '0.5rem' }}>
                  <div className="security-form-group">
                    <label htmlFor="sec-location" className="security-form-label">
                      Location
                    </label>
                    <select
                      id="sec-location"
                      className="security-form-input security-form-select"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      {LOCATION_OPTIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="security-form-group">
                    <label htmlFor="sec-phone" className="security-form-label">
                      Work phone
                    </label>
                    <input
                      id="sec-phone"
                      type="tel"
                      className="security-form-input"
                      value={workPhone}
                      onChange={(e) => setWorkPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="security-form-actions">
                  <button type="submit" className="security-btn-primary">
                    Save changes
                  </button>
                  <button
                    type="button"
                    className="security-btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>

            {/* Organization & Access Card */}
            <section className="security-panel-card" aria-label="Organization & access">
              <h2 className="security-card-title" style={{ marginBottom: '1.25rem' }}>
                Organization &amp; access
              </h2>

              <div className="security-org-grid">
                <div className="security-org-item">
                  <span className="security-org-label">Department</span>
                  <span className="security-org-value">
                    {DEFAULT_SECURITY_MOCK_DATA.department}
                  </span>
                </div>
                <div className="security-org-item">
                  <span className="security-org-label">Reports to</span>
                  <span className="security-org-value">
                    {DEFAULT_SECURITY_MOCK_DATA.reportsTo}
                  </span>
                </div>
              </div>

              <div className="security-org-item" style={{ marginTop: '0.75rem' }}>
                <span className="security-org-label">Assigned access scope</span>
                <span className="security-org-scope">
                  {DEFAULT_SECURITY_MOCK_DATA.accessScope}
                </span>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="security-profile-col">
            {/* Security Overview Card */}
            <section className="security-panel-card" aria-label="Security overview">
              <div className="security-card-header-row">
                <h2 className="security-card-title" style={{ margin: 0 }}>
                  Security overview
                </h2>
                <StatusBadge status="compliant" label="Protected" />
              </div>

              <div className="security-overview-list">
                <div className="security-overview-item">
                  <Icon
                    name="check-circle"
                    size={18}
                    className="security-overview-icon"
                  />
                  <div className="security-overview-text">
                    <strong>Multi-factor authentication on</strong>
                    <span>{DEFAULT_SECURITY_MOCK_DATA.mfaDetails}</span>
                  </div>
                </div>

                <div className="security-overview-item">
                  <Icon
                    name="check-circle"
                    size={18}
                    className="security-overview-icon"
                  />
                  <div className="security-overview-text">
                    <strong>Password last changed</strong>
                    <span>{DEFAULT_SECURITY_MOCK_DATA.passwordLastChanged}</span>
                  </div>
                </div>

                <div className="security-overview-item">
                  <Icon
                    name="check-circle"
                    size={18}
                    className="security-overview-icon"
                  />
                  <div className="security-overview-text">
                    <strong>Recovery email verified</strong>
                    <span>{DEFAULT_SECURITY_MOCK_DATA.recoveryEmailStatus}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Current Session Card */}
            <section className="security-panel-card" aria-label="Current session">
              <h2 className="security-card-title" style={{ marginBottom: '1.25rem' }}>
                Current session
              </h2>

              <div className="security-session-block">
                <div>
                  <div className="security-session-field-label">Device</div>
                  <div className="security-session-field-val">
                    {DEFAULT_SECURITY_MOCK_DATA.device}
                  </div>
                </div>

                <div>
                  <div className="security-session-field-label">Signed in</div>
                  <div className="security-session-field-val">
                    {DEFAULT_SECURITY_MOCK_DATA.signedInAt}
                  </div>
                </div>

                <div className="security-vpn-status">
                  <span className="security-vpn-dot" />
                  <span>{DEFAULT_SECURITY_MOCK_DATA.networkStatus}</span>
                </div>

                <div>
                  <button
                    type="button"
                    className="security-logout-btn"
                    onClick={handleLogout}
                    aria-label="Logout of session"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Notification Settings Card */}
            <section className="security-panel-card" aria-label="Notification delivery preferences">
              <h2 className="security-card-title">Notification Settings</h2>
              <strong
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary, #1e1229)',
                  marginTop: '0.25rem',
                }}
              >
                Delivery preferences
              </strong>
              <p className="security-card-subtitle" style={{ marginBottom: '1.25rem' }}>
                Choose how you stay informed
              </p>

              <div className="security-notification-list">
                <div className="security-notification-item">
                  <div className="security-notification-info">
                    <strong>In-app notifications</strong>
                    <span>All activity and updates</span>
                  </div>
                  <Toggle
                    id="toggle-inapp"
                    checked={inAppNotifications}
                    onChange={(e) => setInAppNotifications(e.target.checked)}
                    aria-label="In-app notifications"
                  />
                </div>

                <div className="security-notification-item">
                  <div className="security-notification-info">
                    <strong>Email summaries</strong>
                    <span>Daily digest at 08:00 UTC</span>
                  </div>
                  <Toggle
                    id="toggle-email"
                    checked={emailSummaries}
                    onChange={(e) => setEmailSummaries(e.target.checked)}
                    aria-label="Email summaries"
                  />
                </div>

                <div className="security-notification-item">
                  <div className="security-notification-info">
                    <strong>Critical security alerts</strong>
                    <span>Always delivered immediately</span>
                  </div>
                  <Toggle
                    id="toggle-critical"
                    checked={criticalAlerts}
                    onChange={(e) => setCriticalAlerts(e.target.checked)}
                    aria-label="Critical security alerts"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Floating Bottom Dock */}
      <FloatingDock
        items={securityDockItems}
        activeId="profile"
        onSelect={(id) => {
          if (id === 'profile') {
            navigate('/security/profile');
          }
        }}
      />
    </main>
  );
};

export default SecurityProfilePage;
