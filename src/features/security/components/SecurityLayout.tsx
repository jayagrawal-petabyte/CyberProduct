<<<<<<< HEAD
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
=======
// import React from 'react';
// import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// import {
//   HomeIcon, DocIcon, DeviceIcon, CloudIcon, ModulesIcon, AuditIcon, BellIcon, UsersIcon, ChatIcon, UserIcon
// } from './Icons';

// export const SecurityLayout: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const navItems = [
//     { path: '/security/dashboard', icon: HomeIcon },
//     { path: '/security/profile', icon: DocIcon },
//     { path: '/security/employee-activity', icon: DeviceIcon },
//     { path: '/security/cloud', icon: CloudIcon },
//     { path: '/security/modules', icon: ModulesIcon },
//     { path: '/security/audit', icon: AuditIcon },
//     { path: '/security/notifications', icon: BellIcon },
//     { path: '/security/users', icon: UsersIcon },
//     { path: '/security/chat', icon: ChatIcon },
//     { path: '/security/settings', icon: UserIcon },
//   ];

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'radial-gradient(circle at 80% 20%, #7e528b 0%, #30164c 45%, #180b30 100%)',
//       fontFamily: 'Inter, system-ui, sans-serif',
//       padding: '2.5rem 2rem 7rem 2.0rem',
//       boxSizing: 'border-box',
//       position: 'relative'
//     }}>
//       {/* Large Cream Card Panel overlaying the gradient background */}
//       <div style={{
//         maxWidth: '1400px',
//         margin: '0 auto',
//         background: '#fcf6f2',
//         borderRadius: '24px',
//         boxShadow: '0 30px 60px rgba(0, 0, 0, 0.35)',
//         minHeight: '88vh',
//         padding: '2.5rem 3rem 5rem 3rem',
//         position: 'relative',
//         boxSizing: 'border-box'
//       }}>
//         {/* BrainMint Logo Header */}
//         <div style={{ marginBottom: '1.75rem' }}>
//           <img 
//             src="/logo.png" 
//             alt="BrainMint" 
//             style={{ height: '38px', objectFit: 'contain', cursor: 'pointer' }}
//             onClick={() => navigate('/security/dashboard')}
//             onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
//           />
//         </div>

//         {/* Child Page Output */}
//         <Outlet />
//       </div>

//       {/* Floating Bottom Nav Dock */}
//       <div style={{
//         position: 'fixed',
//         bottom: '1.75rem',
//         left: '50%',
//         transform: 'translateX(-50%)',
//         background: '#16122d',
//         borderRadius: '9999px',
//         padding: '0.45rem 0.85rem',
//         display: 'flex',
//         gap: '0.625rem',
//         alignItems: 'center',
//         boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
//         border: '1px solid rgba(255, 255, 255, 0.1)',
//         zIndex: 1000
//       }}>
//         {navItems.map((item, idx) => {
//           const isActive = location.pathname === item.path;
//           const IconComp = item.icon;
//           return (
//             <button
//               key={idx}
//               onClick={() => navigate(item.path)}
//               style={{
//                 background: isActive ? '#f3dfd5' : 'transparent',
//                 border: 'none',
//                 borderRadius: '50%',
//                 width: '40px',
//                 height: '40px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 transition: 'background 0.2s',
//                 color: isActive ? '#16122d' : '#94a3b8'
//               }}
//             >
//               <IconComp style={{ width: '18px', height: '18px', stroke: isActive ? '#16122d' : '#94a3b8', strokeWidth: 2 }} />
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default SecurityLayout;



import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  DocIcon,
  DeviceIcon,
  CloudIcon,
  ModulesIcon,
  AuditIcon,
  BellIcon,
  UsersIcon,
  ChatIcon,
  UserIcon,
} from "./Icons";
import "../security.css";

const navItems = [
  { path: "/security/dashboard", label: "Dashboard", icon: HomeIcon },
  { path: "/security/profile", label: "Profile", icon: DocIcon },
  { path: "/security/employee-activity", label: "Device activity", icon: DeviceIcon },
  { path: "/security/cloud", label: "Cloud", icon: CloudIcon },
  { path: "/security/modules", label: "Modules", icon: ModulesIcon },
  { path: "/security/audit", label: "Audit logs", icon: AuditIcon },
  { path: "/security/alerts", label: "Security alerts", icon: BellIcon },
  { path: "/security/users", label: "Users", icon: UsersIcon },
  { path: "/security/chat", label: "Chat", icon: ChatIcon },
  { path: "/security/settings", label: "Settings", icon: UserIcon },
];

export const SecurityLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="security-shell">
      <div className="security-background-orb security-orb-one" />
      <div className="security-background-orb security-orb-two" />

      <div className="security-app">
        <header className="security-brand-header">
          <button
            className="security-brand-button"
            onClick={() => navigate("/security/dashboard")}
            aria-label="Go to BrainMint security dashboard"
          >
            <img
              src="/assets/brainmint-logo.png"
              alt="BrainMint"
              className="security-logo"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          </button>
        </header>

        <main className="security-main">
          <Outlet />
        </main>
      </div>

      <nav className="security-dock" aria-label="Security navigation">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active =
            location.pathname === path ||
            (path === "/security/alerts" &&
              location.pathname.startsWith("/security/alerts"));

          return (
            <button
              key={path}
              className={`security-dock-item${active ? " active" : ""}`}
              onClick={() => navigate(path)}
              aria-label={label}
              title={label}
              aria-current={active ? "page" : undefined}
            >
              <Icon />
            </button>
          );
        })}
      </nav>
>>>>>>> c6de39b (fix(security): finalize layout and routing integration)
    </div>
  );
};

<<<<<<< HEAD
export default SecurityLayout;
=======
export default SecurityLayout;
>>>>>>> c6de39b (fix(security): finalize layout and routing integration)
