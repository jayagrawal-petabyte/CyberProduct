/**
 * BrainMint ForgotPasswordPage Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginBackground } from '../components/LoginBackground';
import { Card, Input, Button, Icon } from '../../../components/ui';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your work email');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSubmitted(true);
  };

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
      <LoginBackground />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '470px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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
          Reset Password
        </h1>

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
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success-bg, #ebf9f1)',
                  color: 'var(--color-success, #10b981)',
                  marginBottom: '1rem',
                }}
              >
                <Icon name="check" size={24} strokeWidth={2.5} />
              </div>
              <h2
                style={{
                  fontSize: 'var(--font-size-xl, 1.25rem)',
                  fontWeight: 'var(--font-weight-bold, 700)',
                  color: 'var(--color-brand-primary, #281a3c)',
                  marginBottom: '0.5rem',
                }}
              >
                Check your inbox
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-size-sm, 0.8125rem)',
                  color: 'var(--color-text-secondary, #6f5d6b)',
                  marginBottom: '2rem',
                }}
              >
                We have sent password reset instructions to <strong>{email}</strong>.
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '44px',
                  padding: '0 1.5rem',
                  backgroundColor: 'var(--color-brand-primary, #281a3c)',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p
                style={{
                  fontSize: 'var(--font-size-sm, 0.8125rem)',
                  color: 'var(--color-text-secondary, #6f5d6b)',
                  marginBottom: '1.5rem',
                  lineHeight: '1.5',
                }}
              >
                Enter your work email address and we'll send you instructions to reset your password.
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <Input
                  label="Work email"
                  id="reset-email"
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(undefined);
                  }}
                  error={error}
                  size="lg"
                  style={{ marginBottom: 0 }}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                style={{
                  height: '48px',
                  backgroundColor: 'var(--color-brand-primary, #281a3c)',
                  borderRadius: '10px',
                  fontSize: 'var(--font-size-base, 0.875rem)',
                  fontWeight: 'var(--font-weight-semibold, 600)',
                }}
              >
                Send Reset Link
              </Button>

              <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: 'var(--font-size-sm, 0.8125rem)',
                    fontWeight: 'var(--font-weight-semibold, 600)',
                    color: 'var(--color-brand-primary, #281a3c)',
                    textDecoration: 'none',
                  }}
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
