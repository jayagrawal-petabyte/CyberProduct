# Feature: employee

**Owner:** Aastha Singh
**Route prefix:** `/employee`

## Responsibility

This feature covers the Employee Portal — the self-service interface for
regular employees:

- Viewing personal access status and current permissions
- Submitting new access requests
- Tracking the status of pending requests
- Viewing assigned devices and network compliance status
- Browsing restricted resources/applications

## Boundaries

- Work exclusively inside `src/features/employee/`.
- Use shared UI components from `src/components/ui/` and `src/components/shared/`.
- API calls belong in `src/services/api/` (coordinate file naming with Shivam).
- Register your routes in `src/app/router.tsx` under the `/employee` prefix.
- Do not modify shared components, layouts, or the auth module without
  coordinating with Shivam Kumar.

## Structure (planned)

```
employee/
├── pages/
│   ├── EmployeeDashboardPage.tsx
│   ├── AccessRequestsPage.tsx
│   └── NewAccessRequestPage.tsx
├── components/
├── hooks/
└── types/
```
