/**
 * BrainMint Modal & Dialog Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React, { useEffect } from 'react';
import { Icon } from './Icon';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: '400px',
    md: '520px',
    lg: '680px',
    xl: '840px',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 'var(--z-modal, 510)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-bg-modal-backdrop, rgba(28, 16, 40, 0.45))',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          animation: 'fadeIn 200ms ease',
        }}
      />

      {/* Modal Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: maxWidths[maxWidth],
          backgroundColor: 'var(--color-bg-card, #ffffff)',
          border: '1px solid var(--color-border-subtle, #f0dfe6)',
          borderRadius: 'var(--radius-2xl, 24px)',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
          zIndex: 1,
          animation: 'scaleUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              padding: '1.5rem 1.5rem 1rem 1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1rem',
              borderBottom: '1px solid var(--color-border-subtle, #f0dfe6)',
            }}
          >
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: 'var(--font-size-lg, 1.125rem)',
                    fontWeight: 'var(--font-weight-bold, 700)',
                    color: 'var(--color-text-primary, #1e1229)',
                  }}
                >
                  {title}
                </h3>
              )}
              {description && (
                <p
                  style={{
                    fontSize: 'var(--font-size-xs, 0.75rem)',
                    color: 'var(--color-text-secondary, #6f5d6b)',
                    marginTop: '0.25rem',
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary, #6f5d6b)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-pink, #f4dee5)';
                  e.currentTarget.style.color = 'var(--color-brand-primary, #281a3c)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary, #6f5d6b)';
                }}
              >
                <Icon name="x" size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--color-bg-card-subtle, #fff8fa)',
              borderTop: '1px solid var(--color-border-subtle, #f0dfe6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
