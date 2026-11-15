/**
 * BrainMint Checkbox Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React from 'react';
import { Icon } from './Icon';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, disabled = false, checked, defaultChecked, onChange, id, className = '', style, ...rest }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={inputId}
        className={`brainmint-checkbox-container ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: description ? 'flex-start' : 'center',
          gap: '0.625rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          fontFamily: 'var(--font-sans)',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
      >
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            className="brainmint-checkbox-input"
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              border: '1.5px solid var(--color-border-default, #e6d5dc)',
              backgroundColor: 'var(--color-bg-card, #ffffff)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              display: 'inline-block',
              position: 'relative',
              margin: 0,
            }}
            {...rest}
          />
          {checked && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                color: '#ffffff',
                backgroundColor: 'var(--color-brand-primary, #281a3c)',
                borderRadius: '5px',
              }}
            >
              <Icon name="check" size={12} strokeWidth={3} />
            </span>
          )}
        </span>

        {(label || description) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {label && (
              <span
                style={{
                  fontSize: 'var(--font-size-sm, 0.8125rem)',
                  color: 'var(--color-text-body, #2a1b38)',
                  fontWeight: 'var(--font-weight-medium, 500)',
                }}
              >
                {label}
              </span>
            )}
            {description && (
              <span
                style={{
                  fontSize: 'var(--font-size-xs, 0.75rem)',
                  color: 'var(--color-text-secondary, #6f5d6b)',
                }}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
