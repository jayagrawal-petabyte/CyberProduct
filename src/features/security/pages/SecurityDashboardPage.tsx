import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SecurityDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
            Security Operations Dashboard
          </h1>
          <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary, #475569)', fontSize: '0.925rem' }}>
            Real-time telemetry, threat posture, and zero-trust policy enforcement metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/security/access-denied')}
            style={{
              padding: '0.5rem 1rem',
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #f87171',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Test Access Denied View
          </button>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Active Threat Alerts', value: '3 Critical', sub: 'Requires immediate triage', color: '#dc2626', bg: '#fee2e2' },
          { label: 'Network Compliance', value: '96.8%', sub: 'All 18 VPC tunnels secure', color: '#059669', bg: '#d1fae5' },
          { label: 'Blocked Breaches (24h)', value: '1,429', sub: 'Prevented credential & geo attacks', color: '#d97706', bg: '#fef3c7' },
          { label: 'Isolated Endpoints', value: '2 Devices', sub: 'Outdated signature posture', color: '#4f46e5', bg: '#e0e7ff' },
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: 'var(--color-bg-card, #fff)',
            border: '1px solid var(--color-border-subtle, #e2e8f0)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary, #64748b)' }}>
              {kpi.label}
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: kpi.color, marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              {kpi.value}
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #64748b)' }}>
              {kpi.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Links / Module Sections */}
      <div style={{
        background: 'var(--color-bg-card, #fff)',
        border: '1px solid var(--color-border-subtle, #e2e8f0)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Security Navigation Center</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #475569)', marginBottom: '1.5rem' }}>
          Select a downstream security view to inspect audit trails, manage active alerts, or monitor employee endpoint access activity.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'Security Profile', desc: 'Manage your security credentials and clearance level.', path: '/security/profile' },
            { title: 'Security Notifications', desc: 'Review priority broadcast alerts and security dispatches.', path: '/security/notifications' },
          ].map((item, i) => (
            <div key={i} onClick={() => navigate(item.path)} style={{
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              background: '#f8fafc',
              transition: 'all 0.2s'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{item.title} →</h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboardPage;