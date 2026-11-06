import type { ApprovalRequest } from '../types/approvalRequest'

type MockRow = [
  string, // employeeName
  string, // resourceName
  string, // resourceDescription
  string, // accessLevel
  string, // requestedAt
  ApprovalRequest['status'], // status
  string?, // department
  string?, // role
  string?, // justification
  string?, // duration
]

const rows: MockRow[] = [
  ['Jordan Lee', 'GitHub', 'Engineering organization', 'Read and Write', '2026-10-24T08:42:00Z', 'pending', 'Engineering', 'Software Engineer', 'I need repository access to contribute to the security integration project.', '30 days'],
  ['Maya Chen', 'AWS Console', 'Development environment', 'Read-only', '2026-10-24T08:15:00Z', 'pending', 'Data & Analytics', 'Cloud Data Engineer', 'Need access to test model inference pipelines in development environment.', '14 days'],
  ['Noah Bennett', 'Jira', 'Platform project', 'Project admin', '2026-10-23T16:30:00Z', 'pending', 'Platform Engineering', 'Systems Lead', 'Required to configure project board workflows and issue permissions for team.', '60 days'],
  ['Sofia Reed', 'Confluence', 'Engineering space', 'Editor', '2026-10-23T14:10:00Z', 'pending', 'Engineering', 'Technical Writer', 'Documentation updates for the upcoming Q4 architecture revision.', '90 days'],
  ['Ethan Brooks', 'GitHub', 'Infrastructure repository', 'Read-only', '2026-10-23T11:05:00Z', 'pending', 'DevOps', 'DevOps Specialist', 'Auditing deployment scripts and Terraform manifests.', '30 days'],
  ['Liam Parker', 'Jira', 'Platform project', 'Contributor', '2026-10-31T15:20:00Z', 'approved', 'Platform Engineering', 'Backend Engineer', 'Access required for assigned sprint issues.', '30 days'],
  ['Avery Collins', 'Confluence', 'Product knowledge base', 'Viewer', '2026-10-31T10:35:00Z', 'approved', 'Product Operations', 'Associate Analyst', 'Reading release notes and roadmap specs.', '180 days'],
  ['Riley Hayes', 'AWS Console', 'Production environment', 'Administrator', '2026-10-30T16:45:00Z', 'rejected', 'Infrastructure', 'Junior Engineer', 'Emergency maintenance request.', '7 days'],
  ['Maya Patel', 'GitHub', 'Security repository', 'Write', '2026-10-30T12:00:00Z', 'approved', 'Security Operations', 'Security Engineer', 'Implementing zero-trust access hooks.', '90 days'],
  ['Daniel Brooks', 'AWS Console', 'Analytics environment', 'Read-only', '2026-10-29T10:00:00Z', 'approved', 'Data Science', 'Data Scientist', 'Querying aggregated audit telemetry.', '30 days'],
  ['Aisha Rahman', 'Jira', 'Security project', 'Contributor', '2026-10-29T09:30:00Z', 'approved', 'InfoSec', 'Compliance Analyst', 'Tracking vulnerability remediation tasks.', '60 days'],
  ['Leo Martinez', 'Confluence', 'Operations space', 'Editor', '2026-10-28T14:00:00Z', 'approved', 'Operations', 'Operations Coordinator', 'Updating team runbooks and on-call schedules.', '90 days'],
  ['Priya Nair', 'GitHub', 'Incident response repository', 'Read-only', '2026-10-28T13:45:00Z', 'approved', 'Security Operations', 'SOC Analyst', 'Reference during active drills.', '45 days'],
  ['Owen Wright', 'AWS Console', 'Staging environment', 'Read-only', '2026-10-27T11:00:00Z', 'approved', 'QA Engineering', 'QA Automation Engineer', 'End-to-end integration validation.', '30 days'],
  ['Alex Morgan', 'Jira', 'Operations project', 'Contributor', '2026-10-27T10:15:00Z', 'approved', 'Product Operations', 'Team Lead', 'Managing quarterly roadmap milestones.', '90 days'],
  ['Emma Wilson', 'Confluence', 'Engineering space', 'Viewer', '2026-10-26T15:30:00Z', 'approved', 'Design', 'Product Designer', 'Reviewing component specs.', '60 days'],
  ['Lucas James', 'GitHub', 'Platform repository', 'Write', '2026-10-26T11:45:00Z', 'approved', 'Core Platform', 'Senior Software Engineer', 'Merging core authentication refactor.', '30 days'],
  ['Olivia Stone', 'AWS Console', 'Development environment', 'Read-only', '2026-10-25T16:00:00Z', 'approved', 'Data Platform', 'Data Analyst', 'Developing dashboard queries.', '14 days'],
  ['Zoe Carter', 'Jira', 'Platform project', 'Contributor', '2026-10-25T09:00:00Z', 'approved', 'Platform Engineering', 'Software Engineer', 'Bug triage and fixes.', '30 days'],
  ['Sam Taylor', 'Confluence', 'Product knowledge base', 'Viewer', '2026-10-24T12:15:00Z', 'approved', 'Support', 'Support Specialist', 'Customer issue verification.', '90 days'],
  ['Nina Shah', 'GitHub', 'Security repository', 'Write', '2026-10-24T08:30:00Z', 'approved', 'SecOps', 'Security Architect', 'Reviewing cryptography standards.', '60 days'],
  ['Max Turner', 'AWS Console', 'Staging environment', 'Read-only', '2026-10-23T14:20:00Z', 'approved', 'Platform', 'DevOps Engineer', 'Cluster upgrade verification.', '30 days'],
  ['Aria Lewis', 'Jira', 'Operations project', 'Contributor', '2026-10-23T10:10:00Z', 'approved', 'Operations', 'Business Analyst', 'Process mapping.', '60 days'],
  ['Ben Clark', 'Confluence', 'Engineering space', 'Editor', '2026-10-22T09:45:00Z', 'approved', 'Engineering', 'Tech Lead', 'Documenting API specs.', '180 days'],
  ['Isla Martin', 'AWS Console', 'Production environment', 'Administrator', '2026-10-21T16:30:00Z', 'rejected', 'DevOps', 'Contractor', 'Unplanned maintenance.', '3 days'],
]

