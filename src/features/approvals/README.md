# Feature: approvals

**Owner:** Harsh Gupta
**Route prefix:** `/approvals`

## Responsibility

This feature covers the Lead / Manager Approval Workspace:

- Approval inbox — pending access requests needing a decision
- Approval detail view — full request context, risk score, device compliance,
  network context, justification
- Approve / Reject actions with optional comments
- Grant history and audit trail for previous decisions

## Boundaries

- Work exclusively inside `src/features/approvals/`.
- Use shared UI components from `src/components/ui/` and `src/components/shared/`.
- API calls belong in `src/services/api/` (coordinate file naming with Shivam).
- Register your routes in `src/app/router.tsx` under the `/approvals` prefix.
- Do not modify shared components, layouts, or the auth module without
  coordinating with Shivam Kumar.

## Structure (planned)

```
approvals/
├── pages/
│   ├── ApprovalsInboxPage.tsx
│   ├── ApprovalDetailPage.tsx
│   └── GrantsPage.tsx
├── components/
│   └── ApprovalCard.tsx
├── hooks/
└── types/
```
