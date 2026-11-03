/**
 * BrainMint LoginForm Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Faithfully matches the approved Figma design:
 * - Username or email field with "Enter your work email" placeholder
 * - Password field with "Enter your password" placeholder, show/hide toggle & "Forgot Password?" link
 * - "Remember me" checkbox
 * - Deep dark purple "Sign In" button with right arrow icon and loading state
 * - CyberProduct security assurance footer
 * - Isolated backend authentication integration placeholder
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, PasswordInput, Checkbox, Button, Icon } from '../../../components/ui';
import type { LoginCredentials, LoginFormErrors, AuthStatus } from '../types/auth.types';

export interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, className = '', style }) => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    emailOrUsername: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [status, setStatus] = useState<AuthStatus>('idle');

  const handleFieldChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    // Clear validation error on the edited field
    if (errors[field as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!credentials.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Please enter your username or email';
    }

    if (!credentials.password) {
      newErrors.password = 'Please enter your password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('loading');

    try {
      /**
       * ──────────────────────────────────────────────────────────────────────────
       * BACKEND INTEGRATION PLACEHOLDER
       * ──────────────────────────────────────────────────────────────────────────
       * Replace this simulation with the real authentication service call once
       * the backend auth endpoint is ready (e.g. authApi.login(credentials)).
       */
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStatus('success');

      if (onSuccess) {
        onSuccess();
      } else {
        // Default navigation to dashboard upon successful login
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setStatus('error');
      const message = err instanceof Error ? err.message : 'Invalid username or password. Please try again.';
      setErrors((prev) => ({ ...prev, general: message }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`brainmint-login-form ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
    >
      {/* General error message banner if backend / auth fails */}
      {errors.general && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            marginBottom: '1.25rem',
            backgroundColor: 'var(--color-danger-bg, #fdf2f2)',
            border: '1px solid var(--color-danger-border, #f8d7da)',
            borderRadius: 'var(--radius-sm, 8px)',
            color: 'var(--color-danger-text, #b91c1c)',
            fontSize: 'var(--font-size-sm, 0.8125rem)',
          }}
        >
          <Icon name="alert-triangle" size={16} color="var(--color-danger, #ef4444)" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* ── 1. Username or Email ────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.125rem' }}>
        <Input
          label="Username or email"
          id="username-or-email"
          type="text"
          autoComplete="username"
          placeholder="Enter your work email"
          value={credentials.emailOrUsername}
          onChange={(e) => handleFieldChange('emailOrUsername', e.target.value)}
          error={errors.emailOrUsername}
          size="lg"
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* ── 2. Password & Forgot Password Link ───────────────────────────── */}
      <div style={{ marginBottom: '1.125rem' }}>
        <PasswordInput
          label="Password"
          id="login-password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={credentials.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          error={errors.password}
          size="lg"
          showToggle
          labelAction={
            <Link
              to="/forgot-password"
              style={{
                fontSize: 'var(--font-size-sm, 0.8125rem)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-brand-primary, #281a3c)',
                textDecoration: 'none',
                transition: 'opacity var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.75';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Forgot Password?
            </Link>
          }
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* ── 3. Remember Me Checkbox ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '0.125rem',
          marginBottom: '1.375rem',
        }}
      >
        <Checkbox
          id="remember-me"
          checked={credentials.rememberMe}
          onChange={(e) => handleFieldChange('rememberMe', e.target.checked)}
          label={
            <span
              style={{
                fontSize: 'var(--font-size-sm, 0.8125rem)',
                fontWeight: 'var(--font-weight-medium, 500)',
                color: 'var(--color-text-secondary, #6f5d6b)',
              }}
            >
              Remember me
            </span>
          }
        />
      </div>

      {/* ── 4. Sign In Button ───────────────────────────────────────────── */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={status === 'loading'}
        rightIcon={
          <Icon
            name="arrow-right"
            size={18}
            strokeWidth={2.2}
            color="#ffffff"
          />
        }
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '48px',
          paddingLeft: '1.25rem',
          paddingRight: '1.25rem',
          backgroundColor: 'var(--color-brand-primary, #281a3c)',
          borderRadius: '10px',
          fontSize: 'var(--font-size-base, 0.875rem)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          letterSpacing: '-0.01em',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        Sign In
      </Button>

      {/* ── 5. Security Assurance Footer ────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '3.75rem',
          color: 'var(--color-text-secondary, #6f5d6b)',
        }}
      >
        <Icon
          name="lock"
          size={14}
          strokeWidth={2}
          color="var(--color-text-secondary, #6f5d6b)"
        />
        <span
          style={{
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-text-secondary, #6f5d6b)',
            letterSpacing: '0.01em',
            userSelect: 'none',
          }}
        >
          Protected by CyberProduct security.
        </span>
      </div>
    </form>
  );
};
