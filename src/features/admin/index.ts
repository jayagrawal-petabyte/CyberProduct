/**
 * Admin Feature Barrel Export
 * Scope: src/features/admin/index.ts
 */

export { DashboardPage, default as Dashboard } from "./pages/DashboardPage";
export * from "./types/admin.types";
export * from "./types/user.types";
export { useDashboardData } from "./hooks/useDashboardData";

export { default as UsersPage } from "./pages/UsersPage";
export { default as DevicesPage } from "./pages/DevicesPage";

export { default as UsersTable } from "./components/UsersTable";
export { default as UserDetailsModal } from "./components/UserDetailsModal";
export { default as UserFilters } from "./components/UserFilters";

export { default as DevicesTable } from "./components/DevicesTable";
export { default as DeviceDetailsModal } from "./components/DeviceDetailsModal";
export { default as DeviceFilters } from "./components/DeviceFilters";

export { default as ResourcesPage } from "./pages/ResourcesPage";
export { default as ResourcesTable } from "./components/ResourcesTable";
export { default as ResourceDetailsModal } from "./components/ResourceDetailsModal";
export { default as ResourceFilters } from "./components/ResourceFilters";

export {
  useUsersData,
  filterUsers,
  summarizeUsers,
} from "./hooks/useUsersData";

export {
  useDevicesData,
  filterDevices,
  summarizeDevices,
} from "./hooks/useDevicesData";

export {
  useResourcesData,
  filterResources,
  summarizeResources,
} from "./hooks/useResourcesData";
