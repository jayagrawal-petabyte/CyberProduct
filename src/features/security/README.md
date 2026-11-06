# Feature: security

**Owner:** Aarushi Srivastava
**Route prefix:** `/security`

## Responsibility

This feature covers the Alerts and Audit Center:

- Real-time security event feed with severity filtering
- Alert detail view with JSON payload inspection
- Audit log browser — tamper-evident log of all system actions
- Export and reporting for compliance purposes

## Boundaries

- Work exclusively inside `src/features/security/`.
- Use shared UI components from `src/components/ui/` and `src/components/shared/`.
- API calls belong in `src/services/api/` (coordinate file naming with Shivam).
- Register your routes in `src/app/router.tsx` under the `/security` prefix.
- Do not modify shared components, layouts, or the auth module without
  coordinating with Shivam Kumar.

## Structure (planned)

```
security/
├── pages/
│   ├── SecurityEventsPage.tsx
│   ├── AlertsPage.tsx
│   └── AuditLogsPage.tsx
├── components/
│   ├── EventFeed.tsx
│   └── AuditLogRow.tsx
├── hooks/
└── types/
```
