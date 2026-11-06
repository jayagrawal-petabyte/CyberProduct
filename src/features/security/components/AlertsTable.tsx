
import React, { useState } from 'react';
import { mockAlerts } from '../data/mockSecurityData';
import { AlertItem } from '../types/security.types';

export const AlertsTable: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesSearch = alert.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          alert.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.device.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div style={{ background: 'var(--color-bg-card, rgba(255,255,255,0.7))', border: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))', borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--shadow-card, 0 4px 20px rgba(0,0,0,0.04))' }}>
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Security Alerts Center</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Monitor active threat alerts, policy infractions, and device compliance triggers.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search employee, resource, device..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-default, #cbd5e1)', background: '#fff', fontSize: '0.875rem', width: '260px' }}
          />
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-default, #cbd5e1)', background: '#fff', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-subtle, #e2e8f0)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem 1rem' }}>Severity</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
              <th style={{ padding: '0.75rem 1rem' }}>Device</th>
              <th style={{ padding: '0.75rem 1rem' }}>Target Resource</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => (
                <tr key={alert.id} style={{ borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{alert.timestamp}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      background: alert.severity === 'CRITICAL' ? '#fee2e2' : alert.severity === 'HIGH' ? '#ffedd5' : '#fef3c7',
                      color: alert.severity === 'CRITICAL' ? '#991b1b' : alert.severity === 'HIGH' ? '#9a3412' : '#92400e'
                    }}>
                      {alert.severity}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ fontFamily: 'monospace', fontSize: '0.75rem', padding: '0.15rem 0.4rem', background: '#f1f5f9', borderRadius: '4px' }}>{alert.status}</span></td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{alert.employeeName}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{alert.device}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{alert.resource}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedAlert(alert)}
                      style={{ padding: '0.3rem 0.75rem', background: 'var(--color-brand-primary, #6366f1)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No alerts found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', maxWidth: '500px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Alert Evidence: {selectedAlert.id}</h3>
              <button onClick={() => setSelectedAlert(null)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p><strong>Employee:</strong> {selectedAlert.employeeName}</p>
              <p><strong>Target Resource:</strong> {selectedAlert.resource}</p>
              <p><strong>IP Address:</strong> <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{selectedAlert.evidenceFields.ipAddress}</span></p>
              <p><strong>Trigger Rule:</strong> {selectedAlert.evidenceFields.triggerRule}</p>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Diagnostic Details:</span>
                <p style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedAlert.evidenceFields.details}</p>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedAlert(null)}
                style={{ padding: '0.4rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 500 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};