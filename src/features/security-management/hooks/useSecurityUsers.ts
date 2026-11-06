/**
 * BrainMint — Security Users Data Hook
 * Scope: src/features/security-management/hooks/useSecurityUsers.ts
 * Owner: Ishaan Gupta (Security Management module)
 *
 * ⚠️ DEVELOPMENT MOCK DATA — provides access to the mock workforce identities dataset
 * with simulated loading latency. Adapts Admin user filtering and metrics calculation
 * to match the exact Security User Management specification.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SecurityUserRecord,
  SecurityUserRole,
  SecurityUserSummaryMetrics,
  SecurityUserFiltersState,
  DEFAULT_SECURITY_USER_FILTERS,
  InviteUserFormValues,
  ManageUserFormValues,
} from '../types/securityUser.types'
import { MOCK_SECURITY_USERS, SECURITY_USER_DEPARTMENTS, SECURITY_USER_ROLES } from '../data/mockSecurityUsers'

export interface UseSecurityUsersResult {
  users: SecurityUserRecord[]
  summary: SecurityUserSummaryMetrics
  isLoading: boolean
  lastUpdated: string
  refetch: () => void
  departments: string[]
  roles: SecurityUserRole[]
  inviteUser: (values: InviteUserFormValues) => SecurityUserRecord
  updateUser: (id: string, values: ManageUserFormValues) => SecurityUserRecord
}

/**
 * Filter users based on search (name, email, employee ID), status tab, role dropdown, and department.
 */
export function filterSecurityUsers(
  users: SecurityUserRecord[],
  filters: SecurityUserFiltersState,
): SecurityUserRecord[] {
  const query = filters.search.trim().toLowerCase()

  return users.filter((user) => {
    // Status tab filter:
    // When 'all', show provisioned users (active + suspended).
    // When 'active', show status === 'active'.
    // When 'suspended', show status === 'suspended'.
    // When 'invited', show status === 'invited'.
    if (filters.status === 'all') {
      if (user.status === 'invited') return false // Invitations live in their dedicated tab
    } else {
      if (user.status !== filters.status) return false
    }

    // Role filter
    if (filters.role !== 'all' && user.role !== filters.role) {
      return false
    }

    // Department filter
    if (filters.department !== 'all' && user.department !== filters.department) {
      return false
    }

    // Search query
    if (query) {
      const matchName = user.fullName.toLowerCase().includes(query)
      const matchEmail = user.email.toLowerCase().includes(query)
      const matchId = user.employeeId.toLowerCase().includes(query)
      if (!matchName && !matchEmail && !matchId) {
        return false
      }
    }

    return true
  })
}

/**
 * Derives directory metrics strictly from the complete dataset.
 * Reconciles:
 * - total: active + suspended (256)
 * - employees: active employees (226)
 * - teamLeads: active team leads (18)
 * - securityAdmins: active security administrators (4)
 * - active: 248
 * - suspended: 8
 * - invitations: 3
 */
export function summarizeSecurityUsers(users: SecurityUserRecord[]): SecurityUserSummaryMetrics {
  let active = 0
  let suspended = 0
  let invitations = 0

  let employees = 0
  let teamLeads = 0
  let securityAdmins = 0

  for (const user of users) {
    if (user.status === 'active') {
      active++
      if (user.role === 'Employee') employees++
      else if (user.role === 'Team Lead') teamLeads++
      else if (user.role === 'Security Administrator') securityAdmins++
    } else if (user.status === 'suspended') {
      suspended++
    } else if (user.status === 'invited') {
      invitations++
    }
  }

  return {
    total: active + suspended,
    employees,
    teamLeads,
    securityAdmins,
    active,
    suspended,
    invitations,
  }
}

function timestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
}

let localUserSeq = 500

export function useSecurityUsers(): UseSecurityUsersResult {
  const [users, setUsers] = useState<SecurityUserRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('—')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUsers([...MOCK_SECURITY_USERS])
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    window.setTimeout(() => {
      setUsers([...MOCK_SECURITY_USERS])
      setLastUpdated(timestamp())
      setIsLoading(false)
    }, 250)
  }, [])

  const inviteUser = useCallback((values: InviteUserFormValues): SecurityUserRecord => {
    localUserSeq++
    const newRecord: SecurityUserRecord = {
      id: `usr-sec-local-${localUserSeq}`,
      employeeId: `ACM-INV-${localUserSeq}`,
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      department: values.department,
      role: values.role,
      status: 'invited',
      lastActive: 'Invitation sent just now',
      accountCreated: 'Today',
      designation: `${values.department} Associate`,
      mfaEnabled: false,
      deviceCount: 0,
      securityClearance: values.role === 'Security Administrator' ? 'Admin' : values.role === 'Team Lead' ? 'Elevated' : 'Standard',
    }

    setUsers((prev) => [newRecord, ...prev])
    return newRecord
  }, [])

  const updateUser = useCallback((id: string, values: ManageUserFormValues): SecurityUserRecord => {
    let updatedRecord: SecurityUserRecord | null = null

    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          updatedRecord = {
            ...user,
            fullName: values.fullName.trim(),
            email: values.email.trim().toLowerCase(),
            department: values.department,
            role: values.role,
            status: values.status,
            securityClearance: values.role === 'Security Administrator' ? 'Admin' : values.role === 'Team Lead' ? 'Elevated' : 'Standard',
          }
          return updatedRecord
        }
        return user
      }),
    )

    return updatedRecord!
  }, [])

  const summary = useMemo(() => summarizeSecurityUsers(users), [users])

  return {
    users,
    summary,
    isLoading,
    lastUpdated,
    refetch,
    departments: SECURITY_USER_DEPARTMENTS,
    roles: SECURITY_USER_ROLES,
    inviteUser,
    updateUser,
  }
}

export { DEFAULT_SECURITY_USER_FILTERS }
