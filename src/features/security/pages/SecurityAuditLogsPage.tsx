// import React, { useState } from 'react';

// export const SecurityAuditLogsPage: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('All events');
//   const [searchQuery, setSearchQuery] = useState('');

//   const logs = [
//     { timestamp: '24 Oct, 10:35:02', id: 'EVT-90184', actor: 'Priya Shah', event: 'Alert assigned', target: 'ALT-0871', source: 'Console', outcome: 'Success' },
//     { timestamp: '24 Oct, 10:34:16', id: 'EVT-90183', actor: 'Lucas Martin', event: 'Sign-in blocked', target: 'Acme SSO', source: '203.0.113.84', outcome: 'Blocked' },
//     { timestamp: '24 Oct, 10:30:00', id: 'EVT-90172', actor: 'System - Jamf', event: 'Device check passed', target: 'MBP-NICHEN-01', source: 'Device connector', outcome: 'Success' },
//     { timestamp: '24 Oct, 10:22:04', id: 'EVT-90169', actor: 'Maya Chen', event: 'Session started', target: 'Looker', source: '10.20.14.42', outcome: 'Success' },
//     { timestamp: '24 Oct, 10:12:10', id: 'EVT-90140', actor: 'Daniel Brooks', event: 'Request approved', target: 'AR-2048 - Elena Rossi', source: '10.20.14.08', outcome: 'Success' },
//     { timestamp: '24 Oct, 09:55:28', id: 'EVT-90112', actor: 'Daniel Brooks', event: 'Request rejected', target: 'AR-2044 - Lucas Martin', source: '10.20.14.08', outcome: 'Success' },
//     { timestamp: '24 Oct, 09:50:12', id: 'EVT-90104', actor: 'Noah Williams', event: 'Resource access blocked', target: 'GitHub - Insights', source: '10.20.14.70', outcome: 'Blocked' },
//     { timestamp: '24 Oct, 09:19:03', id: 'EVT-90088', actor: 'Maya Chen', event: 'Request submitted', target: 'AR-2046 - Snowflake', source: '10.20.14.42', outcome: 'Success' },
//   ];

//   const filteredLogs = logs.filter(l => 
//     l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     l.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     l.target.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div style={{ padding: '2.5rem 3rem', maxWidth: '1440px', margin: '0 auto', width: '100%', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
//         <div>
//           <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Audit Logs</h1>
//           <p style={{ marginTop: '0.35rem', color: '#64748b', fontSize: '0.875rem' }}>
//             Search the immutable record of authentication, access decisions, and administrative changes.
//           </p>
//         </div>
//         <button onClick={() => alert('Exporting audit logs...')} style={{ padding: '0.5rem 1rem', background: '#1e1b4b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
//           Export logs
//         </button>
//       </div>

//       {/* Tabs */}
//       <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
//         {['All events', 'Authentication', 'Access decisions', 'Policy changes', 'Administration'].map((tab) => (
//           <span 
//             key={tab} 
//             onClick={() => setActiveTab(tab)}
//             style={{ 
//               paddingBottom: '0.5rem', 
//               cursor: 'pointer',
//               borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none', 
//               color: activeTab === tab ? '#2563eb' : '#64748b' 
//             }}
//           >
//             {tab}
//           </span>
//         ))}
//       </div>

//       {/* Table Card Container */}
//       <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//           <div>
//             <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>Event stream</h3>
//             <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Today · 1,284 events · Latest first</span>
//           </div>
          
//           <div style={{ display: 'flex', gap: '0.75rem' }}>
//             <input 
//               type="text" 
//               placeholder="Search actor, event, target, or ID..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', width: '260px' }}
//             />
//             <button style={{ padding: '0.4rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer', color: '#334155' }}>
//               ⚙️ Advanced filters
//             </button>
//             <button style={{ padding: '0.4rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8125rem', cursor: 'pointer', color: '#334155' }}>
//               📅 24 Oct 2026
//             </button>
//           </div>
//         </div>

