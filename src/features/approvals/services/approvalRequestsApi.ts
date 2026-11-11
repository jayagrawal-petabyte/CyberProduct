import {
  mockApprovalHistory,
  mockApprovalRequests,
  setMockApprovalHistory,
  setMockApprovalRequests,
} from '../data/mockApprovalRequests'
import type { ApprovalRequest } from '../types/approvalRequest'

export const approvalRequestsDataSource = 'development mock data'

export async function listApprovalRequests(): Promise<ApprovalRequest[]> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))
  return mockApprovalRequests.map((request) => ({ ...request }))
}

export async function listApprovalHistory(): Promise<ApprovalRequest[]> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))
  return mockApprovalHistory.map((request) => ({ ...request }))
}

export async function getApprovalRequestById(id: string): Promise<ApprovalRequest | null> {
  await new Promise((resolve) => window.setTimeout(resolve, 120))
  const cleanId = decodeURIComponent(id).trim().toLowerCase()
  let found = mockApprovalRequests.find((req) => {
    const reqId = req.id.toLowerCase()
    if (reqId === cleanId) return true
    if (cleanId === 'acp-2026-1048' && reqId === 'ar-2048') return true
    const num = cleanId.replace(/^[a-z0-9]+-(?:2026-)?/i, '')
    return reqId.endsWith(num)
  })
  if (!found) {
    found = mockApprovalHistory.find((req) => req.id.toLowerCase() === cleanId)
  }
  return found ? { ...found } : null
}

export async function updateApprovalDecision(
  id: string,
  decision: 'approved' | 'rejected',
  decisionNotes?: string,
): Promise<ApprovalRequest> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))
  const cleanId = decodeURIComponent(id).trim().toLowerCase()
  const index = mockApprovalRequests.findIndex((req) => {
    const reqId = req.id.toLowerCase()
    if (reqId === cleanId) return true
    const num = cleanId.replace(/^[a-z0-9]+-(?:2026-)?/i, '')
    return reqId.endsWith(num)
  })

  if (index === -1) {
    throw new Error(`Request ${id} not found`)
  }

  const updated: ApprovalRequest = {
    ...mockApprovalRequests[index],
    status: decision,
    reviewedBy: 'Alex Morgan',
    reviewedAt: new Date().toISOString(),
    decisionNotes: decisionNotes || (decision === 'approved' ? 'Access approved.' : 'Access rejected.'),
  }

  const newRequests = [...mockApprovalRequests]
  newRequests[index] = updated
  setMockApprovalRequests(newRequests)

  // Prepend to history so it appears in Approval History immediately
  setMockApprovalHistory([updated, ...mockApprovalHistory.filter((h) => h.id !== updated.id)])

  return { ...updated }
}
