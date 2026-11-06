import { mockApprovalRequests } from '../data/mockApprovalRequests'
import type { ApprovalRequest } from '../types/approvalRequest'

export const approvalRequestsDataSource = 'development mock data'

export async function listApprovalRequests(): Promise<ApprovalRequest[]> {
  await new Promise((resolve) => window.setTimeout(resolve, 350))
  return mockApprovalRequests.map((request) => ({ ...request }))
}
