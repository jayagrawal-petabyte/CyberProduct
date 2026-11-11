// import React, { useState } from 'react';

// export const SecurityAlertsPage: React.FC = () => {
//   const [selectedAlert, setSelectedAlert] = useState({
//     id: 'ALT-0871',
//     title: 'Anomalous sign-in blocked',
//     time: 'Detected today at 10:34 UTC',
//     severity: 'High',
//     user: 'Lucas Martin - EMP-1076',
//     assignedTo: 'Priya Shah',
//     ip: '203.0.113.84 - Untrusted',
//     rule: 'Impossible travel + new device',
//     description: 'A sign-in from an unrecognized device occurred 12 minutes after a trusted San Francisco session. Contact Lucas through a verified channel before resolving this alert.'
//   });

//   const alerts = [
//     { id: 'ALT-0871', title: 'Anomalous sign-in blocked', user: 'Lucas Martin · Unrecognized location', sev: 'High', time: '10:34' },
//     { id: 'ALT-0869', title: 'Unmanaged device attempt', user: 'Unknown device · Public network', sev: 'High', time: '10:10' },
//     { id: 'ALT-0857', title: 'Security update overdue', user: 'Noah Williams · WIN-NWILLIAMS-01', sev: 'Medium', time: '09:50' },
//     { id: 'ALT-0860', title: 'Repeated denied access', user: 'Service identity · staging-deploy', sev: 'Medium', time: '09:20' },
//     { id: 'ALT-0853', title: 'Endpoint check delayed', user: 'London Office · 2 endpoints', sev: 'Low', time: '03:45' },
//   ];

//   return (
//     <div style={{ padding: '2.5rem 3rem', maxWidth: '1440px', margin: '0 auto', width: '100%', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
//         <div>
//           <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Security Alerts</h1>
//           <p style={{ marginTop: '0.35rem', color: '#64748b', fontSize: '0.875rem' }}>
//             Investigate risk signals, contain threats, and document security decisions.
//           </p>
//         </div>
//         <button style={{ padding: '0.5rem 1rem', background: '#1e1b4b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
//           Alert rules
//         </button>
//       </div>

//       {/* 4 Summary Cards */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
//         {[
//           { label: 'Open alerts', val: '07', sub: '2 high · 3 medium · 2 low', active: true },
//           { label: 'High priority', val: '02', sub: 'Both attempts blocked', active: false },
//           { label: 'Investigating', val: '03', sub: 'Assigned to Security', active: false },
//           { label: 'Resolved today', val: '09', sub: 'Median response: 12 minutes', active: false },
//         ].map((c, i) => (
//           <div key={i} style={{ background: '#ffffff', border: `1px solid ${c.active ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
//             <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</span>
//             <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0 0.25rem 0', color: '#0f172a' }}>{c.val}</div>
//             <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.sub}</span>
//           </div>
//         ))}
//       </div>

//       {/* Tabs Filter */}
//       <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
//         <span style={{ paddingBottom: '0.5rem', borderBottom: '2px solid #2563eb', color: '#2563eb' }}>Open (7)</span>
//         <span style={{ paddingBottom: '0.5rem', color: '#64748b', cursor: 'pointer' }}>Investigating (3)</span>
//         <span style={{ paddingBottom: '0.5rem', color: '#64748b', cursor: 'pointer' }}>Resolved</span>
//         <span style={{ paddingBottom: '0.5rem', color: '#64748b', cursor: 'pointer' }}>All alerts</span>
//       </div>

