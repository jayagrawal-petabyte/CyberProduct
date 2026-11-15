/**
 * BrainMint Toggle (Switch) Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React from 'react';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      description,
      checked,
      defaultChecked,
      disabled = false,
      onChange,
      id,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={inputId}
        className={`brainmint-toggle-container ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: description ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          fontFamily: 'var(--font-sans)',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
      >
        {(label || description) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {label && (
              <span
                style={{
                  fontSize: 'var(--font-size-base, 0.875rem)',
                  fontWeight: 'var(--font-weight-semibold, 600)',
                  color: 'var(--color-text-primary, #1e1229)',
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
                  marginTop: '0.125rem',
                }}
              >
                {description}
              </span>
            )}
          </div>
        )}

        <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={inputId}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={onChange}
            aria-checked={checked}
            style={{
              opacity: 0,
              width: 0,
              height: 0,
              position: 'absolute',
            }}
            {...rest}
          />
          <div
            style={{
              width: '46px',
              height: '26px',
              backgroundColor: checked
                ? 'var(--color-brand-primary, #281a3c)'
                : 'var(--color-border-default, #e6d5dc)',
              borderRadius: 'var(--radius-pill, 9999px)',
              transition: 'background-color var(--transition-base, 200ms ease)',
              position: 'relative',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: checked ? '23px' : '3px',
                width: '20px',
                height: '20px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                transition: 'left var(--transition-base, 200ms ease)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
              }}
            />
          </div>
        </div>
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
