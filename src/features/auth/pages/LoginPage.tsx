/**
 * BrainMint LoginPage Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Implements the Login UI faithfully matching the Figma source-of-truth:
 * - Fluid organic background canvas with top-right and bottom-right waves
 * - Centered "Welcome Back" header
 * - Rounded card container with subtle mauve border and shadow
 * - Interactive LoginForm with full validation, loading and responsive behavior
 */

import React from 'react';
import { LoginBackground } from '../components/LoginBackground';
import { LoginForm } from '../components/LoginForm';
import { Card } from '../../../components/ui';

export const LoginPage: React.FC = () => {
  return (
    <main
      className="brainmint-login-page"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      {/* ── Background canvas with Figma-matching waves ─────────────────── */}
      <LoginBackground />

      {/* ── Centered Card Container ─────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '470px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeIn 250ms ease-out',
        }}
      >
        {/* "Welcome Back" heading */}
        <h1
          style={{
            fontSize: 'var(--font-size-3xl, 1.875rem)',
            fontWeight: 'var(--font-weight-bold, 700)',
            color: 'var(--color-brand-primary, #281a3c)',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Welcome Back
        </h1>

        {/* Login Card */}
        <Card
          variant="subtle"
          padding="none"
          style={{
            width: '100%',
            backgroundColor: '#fff5f5',
            border: '1px solid rgba(196, 154, 185, 0.45)',
            borderRadius: '22px',
            boxShadow:
              '0 18px 45px -10px rgba(40, 26, 60, 0.12), 0 6px 16px -4px rgba(40, 26, 60, 0.05)',
            padding: '36px 36px 32px 36px',
            boxSizing: 'border-box',
          }}
        >
          <LoginForm />
        </Card>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .brainmint-login-page {
            padding: 2rem 1rem !important;
          }
          .brainmint-login-page .brainmint-card {
            padding: 28px 20px 24px 20px !important;
            border-radius: 18px !important;
          }
          .brainmint-login-page h1 {
            font-size: 1.625rem !important;
            margin-bottom: 1.5rem !important;
          }
        }
      `}</style>
    </main>
  );
};

export default LoginPage;