//       {/* Split Pane: Queue & Inspection Details */}
//       <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>
//         {/* Left Queue */}
//         <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', height: 'fit-content' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
//             <div>
//               <h3 style={{ fontSize: '0.925rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>Alert queue</h3>
//               <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Highest severity first</span>
//             </div>
//             <span style={{ fontSize: '0.8125rem' }}>📊</span>
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//             {alerts.map((a, i) => (
//               <div 
//                 key={i} 
//                 onClick={() => setSelectedAlert({ ...selectedAlert, id: a.id, title: a.title, severity: a.sev, user: a.user })}
//                 style={{
//                   padding: '0.875rem',
//                   background: selectedAlert.id === a.id ? '#f8fafc' : '#ffffff',
//                   border: `1px solid ${selectedAlert.id === a.id ? '#3b82f6' : '#e2e8f0'}`,
//                   borderRadius: '8px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
//                   <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', background: a.sev === 'High' ? '#fee2e2' : a.sev === 'Medium' ? '#fef3c7' : '#f1f5f9', color: a.sev === 'High' ? '#991b1b' : a.sev === 'Medium' ? '#92400e' : '#475569', borderRadius: '4px' }}>
//                     {a.sev} · {a.id}
//                   </span>
//                   <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{a.time}</span>
//                 </div>
//                 <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem', color: '#0f172a' }}>{a.title}</div>
//                 <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.user}</div>
//               </div>
//             ))}
//           </div>
//           <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center', paddingTop: '0.5rem' }}>Showing 5 of 7 open alerts</div>
//         </div>

//         {/* Right Inspection Detail View */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
//           <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
//               <div>
//                 <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>{selectedAlert.title}</h2>
//                 <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{selectedAlert.id} · Detected today at 10:34 UTC</span>
//               </div>
//               <span style={{ padding: '0.2rem 0.6rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>● High</span>
//             </div>

//             {/* Status Banner */}
//             <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.875rem 1rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1.5rem', border: '1px solid #a7f3d0' }}>
//               <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>Access was blocked</div>
//               <div style={{ fontSize: '0.75rem' }}>Risk-based authentication prevented this session. No resource access was granted.</div>
//             </div>

//             {/* Meta Grid */}
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
//               <div>
//                 <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Affected user</span>
//                 <div style={{ fontWeight: 600, marginTop: '0.15rem', color: '#0f172a' }}>{selectedAlert.user}</div>
//               </div>
//               <div>
//                 <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Assigned to</span>
//                 <div style={{ fontWeight: 600, marginTop: '0.15rem', color: '#0f172a' }}>Priya Shah</div>
//               </div>
//               <div>
//                 <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Source IP</span>
//                 <div style={{ fontWeight: 600, marginTop: '0.15rem', color: '#991b1b' }}>203.0.113.84 · Untrusted</div>
//               </div>
//               <div>
//                 <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Detection rule</span>
//                 <div style={{ fontWeight: 600, marginTop: '0.15rem', color: '#0f172a' }}>Impossible travel + new device</div>
//               </div>
//             </div>

//             <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.5rem' }}>
//               {selectedAlert.description}
//             </p>

//             {/* Action Buttons */}
//             <div style={{ display: 'flex', gap: '0.75rem' }}>
//               <button onClick={() => alert('Launching investigator workbench...')} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}>
//                 Investigate
//               </button>
//               <button onClick={() => alert('Revoking active sessions for user...')} style={{ padding: '0.5rem 1rem', background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}>
//                 Revoke sessions
//               </button>
//               <button onClick={() => alert('Alert marked as resolved.')} style={{ padding: '0.5rem 1rem', background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}>
//                 Resolve
//               </button>
//             </div>
//           </div>

//           {/* Response Timeline */}
//           <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
//             <h3 style={{ fontSize: '0.925rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#0f172a' }}>Response timeline</h3>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
//               <div style={{ display: 'flex', gap: '0.75rem' }}>
//                 <span style={{ fontSize: '1rem' }}>👤</span>
//                 <div>
//                   <div style={{ fontWeight: 600, color: '#0f172a' }}>Alert assigned to Priya Shah</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>High-priority routing · Security on-call · 10:35 UTC</div>
//                 </div>
//               </div>
//               <div style={{ display: 'flex', gap: '0.75rem' }}>
//                 <span style={{ fontSize: '1rem' }}>🛡️</span>
//                 <div>
//                   <div style={{ fontWeight: 600, color: '#0f172a' }}>Sign-in blocked automatically</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Remote Access & MPA v2.0 enforced · 10:34 UTC</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SecurityAlertsPage;


import React, { useMemo, useState } from "react";

type Alert = {
  id: string;
  title: string;
  user: string;
  severity: "High" | "Medium" | "Low";
  time: string;
  assignedTo: string;
  ip: string;
  rule: string;
  description: string;
  status: "Open" | "Investigating" | "Resolved";
};

