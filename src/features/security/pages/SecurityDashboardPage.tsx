import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SecurityDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
<<<<<<< HEAD
    <div style={{ padding: '2rem', paddingBottom: '6.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
=======
    <div style={{ padding: '2.5rem 3rem', maxWidth: '1440px', margin: '0 auto', width: '100%', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
>>>>>>> c6de39b (fix(security): finalize layout and routing integration)
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Security overview</h1>
          <p style={{ marginTop: '0.35rem', color: '#64748b', fontSize: '0.875rem' }}>
            Organization-wide identity, device, and access posture. Updated today at 10:40 UTC.
          </p>
        </div>
        <button
          onClick={() => alert('Exporting security report...')}
          style={{
            padding: '0.5rem 1rem',
            background: '#1e1b4b',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          Export report
        </button>
      </div>

      {/* Top 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Active users', value: '248', sub: '+6 in the last 30 days' },
          { label: 'Managed devices', value: '312', sub: '302 compliant · 10 need attention' },
          { label: 'Network compliance', value: '96.8%', sub: '+1.2% from last week' },
          { label: 'Open security alerts', value: '07', sub: '2 high · 3 medium · 2 low' },
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {kpi.label}
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.4rem 0 0.3rem 0', color: '#0f172a' }}>
              {kpi.value}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {kpi.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Middle Grid: Control Coverage & Session Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Control Coverage */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.2rem 0', color: '#0f172a' }}>Control coverage</h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem' }}>Core safeguards across your organization</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', fontSize: '0.8125rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.15rem' }}>🛡️ MFA enrollment - 100%</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', paddingLeft: '1.5rem' }}>248 of 248 active users protected.</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.15rem' }}>💻 Device baseline - 96.8%</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', paddingLeft: '1.5rem' }}>302 of 312 devices are compliant.</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.15rem' }}>⏱️ Policy acknowledgment - 92%</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', paddingLeft: '1.5rem' }}>22 employees have outstanding actions.</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.15rem' }}>🔗 Audit ingestion healthy</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', paddingLeft: '1.5rem' }}>All 12 connectors reporting.</div>
            </div>
          </div>
        </div>

        {/* Access & Session Activity Chart Widget */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>Access & session activity</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>18–24 Oct 2026 · Last 7 days</span>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span> Compliant sessions</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: '8px', height: '8px', background: '#93c5fd', borderRadius: '50%' }}></span> Flagged sessions</span>
            </div>
          </div>

          {/* Bar Chart Mockup */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '140px', paddingBottom: '0.25rem', borderBottom: '1px solid #f1f5f9' }}>
            {['18 Oct', '19 Oct', '20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct'].map((date, i) => {
              const heights = [45, 60, 50, 75, 65, 95, 85];
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
                    <div style={{ width: '16px', height: `${heights[i]}px`, background: '#3b82f6', borderRadius: '3px 3px 0 0' }}></div>
                    <div style={{ width: '10px', height: `${heights[i] * 0.25}px`, background: '#93c5fd', borderRadius: '2px 2px 0 0' }}></div>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>{date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Security Events Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.15rem 0', color: '#0f172a' }}>Priority security events</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Open alerts · Highest severity first</span>
          </div>
          <span 
            onClick={() => navigate('/security/alerts')}
            style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}
          >
            Security Alerts →
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Alert</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Affected Identity</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Severity</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Detected</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'ALT-0871', desc: 'Anomalous sign-in blocked', user: 'Lucas Martin', sev: 'High', sevBg: '#fee2e2', sevColor: '#991b1b', status: 'Open', statusColor: '#d97706', time: 'Today, 10:34' },
              { id: 'ALT-0869', desc: 'Unmanaged device attempt', user: 'Unknown device', sev: 'High', sevBg: '#fee2e2', sevColor: '#991b1b', status: 'Investigating', statusColor: '#2563eb', time: 'Today, 10:10' },
              { id: 'ALT-0857', desc: 'Device security update overdue', user: 'Noah Williams', sev: 'Medium', sevBg: '#fef3c7', sevColor: '#92400e', status: 'Open', statusColor: '#d97706', time: 'Today, 09:50' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => navigate('/security/alerts')}>
                <td style={{ padding: '0.875rem 0.5rem' }}>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace', color: '#0f172a' }}>{row.id}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.1rem' }}>{row.desc}</div>
                </td>
                <td style={{ padding: '0.875rem 0.5rem', fontWeight: 500, color: '#1e293b' }}>{row.user}</td>
                <td style={{ padding: '0.875rem 0.5rem' }}>
                  <span style={{ padding: '0.15rem 0.5rem', background: row.sevBg, color: row.sevColor, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                    ● {row.sev}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 0.5rem' }}>
                  <span style={{ color: row.statusColor, fontWeight: 600, fontSize: '0.75rem' }}>
                    ● {row.status}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 0.5rem', color: '#64748b' }}>{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
          <span>Showing 3 of 7 open alerts</span>
          <span>Previous 1 Next →</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboardPage;