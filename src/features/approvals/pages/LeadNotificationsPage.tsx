import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApprovalIcon } from '../components/ApprovalIcon'
import '../styles/approvalInbox.css'
import '../styles/leadNotifications.css'

interface LeadNotification {
  id: string
  title: string
  message: string
  time: string
  date: string
  isRead: boolean
  category: 'access' | 'security' | 'system' | 'policies'
  iconType: 'green' | 'blue' | 'red' | 'amber' | 'gray'
  iconName: 'check' | 'clipboard' | 'shield-alert' | 'clock' | 'refresh'
  actionUrl?: string
}

const initialLeadNotifications: LeadNotification[] = [
  {
    id: 'ln-001',
    title: 'Access request approved',
    message: 'Your request for GitHub access has been approved.',
    time: '10:30 AM',
    date: 'Oct 24, 2026',
    isRead: false,
    category: 'access',
    iconType: 'green',
    iconName: 'check',
    actionUrl: '/lead/approvals',
  },
  {
    id: 'ln-002',
    title: 'New policy assigned',
    message: 'A new security policy has been assigned to your account.',
    time: '10:12 AM',
    date: 'Oct 24, 2026',
    isRead: false,
    category: 'policies',
    iconType: 'blue',
    iconName: 'clipboard',
  },
  {
    id: 'ln-003',
    title: 'Unusual login attempt',
    message: 'A login attempt was detected from an unrecognised device.',
    time: '9:48 AM',
    date: 'Oct 24, 2026',
    isRead: false,
    category: 'security',
    iconType: 'red',
    iconName: 'shield-alert',
    actionUrl: '/lead/employee-activity',
  },
  {
    id: 'ln-004',
    title: 'Access request pending',
    message: 'Your AWS Console access request is awaiting approval.',
    time: '4:45 PM',
    date: 'Oct 23, 2026',
    isRead: true,
    category: 'access',
    iconType: 'amber',
    iconName: 'clock',
    actionUrl: '/lead/approvals',
  },
  {
    id: 'ln-005',
    title: 'System maintenance scheduled',
    message: 'Scheduled maintenance will take place on October 26.',
    time: '3:10 PM',
    date: 'Oct 23, 2026',
    isRead: true,
    category: 'system',
    iconType: 'gray',
    iconName: 'refresh',
  },
]

export default function LeadNotificationsPage() {
  const [notifications, setNotifications] = useState<LeadNotification[]>(initialLeadNotifications)
  const [activeTab, setActiveTab] = useState<'all' | 'access' | 'security' | 'system'>('all')

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications
    if (activeTab === 'access') return notifications.filter((n) => n.category === 'access')
    if (activeTab === 'security') return notifications.filter((n) => n.category === 'security')
    if (activeTab === 'system') return notifications.filter((n) => n.category === 'system' || n.category === 'policies')
    return notifications
  }, [notifications, activeTab])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    )
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
            <h1>Notifications</h1>
            <p>Stay updated with your access requests and security alerts.</p>
          </div>
          <div className="lead-notif-header-actions">
            <button
              type="button"
              className="lead-notif-mark-all-btn"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              aria-label="Mark all notifications as read"
            >
              <ApprovalIcon name="check" size={16} />
              Mark All as Read
            </button>
          </div>
        </header>

        {/* Category Tabs */}
        <nav className="lead-notif-tabs" aria-label="Notification categories">
          <button
            type="button"
            className={`lead-notif-tab ${activeTab === 'all' ? 'lead-notif-tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
            aria-current={activeTab === 'all' ? 'page' : undefined}
          >
            All
            <span className="lead-notif-tab__badge">{notifications.length}</span>
          </button>

          <button
            type="button"
            className={`lead-notif-tab ${activeTab === 'access' ? 'lead-notif-tab--active' : ''}`}
            onClick={() => setActiveTab('access')}
            aria-current={activeTab === 'access' ? 'page' : undefined}
          >
            Access Requests
          </button>

          <button
            type="button"
            className={`lead-notif-tab ${activeTab === 'security' ? 'lead-notif-tab--active' : ''}`}
            onClick={() => setActiveTab('security')}
            aria-current={activeTab === 'security' ? 'page' : undefined}
          >
            Security Alerts
          </button>

          <button
            type="button"
            className={`lead-notif-tab ${activeTab === 'system' ? 'lead-notif-tab--active' : ''}`}
            onClick={() => setActiveTab('system')}
            aria-current={activeTab === 'system' ? 'page' : undefined}
          >
            System Updates
          </button>
        </nav>

        {/* Status bar */}
        <div className="lead-notif-status-bar">
          <span>
            <strong>{notifications.length} notifications</strong> • {unreadCount} unread
          </span>
          <span>Newest first</span>
        </div>

        {/* Notification Cards List */}
        <section className="lead-notif-list" aria-label="Notification feed">
          {filteredNotifications.length === 0 ? (
            <div className="approval-card" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#64748b' }}>No notifications found in this category.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <article
                key={notif.id}
                className="lead-notif-card"
                onClick={() => toggleRead(notif.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleRead(notif.id)
                  }
                }}
                aria-label={`${notif.title}: ${notif.message}. ${notif.isRead ? 'Read' : 'Unread'}`}
              >
                <div className="lead-notif-card__left">
                  <div className={`lead-notif-card__icon-box lead-notif-card__icon-box--${notif.iconType}`}>
                    <ApprovalIcon name={notif.iconName} size={20} />
                  </div>
                  <div className="lead-notif-card__content">
                    <h3>{notif.title}</h3>
                    <p>{notif.message}</p>
                  </div>
                </div>

                <div className="lead-notif-card__right">
                  <div className="lead-notif-card__time">
                    <span>{notif.time}</span>
                    <span>{notif.date}</span>
                  </div>
                  {!notif.isRead ? (
                    <span className="lead-notif-card__unread-dot" title="Unread" />
                  ) : (
                    <span className="lead-notif-card__read-spacer" />
                  )}
                </div>
              </article>
            ))
          )}
        </section>
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
        <Link
          className="approval-bottom-nav__active"
          to="/lead/notifications"
          aria-current="page"
          aria-label="Notifications"
        >
          <ApprovalIcon name="bell" size={23} />
        </Link>
        <Link to="/lead/profile" aria-label="Profile">
          <ApprovalIcon name="user" size={23} />
        </Link>
      </nav>
    </main>
  )
}

