import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import type { IconName } from '../../../types/ui';
import './EmployeeBottomNav.css';

interface EmployeeNavItem {
  id: string;
  label: string;
  path?: string;
  icon: IconName;
  end?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}

const employeeNavItems: EmployeeNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/employee', icon: 'house', end: true },
  { id: 'devices', label: 'My Devices', path: '/employee/my-devices', icon: 'devices' },
  { id: 'request-access', label: 'Request Access', path: '/employee/access-requests', icon: 'diamond-plus' },
  { id: 'policies', label: 'Policies', path: '/employee/my-policies', icon: 'file-check' },
  { id: 'notifications', label: 'Notifications', path: '/employee/notifications', icon: 'bell' },
  { id: 'profile', label: 'Profile', path: '/employee/profile', icon: 'user-circle' },
];

export const EmployeeBottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="employee-bottom-nav" aria-label="Employee navigation">
      {employeeNavItems.map((item) => {
        const isActive = Boolean(
          item.path &&
            (item.end
              ? currentPath === item.path
              : currentPath === item.path || currentPath.startsWith(`${item.path}/`))
        );

        if (!item.path || item.disabled) {
          return (
            <button
              key={item.id}
              type="button"
              className="employee-bottom-nav__item employee-bottom-nav__item--disabled"
              aria-label={item.comingSoon ? `${item.label} (Coming soon)` : item.label}
              title={item.comingSoon ? `${item.label} (Coming soon)` : item.label}
              disabled
            >
              <Icon name={item.icon} size={20} strokeWidth={1.85} />
            </button>
          );
        }

        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.end}
            className={`employee-bottom-nav__item ${
              isActive ? 'employee-bottom-nav__item--active' : ''
            }`.trim()}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            title={item.label}
            onClick={(e) => {
              if (isActive && currentPath === item.path) {
                e.preventDefault();
              }
            }}
          >
            <Icon
              name={item.icon}
              size={20}
              strokeWidth={isActive ? 2.2 : 1.85}
            />
          </NavLink>
        );
      })}
    </nav>
  );
};

export default EmployeeBottomNav;
