import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import './EmployeeBottomNav.css';

const navItems = [
  { label: 'Dashboard', path: '/employee', icon: 'grid' as const, end: true },
  { label: 'Devices', path: '/employee/my-devices', icon: 'monitor' as const },
  { label: 'Request Access', path: '/employee/access-requests/new', icon: 'plus' as const },
  { label: 'My Requests', path: '/employee/access-requests', icon: 'file-text' as const },
  { label: 'Notifications', path: '/employee/notifications', icon: 'bell' as const },
  { label: 'Profile', path: '/employee/profile', icon: 'user' as const },
];

const EmployeeBottomNav: React.FC = () => (
  <nav className="employee-bottom-nav" aria-label="Employee navigation">
    {navItems.map(({ label, path, icon, end }) => (
      <NavLink
        key={path}
        to={path}
        end={end}
        className={({ isActive }) =>
          `employee-bottom-nav__item${isActive ? ' employee-bottom-nav__item--active' : ''}`
        }
        aria-label={label}
        title={label}
      >
        <Icon name={icon} size={21} />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

export default EmployeeBottomNav;