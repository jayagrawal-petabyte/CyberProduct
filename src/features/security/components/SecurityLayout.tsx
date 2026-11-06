import React from 'react';
import { Outlet } from 'react-router-dom';
import { SecurityBottomNav } from './SecurityBottomNav';
import './SecurityLayout.css';

export interface SecurityLayoutProps {
  children?: React.ReactNode;
}

export const SecurityLayout: React.FC<SecurityLayoutProps> = ({ children }) => {
  return (
    <div className="security-module-layout">
      {children || <Outlet />}
      <SecurityBottomNav />
    </div>
  );
};

export default SecurityLayout;
