import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { SECURITY_NAV_ITEMS } from '../../../layouts/navigation';
import './SecurityBottomNav.css';

export interface SecurityBottomNavProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SecurityBottomNav: React.FC<SecurityBottomNavProps> = ({
  className = '',
  style,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav
      className={`security-bottom-nav ${className}`.trim()}
      aria-label="Security Module Navigation"
      style={style}
    >
      {SECURITY_NAV_ITEMS.map((item) => {
        // Precise active determination supporting direct routes and aliases
        const isActive =
          (item.matchPaths && item.matchPaths.includes(currentPath)) ||
          currentPath === item.href ||
          (item.href !== '/security' && currentPath.startsWith(`${item.href}/`));

        return (
          <NavLink
            key={item.id}
            to={item.href || '#'}
            end={item.href === '/security'}
            className={`security-bottom-nav__item ${
              isActive ? 'security-bottom-nav__item--active' : ''
            }`.trim()}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            title={item.label}
            onClick={(e) => {
              // Ensure clicking the already-active item is completely safe
              if (isActive && currentPath === item.href) {
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

export default SecurityBottomNav;
