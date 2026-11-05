import React from 'react';
import { AlertsTable } from '../components/AlertsTable';

export const SecurityAlertsPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
          Active Security Alerts
        </h1>
        <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary, #475569)', fontSize: '0.925rem' }}>
          Comprehensive threat triage, policy infraction monitoring, and evidence inspection center.
        </p>
      </div>

      <AlertsTable />
    </div>
  );
};

export default SecurityAlertsPage;