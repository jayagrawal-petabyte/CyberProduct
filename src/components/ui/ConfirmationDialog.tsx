/**
 * BrainMint ConfirmationDialog Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {variant === 'danger' && (
            <span
              style={{
                display: 'inline-flex',
                color: 'var(--color-danger, #ef4444)',
              }}
            >
              <Icon name="alert-triangle" size={20} />
            </span>
          )}
          <span>{title}</span>
        </div>
      }
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p
        style={{
          fontSize: 'var(--font-size-base, 0.875rem)',
          color: 'var(--color-text-secondary, #6f5d6b)',
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
    </Modal>
  );
};