//         {/* Audit Table */}
//         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
//           <thead>
//             <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//               <th style={{ padding: '0.75rem' }}>Timestamp / ID</th>
//               <th style={{ padding: '0.75rem' }}>Actor</th>
//               <th style={{ padding: '0.75rem' }}>Event</th>
//               <th style={{ padding: '0.75rem' }}>Target</th>
//               <th style={{ padding: '0.75rem' }}>Source</th>
//               <th style={{ padding: '0.75rem' }}>Outcome</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredLogs.map((log, i) => (
//               <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
//                 <td style={{ padding: '0.875rem 0.75rem' }}>
//                   <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.timestamp}</div>
//                   <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#64748b' }}>{log.id}</div>
//                 </td>
//                 <td style={{ padding: '0.875rem 0.75rem', fontWeight: 500, color: '#1e293b' }}>{log.actor}</td>
//                 <td style={{ padding: '0.875rem 0.75rem', fontWeight: 500, color: '#1e293b' }}>{log.event}</td>
//                 <td style={{ padding: '0.875rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#334155' }}>{log.target}</td>
//                 <td style={{ padding: '0.875rem 0.75rem', color: '#64748b' }}>{log.source}</td>
//                 <td style={{ padding: '0.875rem 0.75rem' }}>
//                   <span style={{ color: log.outcome === 'Success' ? '#065f46' : '#991b1b', fontWeight: 600, fontSize: '0.75rem' }}>
//                     ● {log.outcome}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
//           <span>Showing 1–8 of 1,284 events · Integrity verified</span>
//           <span>Previous 1 Next →</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SecurityAuditLogsPage;


import React, { useMemo, useState } from "react";

type AuditLog = {
  timestamp: string;
  id: string;
  actor: string;
  event: string;
  target: string;
  source: string;
  outcome: "Success" | "Blocked";
  category:
    | "Authentication"
    | "Access decisions"
    | "Policy changes"
    | "Administration";
};

const logs: AuditLog[] = [
  {
    timestamp: "24 Oct, 10:35:02",
    id: "EVT-90184",
    actor: "Priya Shah",
    event: "Alert assigned",
    target: "ALT-0871",
    source: "Console",
    outcome: "Success",
    category: "Administration",
  },
  {
    timestamp: "24 Oct, 10:34:16",
    id: "EVT-90183",
    actor: "Lucas Martin",
    event: "Sign-in blocked",
    target: "Acme SSO",
    source: "203.0.113.84",
    outcome: "Blocked",
    category: "Authentication",
  },
  {
    timestamp: "24 Oct, 10:30:00",
    id: "EVT-90172",
    actor: "System - Jamf",
    event: "Device check passed",
    target: "MBP-NICHEN-01",
    source: "Device connector",
    outcome: "Success",
    category: "Policy changes",
  },
  {
    timestamp: "24 Oct, 10:22:04",
    id: "EVT-90169",
    actor: "Maya Chen",
    event: "Session started",
    target: "Looker",
    source: "10.20.14.42",
    outcome: "Success",
    category: "Authentication",
  },
  {
    timestamp: "24 Oct, 10:12:10",
    id: "EVT-90140",
    actor: "Daniel Brooks",
    event: "Request approved",
    target: "AR-2048 - Elena Rossi",
    source: "10.20.14.08",
    outcome: "Success",
    category: "Access decisions",
  },
  {
    timestamp: "24 Oct, 09:55:28",
    id: "EVT-90112",
    actor: "Daniel Brooks",
    event: "Request rejected",
    target: "AR-2044 - Lucas Martin",
    source: "10.20.14.08",
    outcome: "Success",
    category: "Access decisions",
  },
  {
    timestamp: "24 Oct, 09:50:12",
    id: "EVT-90104",
    actor: "Noah Williams",
    event: "Resource access blocked",
    target: "GitHub - Insights",
    source: "10.20.14.70",
    outcome: "Blocked",
    category: "Access decisions",
  },
  {
    timestamp: "24 Oct, 09:19:03",
    id: "EVT-90088",
    actor: "Maya Chen",
    event: "Request submitted",
    target: "AR-2046 - Snowflake",
    source: "10.20.14.42",
    outcome: "Success",
    category: "Access decisions",
  },
];

const tabs = [
  "All events",
  "Authentication",
  "Access decisions",
  "Policy changes",
  "Administration",
] as const;