const emailFrom = (name: string) => `${name.toLowerCase().replace(/\s+/g, '.')}@cyberproduct.io`

export const initialMockApprovalRequests: ApprovalRequest[] = rows.map(
  ([employeeName, resourceName, resourceDescription, accessLevel, requestedAt, status, department, role, justification, duration], index) => {
    const num = 1048 - index
    return {
      id: `ACP-2026-${num}`,
      employeeName,
      employeeEmail: emailFrom(employeeName),
      department: department ?? 'Engineering',
      role: role ?? 'Software Engineer',
      manager: 'Alex Morgan',
      resourceName,
      resourceDescription: resourceDescription ?? 'Corporate resource',
      accessLevel: accessLevel ?? 'Read-only',
      duration: duration ?? '30 days',
      businessJustification: justification ?? 'Access required for assigned business objectives.',
      requestedAt,
      status,
      mfaStatus: 'Enabled',
      deviceCompliance: 'Compliant',
      policyCheck: 'Passed',
      reviewedBy: status !== 'pending' ? 'Alex Morgan' : undefined,
      reviewedAt: status !== 'pending' ? requestedAt : undefined,
      decisionNotes:
        status === 'approved'
          ? 'Access required for the assigned project.'
          : status === 'rejected'
            ? 'Requested permissions exceeded the stated business need.'
            : undefined,
    }
  },
)

// Active in-memory store so changes persist across the session
export let mockApprovalRequests: ApprovalRequest[] = [...initialMockApprovalRequests]

export function setMockApprovalRequests(requests: ApprovalRequest[]) {
  mockApprovalRequests = requests
}
