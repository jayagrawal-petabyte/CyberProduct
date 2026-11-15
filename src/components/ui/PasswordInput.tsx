/**
 * BrainMint PasswordInput Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Extends Input with a smooth show/hide password visibility toggle.
 */

import React, { useState } from 'react';
import { Input, type InputProps } from './Input';
import { Icon } from './Icon';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleButton = showToggle ? (
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted, #9e8c96)',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-brand-primary, #281a3c)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted, #9e8c96)';
        }}
      >
        <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
      </button>
    ) : undefined;

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={toggleButton}
        {...rest}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
