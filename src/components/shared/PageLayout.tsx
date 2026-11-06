/**
 * BrainMint PageLayout Primitive
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Implements the approved BrainMint page canvas:
 * - Organic abstract ambient curves in background
 * - Top header with official BrainMint logo
 * - Responsive container
 * - Fixed bottom floating navigation dock
 */

import React from 'react';
import { Container } from './Container';
import { BrandLogo } from './BrandLogo';
import { FloatingDock, type DockItem } from './FloatingDock';

export interface PageLayoutProps {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  activeDockId?: string;
  onDockSelect?: (id: string) => void;
  dockItems?: DockItem[];
  showDock?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  style?: React.CSSProperties;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  headerAction,
  activeDockId,
  onDockSelect,
  dockItems,
  showDock = true,
  maxWidth = 'xl',
  className = '',
  style,
}) => {
  return (
    <div
      className={`brainmint-page-layout ${className}`}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        paddingBottom: showDock ? '6rem' : '2rem',
        ...style,
      }}
    >
      {/* Decorative ambient background waves matching Figma visual references */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '520px',
          height: '420px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.85,
        }}
      >
        <svg
          viewBox="0 0 520 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d="M520 0H220C280 90 380 120 420 220C460 320 380 390 520 420V0Z"
            fill="var(--color-brand-wave-dark, #2b193d)"
          />
          <path
            d="M520 0H310C360 80 430 110 470 190C500 250 490 320 520 360V0Z"
            fill="var(--color-brand-wave-mid, #4a235c)"
            opacity="0.6"
          />
        </svg>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '480px',
          height: '400px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.85,
        }}
      >
        <svg
          viewBox="0 0 480 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d="M480 400V160C410 180 340 260 280 290C200 330 120 320 0 400H480Z"
            fill="var(--color-brand-wave-dark, #2b193d)"
          />
          <path
            d="M480 400V240C430 260 370 300 330 330C280 370 200 380 110 400H480Z"
            fill="var(--color-brand-wave-mid, #4a235c)"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Top Header */}
      <header
        style={{
          position: 'relative',
          zIndex: 'var(--z-header, 150)',
          paddingTop: '1.25rem',
          paddingBottom: '1rem',
        }}
      >
        <Container maxWidth={maxWidth}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <BrandLogo size="md" />
            {headerAction && <div>{headerAction}</div>}
          </div>
        </Container>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          paddingTop: '1rem',
        }}
      >
        <Container maxWidth={maxWidth}>{children}</Container>
      </main>

      {/* Floating Bottom Dock */}
      {showDock && (
        <FloatingDock
          items={dockItems}
          activeId={activeDockId}
          onSelect={onDockSelect}
        />
      )}
    </div>
  );
};
