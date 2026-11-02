# CyberProduct — Frontend

> Cybersecurity Access Control & Monitoring Platform

This is the React + Vite + TypeScript frontend for CyberProduct, a platform that manages employee access to company resources, device and network compliance, security alerts, policies, and audit logs.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Language | TypeScript 5 |
| Routing | React Router v6 |
| Linting | ESLint 9 + typescript-eslint |

---

## Team Ownership

| Feature area | Folder | Owner |
|---|---|---|
| Auth, shell, routing, shared UI | `src/features/auth/`, `src/app/`, `src/components/` | **Shivam Kumar** (Lead) |
| Employee Portal | `src/features/employee/` | **Aastha Singh** |
| Lead / Manager Approvals | `src/features/approvals/` | **Harsh Gupta** |
| Admin Dashboard & Policies | `src/features/admin/` | **Ishaan Gupta** |
| Alerts & Audit Center | `src/features/security/` | **Aarushi Srivastava** |

Each feature folder contains its own `README.md` with ownership boundaries and planned structure.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later (or use the Node version bundled with your team's toolchain)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jayagrawal-petabyte/CyberProduct.git
cd CyberProduct

# 2. Switch to the Frontend branch
git checkout Frontend

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to the backend address
```

### Development

```bash
npm run dev
# App runs at http://localhost:5173
# API requests to /api/* are proxied to VITE_API_BASE_URL
```

### Build

```bash
npm run build
# Output goes to ./dist/
```

### Preview production build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Type checking

```bash
npm run type-check
```

---

## Project Structure

```
CyberProduct/
├── public/
│   └── assets/               Static assets served at root URL
├── src/
│   ├── app/
│   │   ├── App.tsx           Root component — mounts providers + router
│   │   ├── router.tsx        Route definitions — register new routes here
│   │   └── providers/        Global React context providers
│   ├── assets/
│   │   ├── images/           Raster images
│   │   ├── icons/            SVG icon files (if not using an icon library)
│   │   └── fonts/            Custom font files
│   ├── components/
│   │   ├── ui/               Design-system primitives (Button, Input, Modal, …)
│   │   └── shared/           Higher-level shared components (DataTable, Sidebar, …)
│   ├── layouts/              Page layout wrappers (AppShell, AuthLayout, …)
│   ├── features/
│   │   ├── auth/             Authentication UI — owner: Shivam Kumar
│   │   ├── employee/         Employee Portal — owner: Aastha Singh
│   │   ├── approvals/        Approvals Workspace — owner: Harsh Gupta
│   │   ├── admin/            Admin Dashboard & Policies — owner: Ishaan Gupta
│   │   └── security/         Alerts & Audit Center — owner: Aarushi Srivastava
│   ├── hooks/                Shared custom React hooks
│   ├── services/
│   │   └── api/              Centralised API client and endpoint modules
│   ├── types/                Shared TypeScript interfaces and types
│   ├── utils/                Pure utility functions (formatting, validation, …)
│   ├── constants/            App-wide constant values
│   ├── styles/               Global CSS and design tokens
│   └── main.tsx              Application entry point
├── .env.example              Environment variable template
├── .gitignore
├── index.html                Vite HTML entry point
├── package.json
├── tsconfig.json             TypeScript project references root
├── tsconfig.app.json         TypeScript config for src/
├── tsconfig.node.json        TypeScript config for vite.config.ts
├── eslint.config.js          ESLint flat config
└── README.md                 This file
```

---

## How to Add a New Page (for team members)

1. **Create your page component** inside your feature folder:
   ```
   src/features/<your-feature>/pages/YourPage.tsx
   ```

2. **Register the route** in `src/app/router.tsx` under your prefix. Do not add routes outside your designated prefix without coordinating with Shivam Kumar.

3. **Use shared components** from `src/components/ui/` and `src/components/shared/`. Do not create a duplicate component if one already exists.

4. **Add API calls** to `src/services/api/` — create a new file for your domain (e.g., `accessRequests.ts`). Coordinate the API client configuration with Shivam.

5. **Do not modify** `src/app/App.tsx`, `src/app/router.tsx` shared provider configuration, or another team member's feature folder without prior coordination.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for the backend REST API | `http://localhost:8000` |

All variables prefixed with `VITE_` are inlined at build time. Do not prefix sensitive server-side secrets with `VITE_`.

---

## Git Workflow

- **Branch:** `Frontend`
- **Never commit** `.env` or files containing real credentials.
- **Never push** directly to `main`.
- **Coordinate** with Shivam Kumar before modifying shared infrastructure files.
- Commit message format: `<type>: <short description>` (e.g., `feat: add employee access request form`)
