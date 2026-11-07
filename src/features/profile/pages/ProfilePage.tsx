/**
 * BrainMint Shared Profile Page
 * CyberProduct Platform
 *
 * Unified Profile implementation shared across Employee, Team Lead, and Security roles.
 * Reuses the reference Security Profile architecture, Figma UI, and BrainMint design system
 * while rendering role-isolated identity, organization, session, and navigation data.
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import type { UserRole } from '../../auth/types/auth.types';
import { BrandLogo } from '../../../components/shared/BrandLogo';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Toggle } from '../../../components/ui/Toggle';
import { Icon } from '../../../components/ui/Icon';
import EmployeeBottomNav from '../../employee/components/EmployeeBottomNav';
import LeadBottomNav from '../../approvals/components/LeadBottomNav';
import SecurityBottomNav from '../../security/components/SecurityBottomNav';
import { ROLE_PROFILE_CONFIGS, LOCATION_OPTIONS } from '../data/defaultProfiles';
import type { ProfileTab, SavedProfileSnapshot } from '../types/profile.types';
import './ProfilePage.css';

function getStorageKey(role: UserRole, userId: string): string {
  return `cyberproduct_profile_${role}_${userId}`;
}

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Derive the effective role from the URL path so that admin users or
   * direct routing always respects the role-specific route context.
   */
  const effectiveRole: UserRole = useMemo(() => {
    if (location.pathname.startsWith('/lead/')) return 'lead';
    if (location.pathname.startsWith('/security/')) return 'security';
    if (location.pathname.startsWith('/employee/')) return 'employee';
    return user?.role ?? 'employee';
  }, [location.pathname, user?.role]);

  const config = ROLE_PROFILE_CONFIGS[effectiveRole] ?? ROLE_PROFILE_CONFIGS.employee;
  const currentUserId = user?.id || config.defaultEmployeeId;
  const storageKey = getStorageKey(effectiveRole, currentUserId);

  // Derive initial values from auth user or role config defaults
  const initialName = user?.name || config.defaultName;
  const initialEmail = user?.email || config.defaultEmail;
  const initialEmployeeId = user?.id || config.defaultEmployeeId;

  // Load any previously persisted edits from localStorage
  const loadedSnapshot = useMemo<SavedProfileSnapshot>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedProfileSnapshot>;
        return {
          fullName: parsed.fullName || initialName,
          location: parsed.location || config.defaultLocation,
          workPhone: parsed.workPhone || config.defaultWorkPhone,
          inAppNotifications: parsed.inAppNotifications ?? true,
          emailSummaries: parsed.emailSummaries ?? true,
          criticalAlerts: parsed.criticalAlerts ?? true,
          avatarUrl: parsed.avatarUrl || null,
        };
      }
    } catch {
      // Ignore parse/storage issues
    }
    return {
      fullName: initialName,
      location: config.defaultLocation,
      workPhone: config.defaultWorkPhone,
      inAppNotifications: true,
      emailSummaries: true,
      criticalAlerts: true,
      avatarUrl: null,
    };
  }, [storageKey, initialName, config.defaultLocation, config.defaultWorkPhone]);

  // Tab & Form State
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [fullName, setFullName] = useState(loadedSnapshot.fullName);
  const [locationValue, setLocationValue] = useState(loadedSnapshot.location);
  const [workPhone, setWorkPhone] = useState(loadedSnapshot.workPhone);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(loadedSnapshot.avatarUrl);

  // Notification toggles
  const [inAppNotifications, setInAppNotifications] = useState(loadedSnapshot.inAppNotifications);
  const [emailSummaries, setEmailSummaries] = useState(loadedSnapshot.emailSummaries);
  const [criticalAlerts, setCriticalAlerts] = useState(loadedSnapshot.criticalAlerts);

  // Saved snapshot for Cancel reversion
  const [savedSnapshot, setSavedSnapshot] = useState<SavedProfileSnapshot>(loadedSnapshot);

  // Feedback & validation state
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize state when role or user changes
  useEffect(() => {
    setFullName(loadedSnapshot.fullName);
    setLocationValue(loadedSnapshot.location);
    setWorkPhone(loadedSnapshot.workPhone);
    setAvatarUrl(loadedSnapshot.avatarUrl);
    setInAppNotifications(loadedSnapshot.inAppNotifications);
    setEmailSummaries(loadedSnapshot.emailSummaries);
    setCriticalAlerts(loadedSnapshot.criticalAlerts);
    setSavedSnapshot(loadedSnapshot);
  }, [loadedSnapshot]);

  // Compute initials for the avatar bubble
  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'BM';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [fullName]);

  // Helper to persist snapshot
  const persistSnapshot = (nextSnapshot: SavedProfileSnapshot) => {
    setSavedSnapshot(nextSnapshot);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextSnapshot));
    } catch {
      // Ignore quota errors
    }
  };

  // Handle Photo upload
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      const nextSnapshot = { ...savedSnapshot, avatarUrl: url };
      persistSnapshot(nextSnapshot);
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
    const nextSnapshot: SavedProfileSnapshot = {
      fullName: fullName.trim(),
      location: locationValue,
      workPhone: workPhone.trim(),
      inAppNotifications,
      emailSummaries,
      criticalAlerts,
      avatarUrl,
    };
    persistSnapshot(nextSnapshot);
    setFeedbackMessage('Personal information saved successfully.');
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Handle Cancel
  const handleCancel = () => {
    setFullName(savedSnapshot.fullName);
    setLocationValue(savedSnapshot.location);
    setWorkPhone(savedSnapshot.workPhone);
    setInAppNotifications(savedSnapshot.inAppNotifications);
    setEmailSummaries(savedSnapshot.emailSummaries);
    setCriticalAlerts(savedSnapshot.criticalAlerts);
    setErrorMessage(null);
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <p className="security-profile-subtitle">{config.subtitle}</p>
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
              <p className="security-identity-role">{config.roleLabel}</p>
              <p className="security-identity-sub">
                {initialEmployeeId} · Joined {config.joinedDate}
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
                    <label htmlFor="prof-fullname" className="security-form-label">
                      Full name
                    </label>
                    <input
                      id="prof-fullname"
                      type="text"
                      className="security-form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="security-form-group">
                    <label htmlFor="prof-empid" className="security-form-label">
                      Employee ID
                    </label>
                    <input
                      id="prof-empid"
                      type="text"
                      className="security-form-input"
                      value={initialEmployeeId}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className="security-form-group security-form-group--full">
                  <label htmlFor="prof-email" className="security-form-label">
                    Work email
                  </label>
                  <input
                    id="prof-email"
                    type="email"
                    className="security-form-input"
                    value={initialEmail}
                    disabled
                    readOnly
                  />
                  <span className="security-form-hint">
                    Contact IT to change your work email or assigned role.
                  </span>
                </div>

                <div className="security-form-row" style={{ marginTop: '0.5rem' }}>
                  <div className="security-form-group">
                    <label htmlFor="prof-location" className="security-form-label">
                      Location
                    </label>
                    <select
                      id="prof-location"
                      className="security-form-input security-form-select"
                      value={locationValue}
                      onChange={(e) => setLocationValue(e.target.value)}
                    >
                      {LOCATION_OPTIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="security-form-group">
                    <label htmlFor="prof-phone" className="security-form-label">
                      Work phone
                    </label>
                    <input
                      id="prof-phone"
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
                  <span className="security-org-value">{config.department}</span>
                </div>
                <div className="security-org-item">
                  <span className="security-org-label">Reports to</span>
                  <span className="security-org-value">{config.reportsTo}</span>
                </div>
              </div>

              <div className="security-org-item" style={{ marginTop: '0.75rem' }}>
                <span className="security-org-label">Assigned access scope</span>
                <span className="security-org-scope">{config.accessScope}</span>
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
                  <Icon name="check-circle" size={18} className="security-overview-icon" />
                  <div className="security-overview-text">
                    <strong>Multi-factor authentication on</strong>
                    <span>{config.mfaDetails}</span>
                  </div>
                </div>

                <div className="security-overview-item">
                  <Icon name="check-circle" size={18} className="security-overview-icon" />
                  <div className="security-overview-text">
                    <strong>Password last changed</strong>
                    <span>{config.passwordLastChanged}</span>
                  </div>
                </div>

                <div className="security-overview-item">
                  <Icon name="check-circle" size={18} className="security-overview-icon" />
                  <div className="security-overview-text">
                    <strong>Recovery email verified</strong>
                    <span>{config.recoveryEmailStatus}</span>
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
                  <div className="security-session-field-val">{config.device}</div>
                </div>

                <div>
                  <div className="security-session-field-label">Signed in</div>
                  <div className="security-session-field-val">{config.signedInAt}</div>
                </div>

                <div className="security-vpn-status">
                  <span className="security-vpn-dot" />
                  <span>{config.networkStatus}</span>
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
                    id="prof-toggle-inapp"
                    checked={inAppNotifications}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setInAppNotifications(next);
                      persistSnapshot({ ...savedSnapshot, inAppNotifications: next });
                    }}
                    aria-label="In-app notifications"
                  />
                </div>

                <div className="security-notification-item">
                  <div className="security-notification-info">
                    <strong>Email summaries</strong>
                    <span>Daily digest at 08:00 UTC</span>
                  </div>
                  <Toggle
                    id="prof-toggle-email"
                    checked={emailSummaries}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setEmailSummaries(next);
                      persistSnapshot({ ...savedSnapshot, emailSummaries: next });
                    }}
                    aria-label="Email summaries"
                  />
                </div>

                <div className="security-notification-item">
                  <div className="security-notification-info">
                    <strong>{config.criticalAlertsLabel}</strong>
                    <span>Always delivered immediately</span>
                  </div>
                  <Toggle
                    id="prof-toggle-critical"
                    checked={criticalAlerts}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setCriticalAlerts(next);
                      persistSnapshot({ ...savedSnapshot, criticalAlerts: next });
                    }}
                    aria-label={config.criticalAlertsLabel}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Role-specific bottom navigation ── */}
      {effectiveRole === 'employee' && <EmployeeBottomNav />}
      {effectiveRole === 'lead' && <LeadBottomNav activeId="profile" />}
      {!location.pathname.startsWith('/security') && effectiveRole === 'security' && (
        <SecurityBottomNav />
      )}
    </main>
  );
};

export default ProfilePage;
