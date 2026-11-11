import React, { useState } from 'react';
import { mockAuditLogs } from '../data/mockSecurityData';

export const EmployeeAccessActivityPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs for employee session/access events
  const accessActivityLogs = mockAuditLogs.filter(log => 
    log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', paddingBottom: '6.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
          Employee Access Activity
        </h1>
        <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary, #475569)', fontSize: '0.925rem' }}>
          Real-time tracking of employee resource sessions, authentication handshakes, and privilege usage.
        </p>
      </div>

      <div style={{ background: 'var(--color-bg-card, rgba(255,255,255,0.7))', border: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))', borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--shadow-card, 0 4px 20px rgba(0,0,0,0.04))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Active Session Log</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Monitoring employee interaction telemetry.</p>
          </div>
          <input 
            type="text" 
            placeholder="Search employee or activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-default, #cbd5e1)', background: '#fff', fontSize: '0.875rem', width: '280px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle, #e2e8f0)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                <th style={{ padding: '0.75rem 1rem' }}>Employee / Actor</th>
                <th style={{ padding: '0.75rem 1rem' }}>Action Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Activity Details</th>
              </tr>
            </thead>
            <tbody>
              {accessActivityLogs.length > 0 ? (
                accessActivityLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{log.timestamp}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{log.actor}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '4px', fontWeight: 500 }}>
                        {log.eventType}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                        background: log.status === 'APPROVED' ? '#d1fae5' : log.status === 'BLOCKED' ? '#fee2e2' : '#fef3c7',
                        color: log.status === 'APPROVED' ? '#065f46' : log.status === 'BLOCKED' ? '#991b1b' : '#92400e'
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-body)' }}>{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No access activity records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAccessActivityPage;