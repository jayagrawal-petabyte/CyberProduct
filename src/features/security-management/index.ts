/**
 * Security Management Feature — Barrel Export
 * Scope: src/features/security-management/index.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Covers the Security Policies, Restricted Resources, Network Compliance
 * and Device Management screens.
 */

// Pages
export { default as SecurityPoliciesPage } from './pages/SecurityPoliciesPage';
export { default as RestrictedResourcesPage } from './pages/RestrictedResourcesPage';
export { default as NetworkCompliancePage } from './pages/NetworkCompliancePage';
export { default as DeviceManagementPage } from './pages/DeviceManagementPage';
export { default as SecurityUsersPage } from './pages/SecurityUsersPage';

// Components
export { default as PoliciesTable } from './components/PoliciesTable';
export { PolicyStateIndicator, PolicyStatePill } from './components/PoliciesTable';
export { default as PolicyFilters } from './components/PolicyFilters';
export { default as PolicyDetailsModal } from './components/PolicyDetailsModal';
export { default as PolicyFormModal } from './components/PolicyFormModal';
export { default as RestrictedResourcesTable } from './components/RestrictedResourcesTable';
export { AccessBadge, ResourceStatusIndicator, ResourceStatusPill } from './components/RestrictedResourcesTable';
export { default as RestrictedResourceFilters } from './components/RestrictedResourceFilters';
export { default as RestrictedResourceDetailsModal } from './components/RestrictedResourceDetailsModal';
export { default as RestrictedResourceFormModal } from './components/RestrictedResourceFormModal';
export { default as NetworkZonesTable } from './components/NetworkZonesTable';
export { ZoneStatusIndicator } from './components/NetworkZonesTable';
export { default as NetworkZoneFilters } from './components/NetworkZoneFilters';
export { default as ControlHealthPanel } from './components/ControlHealthPanel';
export { default as RecentEnforcementPanel } from './components/RecentEnforcementPanel';
export { default as SecurityDevicesTable } from './components/SecurityDevicesTable';
export { DevicePostureIndicator, DevicePosturePill } from './components/SecurityDevicesTable';
export { default as DevicePostureTabs } from './components/DevicePostureTabs';
export { default as SecurityDeviceFilters } from './components/SecurityDeviceFilters';
export { default as SecurityDeviceDetailsModal } from './components/SecurityDeviceDetailsModal';
export { default as SecurityUsersTable } from './components/SecurityUsersTable';
export { SecurityRoleBadge, SecurityStatusIndicator } from './components/SecurityUsersTable';
export { default as SecurityUserStatusTabs } from './components/SecurityUserStatusTabs';
export { default as SecurityUserFilters } from './components/SecurityUserFilters';
export { default as SecurityUserDetailsModal } from './components/SecurityUserDetailsModal';
export { default as InviteUserModal } from './components/InviteUserModal';
export { default as ManageUserModal } from './components/ManageUserModal';

// Hooks
export {
  useSecurityPolicies,
  filterPolicies,
  sortPolicies,
  summarizePolicies,
} from './hooks/useSecurityPolicies';
export {
  useRestrictedResources,
  filterRestrictedResources,
} from './hooks/useRestrictedResources';
export {
  useNetworkCompliance,
  filterNetworkZones,
  summarizeNetworkCompliance,
} from './hooks/useNetworkCompliance';
export {
  useSecurityDevices,
  filterSecurityDevices,
  summarizeSecurityDevices,
} from './hooks/useSecurityDevices';
export {
  useSecurityUsers,
  filterSecurityUsers,
  summarizeSecurityUsers,
} from './hooks/useSecurityUsers';

// Types
export type {
  SecurityPolicyRecord,
  PolicyFormValues,
  PolicyCreateDraft,
  PolicyFiltersState,
  PolicySummaryMetrics,
  PolicyState,
  EnforcementMode,
  PolicyCategory,
} from './types/policy.types';
export {
  POLICY_STATE_LABELS,
  POLICY_ENFORCEMENT_LABELS,
  DEFAULT_POLICY_FILTERS,
} from './types/policy.types';

// Types (Restricted Resources)
export type {
  AdminResourceRecord,
  ResourceCategory,
  ResourceAccessLevel,
  ResourceStatus,
  ResourceType,
  RestrictedResourceFormValues,
  RestrictedResourceFiltersState,
  RestrictedResourceSummary,
} from './types/restrictedResource.types';
export {
  RESOURCE_ACCESS_LABELS,
  RESOURCE_STATUS_LABELS,
  DEFAULT_RESTRICTED_RESOURCE_FILTERS,
} from './types/restrictedResource.types';

// Types (Network Compliance)
export type {
  NetworkZoneRecord,
  NetworkZoneStatus,
  NetworkZoneKind,
  NetworkControlRecord,
  ControlState,
  EnforcementEventRecord,
  EnforcementSeverity,
  NetworkZoneFiltersState,
  ComplianceSummary,
} from './types/networkCompliance.types';
export {
  NETWORK_ZONE_STATUS_LABELS,
  NETWORK_ZONE_KIND_LABELS,
  CONTROL_STATE_LABELS,
  DEFAULT_NETWORK_ZONE_FILTERS,
} from './types/networkCompliance.types';

// Types (Device Management)
export type {
  DeviceOs,
  DeviceType,
  DevicePosture,
  SecurityDeviceRecord,
  SecurityDeviceFiltersState,
  SecurityDeviceSummary,
} from './types/securityDevice.types';
export {
  DEVICE_POSTURE_LABELS,
  DEFAULT_SECURITY_DEVICE_FILTERS,
} from './types/securityDevice.types';

// Types (Security User Management)
export type {
  SecurityUserRole,
  SecurityUserStatus,
  SecurityUserRecord,
  SecurityUserSummaryMetrics,
  SecurityUserTabFilter,
  SecurityUserFiltersState,
  InviteUserFormValues,
  ManageUserFormValues,
} from './types/securityUser.types';
export {
  DEFAULT_SECURITY_USER_FILTERS,
} from './types/securityUser.types';