const initialAlerts: Alert[] = [
  {
    id: "ALT-0871",
    title: "Anomalous sign-in blocked",
    user: "Lucas Martin · EMP-1076",
    severity: "High",
    time: "10:34",
    assignedTo: "Priya Shah",
    ip: "203.0.113.84 · Untrusted",
    rule: "Impossible travel + new device",
    description:
      "A sign-in from an unrecognized device occurred 12 minutes after a trusted San Francisco session. Contact Lucas through a verified channel before resolving this alert.",
    status: "Open",
  },
  {
    id: "ALT-0869",
    title: "Unmanaged device attempt",
    user: "Unknown device · Public network",
    severity: "High",
    time: "10:10",
    assignedTo: "Security team",
    ip: "198.51.100.24 · Untrusted",
    rule: "Unmanaged endpoint access",
    description:
      "An unmanaged endpoint attempted to access a protected resource from a public network. Access was denied by device posture policy.",
    status: "Investigating",
  },
  {
    id: "ALT-0857",
    title: "Security update overdue",
    user: "Noah Williams · WIN-NWILLIAMS-01",
    severity: "Medium",
    time: "09:50",
    assignedTo: "Priya Shah",
    ip: "10.20.14.70 · Internal",
    rule: "Endpoint patch compliance",
    description:
      "The endpoint has not installed the latest required security update. Follow up with the device owner and verify compliance after patching.",
    status: "Open",
  },
  {
    id: "ALT-0860",
    title: "Repeated denied access",
    user: "Service identity · staging-deploy",
    severity: "Medium",
    time: "09:20",
    assignedTo: "Daniel Brooks",
    ip: "10.20.14.18 · Internal",
    rule: "Repeated access denial",
    description:
      "A service identity generated repeated denied access attempts against a restricted resource.",
    status: "Investigating",
  },
  {
    id: "ALT-0853",
    title: "Endpoint check delayed",
    user: "London Office · 2 endpoints",
    severity: "Low",
    time: "03:45",
    assignedTo: "Security team",
    ip: "Connector · Delayed",
    rule: "Endpoint telemetry delay",
    description:
      "The endpoint connector has not reported its latest health check. Confirm connector availability and retry ingestion.",
    status: "Open",
  },
];

const summary = [
  {
    label: "Open alerts",
    value: "07",
    note: "2 high · 3 medium · 2 low",
  },
  {
    label: "High priority",
    value: "02",
    note: "Both attempts blocked",
  },
  {
    label: "Investigating",
    value: "03",
    note: "Assigned to Security",
  },
  {
    label: "Resolved today",
    value: "09",
    note: "Median response: 12 minutes",
  },
];

