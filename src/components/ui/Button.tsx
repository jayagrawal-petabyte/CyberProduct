/**
 * BrainMint Button Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React, { useState } from 'react';
import type { ButtonVariant, ComponentSize } from '../../types/ui';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ComponentSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      children,
      className = '',
      style,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const isDisabled = disabled || loading;

    // Size mappings
    const sizeStyles: Record<ComponentSize, React.CSSProperties> = {
      sm: {
        height: '34px',
        padding: '0 0.75rem',
        fontSize: 'var(--font-size-xs, 0.75rem)',
        borderRadius: 'var(--radius-sm, 8px)',
        gap: '0.375rem',
      },
      md: {
        height: '44px',
        padding: '0 1.25rem',
        fontSize: 'var(--font-size-base, 0.875rem)',
        borderRadius: 'var(--radius-md, 12px)',
        gap: '0.5rem',
      },
      lg: {
        height: '50px',
        padding: '0 1.5rem',
        fontSize: 'var(--font-size-md, 1rem)',
        borderRadius: 'var(--radius-lg, 16px)',
        gap: '0.625rem',
      },
    };

    // Variant base & hover styles
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'secondary':
          return {
            backgroundColor: isHovered
              ? 'var(--color-accent-pink-hover, #ebced7)'
              : 'var(--color-accent-pink, #f4dee5)',
            color: 'var(--color-brand-primary, #281a3c)',
            border: 'none',
          };
        case 'outline':
          return {
            backgroundColor: isHovered
              ? 'var(--color-bg-card-subtle, #fff8fa)'
              : 'transparent',
            color: 'var(--color-brand-primary, #281a3c)',
            border: `1px solid ${
              isHovered
                ? 'var(--color-border-hover, #d5bfc9)'
                : 'var(--color-border-default, #e6d5dc)'
            }`,
          };
        case 'ghost':
          return {
            backgroundColor: isHovered
              ? 'var(--color-accent-pink, #f4dee5)'
              : 'transparent',
            color: 'var(--color-brand-primary, #281a3c)',
            border: 'none',
          };
        case 'danger':
          return {
            backgroundColor: isHovered ? '#dc2626' : 'var(--color-danger, #ef4444)',
            color: '#ffffff',
            border: 'none',
          };
        case 'primary':
        default:
          return {
            backgroundColor: isHovered
              ? 'var(--color-brand-primary-hover, #382552)'
              : 'var(--color-brand-primary, #281a3c)',
            color: 'var(--color-brand-primary-text, #ffffff)',
            border: 'none',
          };
      }
    };

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'var(--font-weight-semibold, 600)',
      fontFamily: 'var(--font-sans)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
      transition: 'all var(--transition-base, 200ms ease)',
      boxShadow:
        variant === 'primary' && !isDisabled && isHovered
          ? '0 4px 12px rgba(40, 26, 60, 0.2)'
          : 'none',
      userSelect: 'none',
      outline: 'none',
      ...sizeStyles[size],
      ...getVariantStyles(),
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`brainmint-btn brainmint-btn-${variant} ${className}`}
        style={baseStyles}
        onMouseEnter={(e) => {
          if (!isDisabled) setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
        {...rest}
      >
        {loading ? (
          <span
            style={{
              display: 'inline-block',
              width: '1em',
              height: '1em',
              border: '2px solid currentColor',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.75s linear infinite',
            }}
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
