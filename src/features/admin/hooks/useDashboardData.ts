import { useState, useCallback } from 'react'
import { AdminDashboardState } from '../types/admin.types'
import { MOCK_ADMIN_DASHBOARD_DATA } from './mockDashboardData'

interface UseDashboardDataResult {
  data: AdminDashboardState | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Custom hook to manage BrainMint Security Admin Dashboard state.
 */
export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<AdminDashboardState>(MOCK_ADMIN_DASHBOARD_DATA)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error] = useState<string | null>(null)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
      }))
      setIsLoading(false)
    }, 350)
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch,
  }
}
