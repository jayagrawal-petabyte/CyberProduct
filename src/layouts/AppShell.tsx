/**
 * BrainMint AppShell Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Provides the shared application shell for modules utilizing the common layout:
 * - Ambient BrainMint background canvas
 * - Responsive container
 * - Role-tailored floating bottom dock navigation
 * - Top header with brand logo, user profile status and sign-out action
 */

import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/shared/PageLayout';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../features/auth/hooks/useAuth';
import { getNavItemsForRole } from './navigation';

export interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const dockItems = getNavItemsForRole(user?.role);

  // Match active dock item by current path
  const activeDockItem = dockItems.find((item) =>
    item.href ? location.pathname === item.href || location.pathname.startsWith(`${item.href}/`) : false
  );

  const activeDockId = activeDockItem?.id || (user?.role === 'lead' ? 'approvals' : 'dashboard');

  return (
    <PageLayout
      activeDockId={activeDockId}
      dockItems={dockItems}
      onDockSelect={(id) => {
        const item = dockItems.find((d) => d.id === id);
        if (item?.href) {
          navigate(item.href);
        }
      }}
      headerAction={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              <Avatar name={user.name} online size="md" />
              <button
                type="button"
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary, #6f5d6b)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Avatar name="Guest User" size="md" />
          )}
        </div>
      }
    >
      {children || <Outlet />}
    </PageLayout>
  );
};

export default AppShell;
