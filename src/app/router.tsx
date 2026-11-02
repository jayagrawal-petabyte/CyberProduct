import { createBrowserRouter, Navigate } from 'react-router-dom'
import PlaceholderPage from './PlaceholderPage'

/**
 * Application router.
 *
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * HOW TO REGISTER A NEW ROUTE (for team members):
 * ─────────────────────────────────────────────────
 * 1. Create your page component inside your feature folder:
 *      src/features/<your-feature>/pages/YourPage.tsx
 *
 * 2. Import it lazily here and add it under the appropriate section.
 *    Example:
 *      const YourPage = lazy(() => import('../features/<your-feature>/pages/YourPage'))
 *
 * 3. Add the route object to the children array of the layout route.
 *
 * 4. Do not modify the root layout, auth guard, or shared route config
 *    without coordinating with Shivam Kumar.
 *
 * NOTE: Layout components and authentication guards will be added in the
 * next phase once the shared layout and auth modules are implemented.
 */

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────
  {
    path: '/login',
    element: <PlaceholderPage title="Login — Auth (Shivam Kumar)" />,
  },

  // ── Protected application shell ────────────────────────────────────────
  // TODO (Shivam): Replace element with <AppShell /> once the layout and
  //               auth guard are implemented.
  {
    path: '/',
    element: <PlaceholderPage title="App Shell — coming soon" />,
    children: [
      // Default redirect
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // ── Dashboard ── owner: Ishaan Gupta ─────────────────────────────
      {
        path: 'dashboard',
        element: <PlaceholderPage title="Dashboard (Ishaan Gupta)" />,
      },

      // ── Employee portal ── owner: Aastha Singh ──────────────────────
      {
        path: 'employee',
        children: [
          {
            index: true,
            element: <PlaceholderPage title="Employee Portal (Aastha Singh)" />,
          },
          {
            path: 'access-requests',
            element: (
              <PlaceholderPage title="Access Requests (Aastha Singh)" />
            ),
          },
          {
            path: 'access-requests/new',
            element: (
              <PlaceholderPage title="New Access Request (Aastha Singh)" />
            ),
          },
          {
            path: 'my-devices',
            element: <PlaceholderPage title="My Devices (Aastha Singh)" />,
          },
        ],
      },

      // ── Approvals workspace ── owner: Harsh Gupta ───────────────────
      {
        path: 'approvals',
        children: [
          {
            index: true,
            element: (
              <PlaceholderPage title="Approvals Inbox (Harsh Gupta)" />
            ),
          },
          {
            path: 'grants',
            element: <PlaceholderPage title="Approval Grants (Harsh Gupta)" />,
          },
          {
            path: ':id',
            element: (
              <PlaceholderPage title="Approval Detail (Harsh Gupta)" />
            ),
          },
        ],
      },

      // ── Admin area ── owner: Ishaan Gupta ───────────────────────────
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: <PlaceholderPage title="Admin Dashboard (Ishaan Gupta)" />,
          },
          {
            path: 'users',
            element: <PlaceholderPage title="User Management (Ishaan Gupta)" />,
          },
          {
            path: 'devices',
            element: (
              <PlaceholderPage title="Device Management (Ishaan Gupta)" />
            ),
          },
          {
            path: 'resources',
            element: (
              <PlaceholderPage title="Resource Management (Ishaan Gupta)" />
            ),
          },
          {
            path: 'policies',
            element: (
              <PlaceholderPage title="Policy Management (Ishaan Gupta)" />
            ),
          },
        ],
      },

      // ── Security & audit ── owner: Aarushi Srivastava ───────────────
      {
        path: 'security',
        children: [
          {
            index: true,
            element: (
              <PlaceholderPage title="Security Events (Aarushi Srivastava)" />
            ),
          },
          {
            path: 'alerts',
            element: (
              <PlaceholderPage title="Alerts Center (Aarushi Srivastava)" />
            ),
          },
          {
            path: 'audit-logs',
            element: (
              <PlaceholderPage title="Audit Logs (Aarushi Srivastava)" />
            ),
          },
        ],
      },
    ],
  },

  // ── Catch-all 404 ──────────────────────────────────────────────────────
  {
    path: '*',
    element: <PlaceholderPage title="404 — Page Not Found" />,
  },
])
