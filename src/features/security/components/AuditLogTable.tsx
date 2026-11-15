
// import React, { useState } from 'react';
// import { mockAuditLogs } from '../data/mockSecurityData';

// export const AuditLogTable: React.FC = () => {
//   const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
//   const [searchQuery, setSearchQuery] = useState<string>('');

//   const filteredLogs = mockAuditLogs.filter(log => {
//     const matchesType = eventTypeFilter === 'ALL' || log.eventType === eventTypeFilter;
//     const matchesSearch = log.actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                           log.details.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesType && matchesSearch;
//   });

//   return (
//     <div className="p-6 bg-slate-950 text-slate-100 min-h-screen">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//         <div>
//           <h1 className="text-xl font-semibold tracking-tight text-white">System Audit Logs</h1>
//           <p className="text-xs text-slate-400 mt-1">Complete historical record of access requests, approvals, blocks, and violations.</p>
//         </div>
//         <div className="flex items-center gap-3 w-full md:w-auto">
//           <input 
//             type="text" 
//             placeholder="Search actor or details..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-slate-700 w-full md:w-64"
//           />
//           <select 
//             className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-slate-700"
//             value={eventTypeFilter}
//             onChange={(e) => setEventTypeFilter(e.target.value)}
//           >
//             <option value="ALL">All Event Types</option>
//             <option value="REQUEST">Request</option>
//             <option value="APPROVAL">Approval</option>
//             <option value="BLOCK">Block</option>
//             <option value="VIOLATION">Violation</option>
//           </select>
//         </div>
//       </div>

//       <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-900 text-slate-400 text-xs font-medium uppercase tracking-wider border-b border-slate-800">
//                 <th className="p-4">Timestamp</th>
//                 <th className="p-4">Event Type</th>
//                 <th className="p-4">Actor / User</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Event Details</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
//               {filteredLogs.length > 0 ? (
//                 filteredLogs.map(log => (
//                   <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
//                     <td className="p-4 text-slate-400 font-mono">{log.timestamp}</td>
//                     <td className="p-4">
//                       <span className="font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
//                         {log.eventType}
//                       </span>
//                     </td>
//                     <td className="p-4 font-medium text-white">{log.actor}</td>
//                     <td className="p-4">
//                       <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
//                         log.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
//                         log.status === 'BLOCKED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
//                         'bg-amber-500/10 text-amber-400 border border-amber-500/20'
//                       }`}>
//                         {log.status}
//                       </span>
//                     </td>
//                     <td className="p-4 text-slate-300">{log.details}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={5} className="p-12 text-center text-slate-500 text-sm">
//                     No audit records found matching your filters.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { mockAuditLogs } from '../data/mockSecurityData';

export const AuditLogTable: React.FC = () => {
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesType = eventTypeFilter === 'ALL' || log.eventType === eventTypeFilter;
    const matchesSearch = log.actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ background: 'var(--color-bg-card, rgba(255,255,255,0.7))', border: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))', borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--shadow-card, 0 4px 20px rgba(0,0,0,0.04))' }}>
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>System Audit Logs</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Complete historical record of access requests, approvals, blocks, and violations.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search actor or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-default, #cbd5e1)', background: '#fff', fontSize: '0.875rem', width: '260px' }}
          />
          <select 
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-default, #cbd5e1)', background: '#fff', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Event Types</option>
            <option value="REQUEST">Request</option>
            <option value="APPROVAL">Approval</option>
            <option value="BLOCK">Block</option>
            <option value="VIOLATION">Violation</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-subtle, #e2e8f0)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem 1rem' }}>Event Type</th>
              <th style={{ padding: '0.75rem 1rem' }}>Actor / User</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Event Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{log.timestamp}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '4px', fontWeight: 500 }}>
                      {log.eventType}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{log.actor}</td>
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
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No audit records found matching your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};