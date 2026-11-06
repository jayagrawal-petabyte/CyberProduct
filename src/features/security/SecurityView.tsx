import React from 'react';
import { AlertsTable } from './components/AlertsTable';
import { AuditLogTable } from './components/AuditLogTable';

export const SecurityView: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Security & Audit Operations</h1>
        <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>Enterprise security monitoring, threat alerts, and compliance audit trail.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <AlertsTable />
        <AuditLogTable />
      </div>
    </div>
  );
};