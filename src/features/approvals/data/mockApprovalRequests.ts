import type { ApprovalRequest } from '../types/approvalRequest'

type MockRow = [string, string, string, string, string, ApprovalRequest['status']]

const rows: MockRow[] = [
  ['Jordan Ellis', 'GitHub', 'Engineering organization', 'Write', '2026-11-02T08:42:00Z', 'pending'],
  ['Maya Chen', 'AWS Console', 'Development environment', 'Read-only', '2026-11-02T08:15:00Z', 'pending'],
  ['Noah Bennett', 'Jira', 'Platform project', 'Project admin', '2026-11-01T16:30:00Z', 'pending'],
  ['Sofia Reed', 'Confluence', 'Engineering space', 'Editor', '2026-11-01T14:10:00Z', 'pending'],
  ['Ethan Brooks', 'GitHub', 'Infrastructure repository', 'Read-only', '2026-11-01T11:05:00Z', 'pending'],
  ['Liam Parker', 'Jira', 'Platform project', 'Contributor', '2026-10-31T15:20:00Z', 'approved'],
  ['Avery Collins', 'Confluence', 'Product knowledge base', 'Viewer', '2026-10-31T10:35:00Z', 'approved'],
  ['Riley Hayes', 'AWS Console', 'Production environment', 'Administrator', '2026-10-30T16:45:00Z', 'rejected'],
  ['Maya Patel', 'GitHub', 'Security repository', 'Write', '2026-10-30T12:00:00Z', 'approved'],
  ['Daniel Brooks', 'AWS Console', 'Analytics environment', 'Read-only', '2026-10-29T10:00:00Z', 'approved'],
  ['Aisha Rahman', 'Jira', 'Security project', 'Contributor', '2026-10-29T09:30:00Z', 'approved'],
  ['Leo Martinez', 'Confluence', 'Operations space', 'Editor', '2026-10-28T14:00:00Z', 'approved'],
  ['Priya Nair', 'GitHub', 'Incident response repository', 'Read-only', '2026-10-28T13:45:00Z', 'approved'],
  ['Owen Wright', 'AWS Console', 'Staging environment', 'Read-only', '2026-10-27T11:00:00Z', 'approved'],
  ['Alex Morgan', 'Jira', 'Operations project', 'Contributor', '2026-10-27T10:15:00Z', 'approved'],
  ['Emma Wilson', 'Confluence', 'Engineering space', 'Viewer', '2026-10-26T15:30:00Z', 'approved'],
  ['Lucas James', 'GitHub', 'Platform repository', 'Write', '2026-10-26T11:45:00Z', 'approved'],
  ['Olivia Stone', 'AWS Console', 'Development environment', 'Read-only', '2026-10-25T16:00:00Z', 'approved'],
  ['Zoe Carter', 'Jira', 'Platform project', 'Contributor', '2026-10-25T09:00:00Z', 'approved'],
  ['Sam Taylor', 'Confluence', 'Product knowledge base', 'Viewer', '2026-10-24T12:15:00Z', 'approved'],
  ['Nina Shah', 'GitHub', 'Security repository', 'Write', '2026-10-24T08:30:00Z', 'approved'],
  ['Max Turner', 'AWS Console', 'Staging environment', 'Read-only', '2026-10-23T14:20:00Z', 'approved'],
  ['Aria Lewis', 'Jira', 'Operations project', 'Contributor', '2026-10-23T10:10:00Z', 'approved'],
  ['Ben Clark', 'Confluence', 'Engineering space', 'Editor', '2026-10-22T09:45:00Z', 'approved'],
  ['Isla Martin', 'AWS Console', 'Production environment', 'Administrator', '2026-10-21T16:30:00Z', 'rejected'],
]

export const mockApprovalRequests: ApprovalRequest[] = rows.map(
  ([employeeName, resourceName, resourceDescription, accessLevel, requestedAt, status], index) => ({
    id: `REQ-${1048 - index}`,
    employeeName,
    resourceName,
    resourceDescription,
    accessLevel,
    requestedAt,
    status,
  }),
)
