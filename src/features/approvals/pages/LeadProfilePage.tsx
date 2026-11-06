import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import '../styles/approvalInbox.css'
import '../styles/leadProfile.css'

export default function LeadProfilePage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal')
  const [editing, setEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: 'Alex Morgan',
    department: 'Product Operations',
    workEmail: 'alex.morgan@cyberproduct.io',
    role: 'Security Analyst',
    employeeId: 'EMP-2048',
    phone: '+91 98765 43210',
    password: '••••••••••••',
    twoFactorEnabled: true,
    theme: 'Light',
    language: 'English (US)',
    emailNotifications: true,
    productUpdates: false,
  })

  const [savedData, setSavedData] = useState(formData)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setFormData(savedData)
    setEditing(false)
    setSaveSuccess(false)
  }

  const handleSave = () => {
    setSavedData(formData)
    setEditing(false)
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
    }, 4000)
  }

  return (
    <main className="approval-page">
      <header className="approval-brand-header">
        <Link to="/lead/dashboard">
          <img src="/assets/brainmint-logo.png" alt="BrainMint" />
        </Link>
      </header>

      <div className="approval-content">
        {/* Page Header */}
        <header className="approval-page-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account information and preferences.</p>
          </div>
        </header>

        {saveSuccess && (
          <div
            className="approval-feedback-banner approval-feedback-banner--success"
            role="status"
            style={{ marginBottom: '1rem' }}
          >
            <span>Profile settings saved successfully.</span>
            <button
              type="button"
              onClick={() => setSaveSuccess(false)}
              style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="lead-profile-layout">
          {/* Left Sidebar */}
          <aside className="lead-profile-sidebar">
            <div className="lead-profile-card">
              <div className="lead-profile-avatar">AM</div>
              <h2>{formData.fullName}</h2>
              <p>{formData.department}</p>
              <span className="lead-profile-status">Active</span>
            </div>

            <nav className="lead-profile-nav" aria-label="Profile navigation">
              <button
                type="button"
                className={`lead-profile-nav-item ${
                  activeTab === 'personal' ? 'lead-profile-nav-item--active' : ''
                }`}
                onClick={() => setActiveTab('personal')}
              >
                <span className="lead-profile-nav-item__left">
                  <ApprovalIcon name="user" size={17} />
                  Personal Information
                </span>
                <ApprovalIcon name="chevron-right" size={16} />
              </button>

              <button
                type="button"
                className={`lead-profile-nav-item ${
                  activeTab === 'security' ? 'lead-profile-nav-item--active' : ''
                }`}
                onClick={() => setActiveTab('security')}
              >
                <span className="lead-profile-nav-item__left">
                  <ApprovalIcon name="lock" size={17} />
                  Security Settings
                </span>
                <ApprovalIcon name="chevron-right" size={16} />
              </button>

              <button
                type="button"
                className={`lead-profile-nav-item ${
                  activeTab === 'preferences' ? 'lead-profile-nav-item--active' : ''
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                <span className="lead-profile-nav-item__left">
                  <ApprovalIcon name="sliders" size={17} />
                  Preferences
                </span>
                <ApprovalIcon name="chevron-right" size={16} />
              </button>
            </nav>
          </aside>

          {/* Main Content Panels */}
          <section className="lead-profile-main">
            {/* Panel 1: Personal Information */}
            <article className="lead-profile-panel" id="personal-info">
              <div className="lead-profile-panel__header">
                <h3 className="lead-profile-panel__title">
                  <ApprovalIcon name="user" size={18} />
                  Personal Information
                </h3>
                <button
                  type="button"
                  className="lead-profile-edit-btn"
                  onClick={() => setEditing((prev) => !prev)}
                >
                  <ApprovalIcon name="edit" size={14} />
                  {editing ? 'Done Editing' : 'Edit'}
                </button>
              </div>

              <div className="lead-profile-form-grid">
                <div className="lead-profile-field">
                  <label htmlFor="prof-name">Full Name</label>
                  <input
                    id="prof-name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="lead-profile-field">
                  <label htmlFor="prof-dept">Department</label>
                  <select
                    id="prof-dept"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!editing}
                  >
                    <option value="Product Operations">Product Operations</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Security Operations">Security Operations</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div className="lead-profile-field">
                  <label htmlFor="prof-email">Work Email</label>
                  <input
                    id="prof-email"
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => handleInputChange('workEmail', e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="lead-profile-field">
                  <label htmlFor="prof-role">Role</label>
                  <select
                    id="prof-role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={!editing}
                  >
                    <option value="Security Analyst">Security Analyst</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div className="lead-profile-field">
                  <label htmlFor="prof-empid">Employee ID</label>
                  <input
                    id="prof-empid"
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="lead-profile-field">
                  <label htmlFor="prof-phone">Phone Number</label>
                  <input
                    id="prof-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editing}
                  />
                </div>
              </div>
            </article>

            {/* Panel 2: Security Settings */}
            <article className="lead-profile-panel" id="security-settings">
              <div className="lead-profile-panel__header">
                <h3 className="lead-profile-panel__title">
                  <ApprovalIcon name="lock" size={18} />
                  Security Settings
                </h3>
                <span className="lead-profile-panel__subtitle">
                  Manage your password and account security.
                </span>
              </div>

              <div className="lead-profile-security-grid">
                <div className="lead-profile-password-box">
                  <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                    Password
                  </label>
                  <div className="lead-profile-password-row">
                    <div className="lead-profile-password-input-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        disabled={!editing}
                        aria-label="Password"
                      />
                      <button
                        type="button"
                        className="lead-profile-password-eye"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <ApprovalIcon name="eye" size={16} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="lead-profile-pwd-btn"
                      onClick={() => setEditing(true)}
                    >
                      Change Password
                    </button>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Last changed 32 days ago
                  </span>
                </div>

                <div className="lead-profile-2fa-box">
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                    Two-Factor Authentication (i)
                  </span>
                  <div className="lead-profile-2fa-toggle-row">
                    <label className="lead-profile-toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.twoFactorEnabled}
                        onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
                        aria-label="Two-factor authentication toggle"
                      />
                      <span className="lead-profile-toggle-slider" />
                    </label>
                    <span className="lead-profile-toggle-label">
                      {formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Your account is protected with 2FA.
                  </span>
                </div>
              </div>
            </article>

            {/* Panel 3: Preferences */}
            <article className="lead-profile-panel" id="preferences">
              <div className="lead-profile-panel__header">
                <h3 className="lead-profile-panel__title">
                  <ApprovalIcon name="sliders" size={18} />
                  Preferences
                </h3>
              </div>

              <div className="lead-profile-pref-grid">
                <div className="lead-profile-pref-column">
                  <div className="lead-profile-pref-item">
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                      Theme
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', color: '#64748b' }}>
                        <ApprovalIcon name="sun" size={16} />
                      </span>
                      <select
                        value={formData.theme}
                        onChange={(e) => handleInputChange('theme', e.target.value)}
                        style={{ paddingLeft: '2.2rem', width: '100%' }}
                        aria-label="Theme preference"
                      >
                        <option value="Light">Light</option>
                        <option value="Dark">Dark</option>
                        <option value="System">System</option>
                      </select>
                    </div>
                  </div>

                  <div className="lead-profile-pref-item">
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                      Language
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', color: '#64748b' }}>
                        <ApprovalIcon name="globe" size={16} />
                      </span>
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        style={{ paddingLeft: '2.2rem', width: '100%' }}
                        aria-label="Language preference"
                      >
                        <option value="English (US)">English (US)</option>
                        <option value="English (UK)">English (UK)</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="lead-profile-pref-column">
                  <div className="lead-profile-pref-toggle-item">
                    <div className="lead-profile-pref-toggle-text">
                      <strong>Email Notifications</strong>
                      <p>Receive updates about your requests and access activity.</p>
                    </div>
                    <label className="lead-profile-toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        aria-label="Email Notifications"
                      />
                      <span className="lead-profile-toggle-slider" />
                    </label>
                  </div>

                  <div className="lead-profile-pref-toggle-item">
                    <div className="lead-profile-pref-toggle-text">
                      <strong>Product Updates</strong>
                      <p>Get notified about new features and security enhancements.</p>
                    </div>
                    <label className="lead-profile-toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.productUpdates}
                        onChange={(e) => handleInputChange('productUpdates', e.target.checked)}
                        aria-label="Product Updates"
                      />
                      <span className="lead-profile-toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            </article>

            {/* Bottom Actions */}
            <div className="lead-profile-actions">
              <button
                type="button"
                className="lead-profile-btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lead-profile-btn-save"
                onClick={handleSave}
              >
                <ApprovalIcon name="save" size={16} />
                Save Changes
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <nav className="approval-bottom-nav" aria-label="Primary navigation">
        <Link to="/lead/dashboard" aria-label="Dashboard">
          <ApprovalIcon name="grid" size={23} />
        </Link>
        <Link to="/lead/employee-activity" aria-label="Employee Activity">
          <ApprovalIcon name="monitor" size={23} />
        </Link>
        <button type="button" disabled aria-label="Request access (not available yet)">
          <ApprovalIcon name="plus" size={23} />
        </button>
        <Link to="/lead/approvals" aria-label="Access requests">
          <ApprovalIcon name="clipboard" size={23} />
        </Link>
        <Link to="/lead/notifications" aria-label="Notifications">
          <ApprovalIcon name="bell" size={23} />
        </Link>
        <Link
          className="approval-bottom-nav__active"
          to="/lead/profile"
          aria-current="page"
          aria-label="Profile"
        >
          <ApprovalIcon name="user" size={23} />
        </Link>
      </nav>
    </main>
  )
}