export const SecurityAuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("All events");

  const [searchQuery, setSearchQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [outcomeFilter, setOutcomeFilter] = useState("All outcomes");

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const query = searchQuery.toLowerCase().trim();

        const matchesQuery =
          !query ||
          [
            log.actor,
            log.event,
            log.target,
            log.id,
            log.source,
          ].some((value) => value.toLowerCase().includes(query));

        const matchesTab =
          activeTab === "All events" || log.category === activeTab;

        const matchesOutcome =
          outcomeFilter === "All outcomes" ||
          log.outcome === outcomeFilter;

        return matchesQuery && matchesTab && matchesOutcome;
      }),
    [activeTab, searchQuery, outcomeFilter]
  );

  const exportCsv = () => {
    const header = [
      "Timestamp",
      "ID",
      "Actor",
      "Event",
      "Target",
      "Source",
      "Outcome",
    ];

    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.id,
      log.actor,
      log.event,
      log.target,
      log.source,
      log.outcome,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "brainmint-audit-logs.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
<<<<<<< HEAD
    <div style={{ padding: '2rem', paddingBottom: '6.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
          System Audit Logs
        </h1>
        <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary, #475569)', fontSize: '0.925rem' }}>
          Complete historical record of access requests, approvals, blocks, and zero-trust violations.
        </p>
=======
    <div className="security-page audit-page">
      <div className="page-heading">
        <div>
          <h1>Audit Logs</h1>
          <p>
            Search the immutable record of authentication, access decisions,
            and administrative changes.
          </p>
        </div>

        <button className="btn btn-primary" onClick={exportCsv}>
          ⇩ &nbsp; Export logs
        </button>
>>>>>>> c6de39b (fix(security): finalize layout and routing integration)
      </div>

      <div
        className="audit-tabs"
        role="tablist"
        aria-label="Audit log categories"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <article className="surface audit-stream">
        <div className="audit-stream-heading">
          <div>
            <h2>Event stream</h2>
            <p>Today · 1,284 events · Latest first</p>
          </div>

          <div className="audit-controls">
            <label className="search-box">
              <span>⌕</span>
              <input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search actor, event, target, or ID..."
              />
            </label>

            <select
              className="filter-select"
              value={outcomeFilter}
              onChange={(event) =>
                setOutcomeFilter(event.target.value)
              }
              aria-label="Filter outcomes"
            >
              <option>All outcomes</option>
              <option>Success</option>
              <option>Blocked</option>
            </select>

            <button
              className={`btn btn-filter${
                advancedOpen ? " filter-active" : ""
              }`}
              onClick={() => setAdvancedOpen((open) => !open)}
            >
              ☷ &nbsp; Advanced filters
            </button>

            <button
              className="btn btn-filter date-button"
              onClick={() =>
                window.alert("Showing audit events for 24 Oct 2026.")
              }
            >
              ▣ &nbsp; 24 Oct 2026
            </button>
          </div>
        </div>

        {advancedOpen && (
          <div className="advanced-filter-panel">
            <strong>Advanced filters</strong>

            <span>
              Use the category tabs and outcome selector above, or search by
              actor, event, target, source, or event ID.
            </span>

            <button
              className="text-link"
              onClick={() => {
                setSearchQuery("");
                setOutcomeFilter("All outcomes");
                setActiveTab("All events");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="table-scroll">
          <table className="security-table audit-table">
            <thead>
              <tr>
                <th>Timestamp / ID</th>
                <th>Actor</th>
                <th>Event</th>
                <th>Target</th>
                <th>Source</th>
                <th>Outcome</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.timestamp}</strong>
                    <small className="cell-subtitle mono">
                      {log.id}
                    </small>
                  </td>

                  <td>{log.actor}</td>
                  <td>{log.event}</td>
                  <td className="mono target-cell">{log.target}</td>
                  <td className="muted">{log.source}</td>

                  <td>
                    <span
                      className={`outcome outcome-${log.outcome.toLowerCase()}`}
                    >
                      ● {log.outcome}
                    </span>
                  </td>
                </tr>
              ))}

              {!filteredLogs.length && (
                <tr>
                  <td colSpan={6} className="empty-table">
                    No audit events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing{" "}
            {filteredLogs.length
              ? `1–${filteredLogs.length}`
              : "0"}{" "}
            of{" "}
            {filteredLogs.length === logs.length
              ? "1,284"
              : filteredLogs.length}{" "}
            events · Integrity verified
          </span>

          <span>‹ Previous&nbsp;&nbsp; 1 &nbsp;&nbsp;Next ›</span>
        </div>
      </article>
    </div>
  );
};

export default SecurityAuditLogsPage;