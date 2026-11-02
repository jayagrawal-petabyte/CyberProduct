# Feature: auth

**Owner:** Shivam Kumar (Frontend Lead)
**Route prefix:** `/login`, `/forgot-password`

## Responsibility

This feature covers all authentication-related UI:

- Login page (email + password, form validation, error states)
- Forgot-password / reset-password flow
- Authentication context and session management (React Context)
- Route protection guard (`ProtectedRoute`)

## Boundaries

- **Do not** implement backend authentication logic here.
- **Do not** store tokens in ways that violate the agreed security policy.
- API calls for auth live in `src/services/api/auth.ts`.
- Only Shivam Kumar or designated reviewers should modify this folder.

## Structure (planned)

```
auth/
├── pages/
│   ├── LoginPage.tsx
│   └── ForgotPasswordPage.tsx
├── components/
│   └── LoginForm.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
└── types/
    └── auth.types.ts
```
