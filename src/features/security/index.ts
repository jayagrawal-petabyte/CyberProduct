/**
 * BrainMint Security Module — Barrel Export
 * CyberProduct Platform
 */

export { SecurityProfilePage, default as SecurityProfile } from './pages/SecurityProfilePage';
export { SecurityDashboardPage } from './pages/SecurityDashboardPage';
export * from './types/security.types';
export { AlertsTable } from './components/AlertsTable';
export { AuditLogTable } from './components/AuditLogTable';
export { SecurityAlertsPage } from './pages/SecurityAlertsPage';
export { SecurityAuditLogsPage } from './pages/SecurityAuditLogsPage';
export { EmployeeAccessActivityPage } from './pages/EmployeeAccessActivityPage';
export { SecurityBottomNav } from './components/SecurityBottomNav';
export { SecurityLayout } from './components/SecurityLayout';
// AlertDetailsModal — pending implementation (empty stub, not exported until complete)
