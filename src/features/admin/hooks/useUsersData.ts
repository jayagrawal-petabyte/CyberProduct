import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  AdminUserRecord,
  UserFiltersState,
  UserSummaryMetrics,
  DEFAULT_USER_FILTERS,
} from '../types/user.types'
import { MOCK_EMPLOYEE_DIRECTORY } from './mockUsersData'

export interface UseUsersDataResult {
  users: AdminUserRecord[]
  summary: UserSummaryMetrics
  isLoading: boolean
  /** Dev-only indicator label; the dataset is mock data, not a backend feed. */
  lastUpdated: string
  refetch: () => void
}

/**
 * Reusable client-side filtering for the employee directory.
 * Search matches full name, email, or employee ID; the department,
 * role and status filters combine with AND semantics.
 */
export function filterUsers(
  users: AdminUserRecord[],
  filters: UserFiltersState,
): AdminUserRecord[] {
  const q = filters.search.trim().toLowerCase()
  return users.filter((user) => {
    const matchesSearch =
      !q ||
      user.fullName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.employeeId.toLowerCase().includes(q)
    const matchesDepartment =
      filters.department === 'all' || user.department === filters.department
    const matchesRole = filters.role === 'all' || user.role === filters.role
    const matchesStatus = filters.status === 'all' || user.status === filters.status
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus
  })
}

/** Derives directory metrics from the dataset — never hardcoded. */
export function summarizeUsers(users: AdminUserRecord[]): UserSummaryMetrics {
  let active = 0
  let inactive = 0
  let suspended = 0
  for (const u of users) {
    if (u.status === 'active') active += 1
    else if (u.status === 'inactive') inactive += 1
    else suspended += 1
  }
  return { total: users.length, active, inactive, suspended }
}

function timestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
}

/**
 * State hook for the BrainMint admin User Management page.
 *
 * ⚠️ DEVELOPMENT MOCK DATA — serves the mock employee directory with a
 * simulated latency window so loading states can be exercised. This is
 * not a live backend connection.
 */
export function useUsersData(): UseUsersDataResult {
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('—')

  // Simulated initial fetch of the mock dataset.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUsers(MOCK_EMPLOYEE_DIRECTORY)
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    window.setTimeout(() => {
      // Mock "refresh": re-serve the same dataset with a new timestamp.
      setUsers([...MOCK_EMPLOYEE_DIRECTORY])
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 350)
  }, [])

  const summary = useMemo(() => summarizeUsers(users), [users])

  return { users, summary, isLoading, lastUpdated, refetch }
}

export { DEFAULT_USER_FILTERS }
