# Feature: admin

**Owner:** Ishaan Gupta
**Route prefix:** `/admin`, `/dashboard`

## Responsibility

This feature covers the Admin Dashboard and Policy Management:

- System-wide dashboard with KPI metrics and activity overviews
- User management — directory, roles, status
- Device management — compliance status, inventory
- Resource management — categories, permissions, access rules
- Policy management — policy builder, rule editor, enforcement config
- Access Engine configuration

## Boundaries

- Work exclusively inside `src/features/admin/`.
- Use shared UI components from `src/components/ui/` and `src/components/shared/`.
- API calls belong in `src/services/api/` (coordinate file naming with Shivam).
- Register your routes in `src/app/router.tsx` under the `/admin` and `/dashboard`
  prefixes.
- Do not modify shared components, layouts, or the auth module without
  coordinating with Shivam Kumar.

## Structure (planned)

```
admin/
├── pages/
│   ├── DashboardPage.tsx
│   ├── UsersPage.tsx
│   ├── DevicesPage.tsx
│   ├── ResourcesPage.tsx
│   └── PoliciesPage.tsx
├── components/
├── hooks/
└── types/
```
