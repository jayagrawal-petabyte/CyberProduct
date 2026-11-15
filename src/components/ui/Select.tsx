/**
 * BrainMint Select Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React, { useState } from 'react';
import type { ComponentSize, SelectOption } from '../../types/ui';
import { Icon } from './Icon';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  size?: ComponentSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hint,
      error,
      options,
      size = 'md',
      fullWidth = true,
      disabled = false,
      required = false,
      leftIcon,
      className = '',
      style,
      id,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const heights: Record<ComponentSize, string> = {
      sm: '36px',
      md: '44px',
      lg: '50px',
    };

    return (
      <div
        className={`brainmint-select-field ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: fullWidth ? '100%' : 'auto',
          marginBottom: '1rem',
          fontFamily: 'var(--font-sans)',
          ...style,
        }}
      >
        {label && (
          <label
            htmlFor={selectId}
            style={{
              fontSize: 'var(--font-size-sm, 0.8125rem)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-text-primary, #1e1229)',
              marginBottom: '0.375rem',
            }}
          >
            {label}
            {required && (
              <span style={{ color: 'var(--color-danger, #ef4444)', marginLeft: '4px' }}>
                *
              </span>
            )}
          </label>
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                color: error
                  ? 'var(--color-danger, #ef4444)'
                  : 'var(--color-text-muted, #9e8c96)',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            className="brainmint-select"
            style={{
              width: '100%',
              height: heights[size],
              paddingLeft: leftIcon ? '2.5rem' : '1rem',
              paddingRight: '2.5rem',
              fontSize: 'var(--font-size-base, 0.875rem)',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-text-body, #2a1b38)',
              backgroundColor: disabled
                ? 'var(--color-bg-input-disabled, #f7eff3)'
                : 'var(--color-bg-input, #ffffff)',
              border: `1px solid ${
                error
                  ? 'var(--color-danger, #ef4444)'
                  : isFocused
                  ? 'var(--color-border-focus, #281a3c)'
                  : 'var(--color-border-default, #e6d5dc)'
              }`,
              borderRadius: 'var(--radius-md, 12px)',
              boxShadow: isFocused
                ? error
                  ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
                  : 'var(--shadow-focus, 0 0 0 3px rgba(40, 26, 60, 0.14))'
                : 'none',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            }}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          <span
            style={{
              position: 'absolute',
              right: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--color-text-muted, #9e8c96)',
            }}
          >
            <Icon name="chevron-down" size={16} />
          </span>
        </div>

        {error ? (
          <span
            style={{
              fontSize: 'var(--font-size-xs, 0.75rem)',
              color: 'var(--color-danger, #ef4444)',
              marginTop: '0.25rem',
              fontWeight: 'var(--font-weight-medium, 500)',
            }}
          >
            {error}
          </span>
        ) : hint ? (
          <span
            style={{
              fontSize: 'var(--font-size-xs, 0.75rem)',
              color: 'var(--color-text-secondary, #6f5d6b)',
              marginTop: '0.25rem',
            }}
          >
            {hint}
          </span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
