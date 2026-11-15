import type { ApprovalFilters, ApprovalRequest } from '../types/approvalRequest'

export interface ApprovalStatusCounts {
  pending: number
  approved: number
  rejected: number
}

export function getStatusCounts(requests: ApprovalRequest[]): ApprovalStatusCounts {
  return requests.reduce<ApprovalStatusCounts>((counts, request) => {
    const status = request.status.trim().toLowerCase()
    if (status === 'pending') counts.pending += 1
    if (status === 'approved') counts.approved += 1
    if (status === 'rejected') counts.rejected += 1
    return counts
  }, { pending: 0, approved: 0, rejected: 0 })
}

export function getStatusLabel(status: string): string {
  return status.trim().split(/[-_\s]+/).filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`).join(' ') || 'Unknown'
}

export function filterApprovalRequests(
  requests: ApprovalRequest[],
  filters: ApprovalFilters,
  now = new Date(),
): ApprovalRequest[] {
  const search = filters.search.trim().toLowerCase()
  const resource = filters.resource.trim().toLowerCase()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const dateCutoff = getDateCutoff(filters.dateRange, today)

  return requests.filter((request) => {
    const haystack = `${request.employeeName} ${request.resourceName}`.toLowerCase()
    const status = request.status.trim().toLowerCase()
    const requestDate = new Date(request.requestedAt)
    const matchesSearch = !search || haystack.includes(search)
    const matchesStatus = filters.status === 'all' || status === filters.status
    const matchesResource = !resource || request.resourceName.trim().toLowerCase() === resource
    const matchesDate = !dateCutoff || (requestDate >= dateCutoff && requestDate < tomorrow)
    return matchesSearch && matchesStatus && matchesResource && matchesDate
  })
}

function getDateCutoff(range: ApprovalFilters['dateRange'], today: Date): Date | null {
  if (range === 'today') return today
  if (range === 'last-7-days') return new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
  if (range === 'last-30-days') return new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)
  return null
}
