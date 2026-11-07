import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { LEAD_NAV_ITEMS, type LeadNavItem } from '../../../layouts/navigation';
import './LeadBottomNav.css';

export interface LeadBottomNavProps {
  activeId?: 'dashboard' | 'approvals' | 'history' | 'activity' | 'notifications' | 'profile' | string;
  className?: string;
  style?: React.CSSProperties;
}

export const LeadBottomNav: React.FC<LeadBottomNavProps> = ({
  activeId,
  className = '',
  style,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isItemActive = (item: LeadNavItem): boolean => {
    if (activeId) {
      return activeId === item.id;
    }

    if (item.id === 'dashboard') {
      return currentPath === '/lead' || currentPath === '/lead/dashboard';
    }

    if (item.id === 'approvals') {
      return (
        currentPath === '/lead/approvals' ||
        currentPath === '/approvals' ||
        currentPath.startsWith('/lead/approvals/') ||
        currentPath.startsWith('/approvals/')
      );
    }

    if (item.matchPaths && item.matchPaths.some((p) => currentPath === p || currentPath.startsWith(`${p}/`))) {
      return true;
    }

    return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
  };

  return (
    <nav
      className={`lead-bottom-nav ${className}`.trim()}
      aria-label="Lead module navigation"
      style={style}
    >
      {LEAD_NAV_ITEMS.map((item) => {
        const isActive = isItemActive(item);

        return (
          <NavLink
            key={item.id}
            to={item.href}
            className={`lead-bottom-nav__item ${
              isActive ? 'lead-bottom-nav__item--active' : ''
            }`.trim()}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            title={item.label}
            onClick={(e) => {
              if (
                isActive &&
                (currentPath === item.href ||
                  (item.id === 'dashboard' && currentPath === '/lead/dashboard'))
              ) {
                e.preventDefault();
              }
            }}
          >
            <Icon
              name={item.icon}
              size={21}
              strokeWidth={isActive ? 2.1 : 1.85}
            />
          </NavLink>
        );
      })}
    </nav>
  );
};

export default LeadBottomNav;
