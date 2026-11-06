import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import './EmployeeNotificationsPage.css';

type Notification = {
  id: number;
  title: string;
  message: string;
  category: string;
  date: string;
  read: boolean;
  icon: 'shield' | 'key' | 'monitor' | 'file-text' | 'bell';
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'Access request approved',
    message: 'Your GitHub Repository access request has been approved.',
    category: 'Access',
    date: 'Today, 09:18',
    read: false,
    icon: 'key',
  },
  {
    id: 2,
    title: 'Policy acknowledgement required',
    message: 'Please review and acknowledge the updated Information Security Policy.',
    category: 'Policy',
    date: 'Yesterday, 14:30',
    read: false,
    icon: 'shield',
  },
  {
    id: 3,
    title: 'Device compliance reminder',
    message: 'Your assigned laptop is due for its next compliance check.',
    category: 'Device',
    date: '04 Nov 2026',
    read: true,
    icon: 'monitor',
  },
  {
    id: 4,
    title: 'New access request submitted',
    message: 'Your Snowflake Analytics access request is awaiting approval.',
    category: 'Access',
    date: '03 Nov 2026',
    read: true,
    icon: 'file-text',
  },
  {
    id: 5,
    title: 'Security announcement',
    message: 'Remember to follow your organization’s security guidelines.',
    category: 'Security',
    date: '01 Nov 2026',
    read: true,
    icon: 'shield',
  },
];

const EmployeeNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const filteredNotifications = notifications.filter((notification) =>
    filter === 'All' ? true : !notification.read,
  );

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      })),
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
            <h1>Notifications</h1>
            <p>Stay updated with your requests, policies, and device alerts.</p>
          </div>
          {unreadCount > 0 && (
            <span className="notification-unread-count">
              {unreadCount} Unread
            </span>
          )}
        </section>

        <section className="employee-panel notifications-panel">
          <div className="notifications-panel__heading">
            <div>
              <h2>Recent notifications</h2>
              <p>You have {unreadCount} unread notifications.</p>
            </div>

            <button
              type="button"
              className="notifications-mark-all"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Icon name="check" size={16} />
              Mark all as read
            </button>
          </div>

          <div className="notifications-filters">
            <button
              type="button"
              className={filter === 'All' ? 'notifications-filter notifications-filter--active' : 'notifications-filter'}
              onClick={() => setFilter('All')}
              aria-pressed={filter === 'All'}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              className={filter === 'Unread' ? 'notifications-filter notifications-filter--active' : 'notifications-filter'}
              onClick={() => setFilter('Unread')}
              aria-pressed={filter === 'Unread'}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="notifications-list">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <article
                  className={`notification-card${notification.read ? '' : ' notification-card--unread'}`}
                  key={notification.id}
                >
                  <div className="notification-card__icon">
                    <Icon name={notification.icon} size={21} />
                  </div>

                  <div className="notification-card__content">
                    <div className="notification-card__title-row">
                      <h3>{notification.title}</h3>
                      {!notification.read && (
                        <span className="notification-new-dot" />
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <div className="notification-card__meta">
                      <span>{notification.category}</span>
                      <span>{notification.date}</span>
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      type="button"
                      className="notification-read-action"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </article>
              ))
            ) : (
              <div className="notifications-empty">
                <Icon name="bell" size={32} />
                <h3>You're all caught up!</h3>
                <p>You have no unread notifications.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <EmployeeBottomNav />
    </main>
  );
};

export default EmployeeNotificationsPage;