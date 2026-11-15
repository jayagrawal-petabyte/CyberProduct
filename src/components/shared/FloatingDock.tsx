/**
 * BrainMint Floating Dock Navigation Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Renders the signature bottom pill navigation bar visible across BrainMint screens:
 * - Deep dark purple pill background (#281A3C)
 * - Soft rose-mauve active item pill (#D5B4BF)
 * - Elevated shadow
 * - Fixed centered bottom position
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import type { IconName } from '../../types/ui';

export interface DockItem {
  id: string;
  label: string;
  icon: IconName;
  href?: string;
  badge?: number;
}

export interface FloatingDockProps {
  items?: DockItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'devices', label: 'Devices', icon: 'monitor' },
    { id: 'requests', label: 'Access Requests', icon: 'diamond-plus' },
    { id: 'approvals', label: 'Approvals & Logs', icon: 'file-text' },
    { id: 'alerts', label: 'Notifications', icon: 'bell' },
    { id: 'profile', label: 'My Profile', icon: 'user' },
  ],
  activeId = 'dashboard',
  onSelect,
  className = '',
  style,
}) => {
  const navigate = useNavigate();

  const handleItemClick = (item: DockItem) => {
    onSelect?.(item.id);
    if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <nav
      aria-label="Application Dock Navigation"
      className={`brainmint-floating-dock ${className}`}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-dock, 100)',
        backgroundColor: 'var(--color-bg-dock, #281a3c)',
        borderRadius: 'var(--radius-pill, 9999px)',
        padding: '0.4rem 0.6rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: 'var(--shadow-dock)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        userSelect: 'none',
        ...style,
      }}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            title={item.label}
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-pill, 9999px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isActive
                ? 'var(--color-accent-dock-active, #d5b4bf)'
                : 'transparent',
              color: isActive
                ? 'var(--color-brand-primary, #281a3c)'
                : '#e5d8df',
              transition: 'all var(--transition-fast)',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#e5d8df';
              }
            }}
          >
            <Icon name={item.icon} size={20} strokeWidth={isActive ? 2.2 : 1.8} />

            {item.badge !== undefined && item.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  minWidth: '14px',
                  height: '14px',
                  padding: '0 3px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-danger, #ef4444)',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid var(--color-bg-dock, #281a3c)',
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
