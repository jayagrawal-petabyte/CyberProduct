/**
 * BrainMint NotificationsPage
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Shared in-app notifications page serving Employee, Team Lead, and Security roles.
 *
 * Role experience is determined by the current URL path so that admin users
 * accessing /lead/notifications or /security/notifications see the
 * appropriate role context rather than a generic admin view.
 *
 * Layout matches the three supplied Figma references:
 *   - BrainMint logo + "Manage in Profile" + "Mark all as read" header
 *   - Role-specific subtitle
 *   - All | Unread | Access | Security | Policies filter tabs
 *   - White inbox card with category select + notification list
 *   - 90-day retention message
 *   - Role-specific bottom dock
 *
 * Employee: EmployeeBottomNav (consistent with all other employee pages)
 * Lead: FloatingDock matching the approval-page dock icon set
 * Security: FloatingDock matching the SecurityProfilePage dock (alerts active)
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import EmployeeBottomNav from '../../employee/components/EmployeeBottomNav';
import LeadBottomNav from '../../approvals/components/LeadBottomNav';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationFilters } from '../components/NotificationFilters';
import { NotificationList } from '../components/NotificationList';
import type { NotificationFilterTab } from '../types/notification.types';
import type { UserRole } from '../../auth/types/auth.types';
import './NotificationsPage.css';

// ── Role config ──────────────────────────────────────────────────────────────
interface RoleConfig {
  subtitle: string;
  profileLink: string;
  markAllVariant: 'outline' | 'primary';
}

const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  employee: {
    subtitle: 'Access decisions, policy updates, and security reminders for your account.',
    profileLink: '/employee/profile',
    markAllVariant: 'outline',
  },
  lead: {
    subtitle: "Your team's approval queue, access updates, and security reminders.",
    profileLink: '/lead/profile',
    markAllVariant: 'primary',
  },
  security: {
    subtitle: 'Security escalations, compliance updates, and administrative activity across Acme.',
    profileLink: '/security/profile',
    markAllVariant: 'primary',
  },
  admin: {
    subtitle: 'Administrative notifications, security escalations, and compliance updates.',
    profileLink: '/admin',
    markAllVariant: 'primary',
  },
};

// ── Component ────────────────────────────────────────────────────────────────
const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  /**
   * Derive the effective role from the URL so that admin users accessing
   * /lead/notifications or /security/notifications see the correct content.
   */
  const effectiveRole: UserRole = (() => {
    if (location.pathname.startsWith('/lead/')) return 'lead';
    if (location.pathname.startsWith('/security/')) return 'security';
    if (location.pathname.startsWith('/employee/')) return 'employee';
    return user?.role ?? 'employee';
  })();

  const userId = user?.id ?? 'anon';

  const {
    notifications,
    unreadCount,
    isLoading,
    hasLoaded,
    error,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications(effectiveRole, userId);

  const config = ROLE_CONFIG[effectiveRole] ?? ROLE_CONFIG.employee;

  // Sync the category select with the current tab
  const categorySelectValue =
    activeFilter === 'access' || activeFilter === 'security' || activeFilter === 'policies'
      ? activeFilter
      : 'all';

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as NotificationFilterTab | 'all';
    setActiveFilter(val === 'all' ? 'all' : (val as NotificationFilterTab));
  };

  const handleMarkAllAsRead = () => {
    void markAllAsRead();
  };

  return (
    <main className="notif-page">
      {/* ── Decorative ambient background ── */}
      <div
        className={`notif-page__decorations notif-page__decorations--${effectiveRole}`}
        aria-hidden="true"
      >
        <div className="notif-page__deco-circle-lg" />
        <div className="notif-page__deco-circle-sm" />
        <div className="notif-page__deco-blob" />
      </div>

      <div className="notif-page__container">

        {/* ── Brand header ── */}
        <header className="notif-page__brand-header">
          <img
            src="/assets/brainmint-logo.png"
            alt="BrainMint"
            className="notif-page__logo"
          />
          <div className="notif-page__header-actions">
            <Link to={config.profileLink} className="notif-page__profile-link">
              Manage in Profile →
            </Link>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className={`notif-page__mark-all-btn notif-page__mark-all-btn--${config.markAllVariant}`}
              aria-label={`Mark all ${unreadCount} notifications as read`}
            >
              <Icon name="check" size={14} />
              Mark all as read
            </button>
          </div>
        </header>

        {/* ── Page title ── */}
        <section className="notif-page__hero" aria-labelledby="notif-page-heading">
          <h1 id="notif-page-heading" className="notif-page__title">Notifications</h1>
          <p className="notif-page__subtitle">{config.subtitle}</p>
        </section>

        {/* ── Filter tabs ── */}
        <NotificationFilters
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
          unreadCount={unreadCount}
        />

        {/* ── Inbox card ── */}
        <div className="notif-page__inbox" role="region" aria-label="Notifications inbox">
          {/* Card header */}
          <div className="notif-page__inbox-header">
            <div>
              <h2 className="notif-page__inbox-title">Inbox</h2>
              <p className="notif-page__inbox-subtitle">Stay informed about your workspace</p>
            </div>
            <div className="notif-page__inbox-controls">
              <div className="notif-page__search-wrap">
                <span className="notif-page__search-icon">
                  <Icon name="search" size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search notifications"
                  className="notif-page__search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="notif-page__search-clear"
                  >
                    <Icon name="x" size={12} />
                  </button>
                )}
              </div>
              <select
                className="notif-page__category-select"
                value={categorySelectValue}
                onChange={handleCategorySelect}
                aria-label="Filter by category"
              >
                <option value="all">All categories</option>
                <option value="access">Access</option>
                <option value="security">Security</option>
                <option value="policies">Policies</option>
              </select>
            </div>
          </div>

          {/* Notification feed */}
          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            hasLoaded={hasLoaded}
            error={error}
            onMarkRead={(id) => { void markAsRead(id); }}
            onDelete={deleteNotification}
            onRetry={() => { void refresh(); }}
          />
        </div>

      </div>

      {/* ── Role-specific bottom navigation ── */}
      {effectiveRole === 'employee' && <EmployeeBottomNav />}

      {effectiveRole === 'lead' && (
        <LeadBottomNav activeId="notifications" />
      )}
    </main>
  );
};

export default NotificationsPage;
