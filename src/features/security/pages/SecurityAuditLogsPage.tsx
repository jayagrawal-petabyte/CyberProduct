import React from 'react';
import { AuditLogTable } from '../components/AuditLogTable';

export const SecurityAuditLogsPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
          System Audit Logs
        </h1>
        <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary, #475569)', fontSize: '0.925rem' }}>
          Complete historical record of access requests, approvals, blocks, and zero-trust violations.
        </p>
      </div>

      <AuditLogTable />
    </div>
  );
};

export default SecurityAuditLogsPage;