export const SecurityAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedId, setSelectedId] = useState("ALT-0871");

  const [activeTab, setActiveTab] = useState<
    "Open" | "Investigating" | "Resolved" | "All alerts"
  >("Open");

  const selected =
    alerts.find((alert) => alert.id === selectedId) ?? alerts[0];

  const visibleAlerts = useMemo(
    () =>
      activeTab === "All alerts"
        ? alerts
        : alerts.filter((alert) => alert.status === activeTab),
    [alerts, activeTab]
  );

  const updateSelected = (status: Alert["status"]) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === selected.id ? { ...alert, status } : alert
      )
    );
  };

  return (
<<<<<<< HEAD
    <div style={{ padding: '2rem', paddingBottom: '6.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
          Active Security Alerts
        </h1>
        <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary, #475569)', fontSize: '0.925rem' }}>
          Comprehensive threat triage, policy infraction monitoring, and evidence inspection center.
        </p>
=======
    <div className="security-page alerts-page">
      <div className="page-heading">
        <div>
          <h1>Security Alerts</h1>
          <p>
            Investigate risk signals, contain threats, and document security
            decisions.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            window.alert(
              "Alert rules are managed by your security administrator."
            )
          }
        >
          ▦ &nbsp; Alert rules
        </button>
>>>>>>> c6de39b (fix(security): finalize layout and routing integration)
      </div>

      <section className="metric-grid alert-metrics">
        {summary.map((item, index) => (
          <article
            className={`surface metric-card${
              index === 0 ? " metric-card-accent" : ""
            }`}
            key={item.label}
          >
            <span className="eyebrow">{item.label}</span>
            <strong className="metric-value">{item.value}</strong>
            <span className="metric-note">{item.note}</span>
          </article>
        ))}
      </section>

      <div
        className="alert-tabs"
        role="tablist"
        aria-label="Filter alerts"
      >
        {(
          ["Open", "Investigating", "Resolved", "All alerts"] as const
        ).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "Open"
              ? " (7)"
              : tab === "Investigating"
              ? " (3)"
              : ""}
          </button>
        ))}
      </div>

      <section className="alerts-layout">
        {/* Alert Queue */}
        <article className="surface alert-queue">
          <div className="queue-heading">
            <div>
              <h2>Alert queue</h2>
              <p>Highest severity first</p>
            </div>
            <span className="queue-filter">☷</span>
          </div>

          <div className="queue-list">
            {visibleAlerts.length ? (
              visibleAlerts.map((alert) => (
                <button
                  key={alert.id}
                  className={`queue-item${
                    selectedId === alert.id ? " selected" : ""
                  }`}
                  onClick={() => setSelectedId(alert.id)}
                >
                  <span className="queue-item-top">
                    <span
                      className={`severity severity-${alert.severity.toLowerCase()}`}
                    >
                      {alert.severity} · {alert.id}
                    </span>
                    <time>{alert.time}</time>
                  </span>

                  <strong>{alert.title}</strong>
                  <small>{alert.user}</small>
                </button>
              ))
            ) : (
              <p className="empty-state">No alerts in this category.</p>
            )}
          </div>

          <div className="queue-footer">
            Showing {visibleAlerts.length} of 7 open alerts
          </div>
        </article>

        {/* Selected Alert Details */}
        <div className="alert-detail-column">
          <article className="surface alert-detail">
            <div className="detail-title-row">
              <div>
                <h2>{selected.title}</h2>
                <p className="mono muted">
                  {selected.id} · Detected today at {selected.time} UTC
                </p>
              </div>

              <span
                className={`severity severity-${selected.severity.toLowerCase()}`}
              >
                ● {selected.severity}
              </span>
            </div>

            <div className="access-banner">
              <strong>
                {selected.status === "Resolved"
                  ? "Alert resolved"
                  : "Access was blocked"}
              </strong>

              <span>
                {selected.status === "Resolved"
                  ? "This alert has been marked as resolved."
                  : "Risk-based authentication prevented this session. No resource access was granted."}
              </span>
            </div>

            <div className="detail-meta-grid">
              <div>
                <span>Affected user</span>
                <strong>{selected.user}</strong>
              </div>

              <div>
                <span>Assigned to</span>
                <strong>{selected.assignedTo}</strong>
              </div>

              <div>
                <span>Source IP</span>
                <strong className="danger-text">{selected.ip}</strong>
              </div>

              <div>
                <span>Detection rule</span>
                <strong>{selected.rule}</strong>
              </div>
            </div>

            <p className="alert-description">{selected.description}</p>

            <div className="detail-actions">
              <button
                className="btn btn-blue"
                onClick={() => updateSelected("Investigating")}
              >
                ↗ &nbsp; Investigate
              </button>

              <button
                className="btn btn-outline"
                onClick={() =>
                  window.alert("Session revocation request submitted.")
                }
              >
                ⇥ &nbsp; Revoke sessions
              </button>

              <button
                className="btn btn-outline"
                onClick={() => updateSelected("Resolved")}
              >
                Resolve
              </button>
            </div>
          </article>

          {/* Response Timeline */}
          <article className="surface response-timeline">
            <h2>Response timeline</h2>

            <div className="timeline-entry">
              <span className="timeline-icon">♙</span>
              <div>
                <strong>
                  Alert assigned to {selected.assignedTo}
                </strong>
                <small>
                  High-priority routing · Security on-call · 10:35 UTC
                </small>
              </div>
            </div>

            <div className="timeline-entry">
              <span className="timeline-icon">▣</span>
              <div>
                <strong>Sign-in blocked automatically</strong>
                <small>
                  Remote Access &amp; MPA v2.0 enforced · {selected.time} UTC
                </small>
              </div>
            </div>

            {selected.status === "Resolved" && (
              <div className="timeline-entry">
                <span className="timeline-icon">✓</span>
                <div>
                  <strong>Alert marked as resolved</strong>
                  <small>Status updated in this session</small>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
};

export default SecurityAlertsPage;