import type { UserRole } from '../../auth/types/auth.types';

export type ProfileTab = 'personal' | 'security' | 'preferences';

export interface RoleProfileConfig {
  role: UserRole;
  roleLabel: string;
  subtitle: string;
  defaultName: string;
  defaultEmail: string;
  defaultEmployeeId: string;
  department: string;
  reportsTo: string;
  accessScope: string;
  device: string;
  signedInAt: string;
  networkStatus: string;
  passwordLastChanged: string;
  mfaDetails: string;
  recoveryEmailStatus: string;
  defaultLocation: string;
  defaultWorkPhone: string;
  joinedDate: string;
  criticalAlertsLabel: string;
}

export interface SavedProfileSnapshot {
  fullName: string;
  location: string;
  workPhone: string;
  inAppNotifications: boolean;
  emailSummaries: boolean;
  criticalAlerts: boolean;
  avatarUrl: string | null;
}
