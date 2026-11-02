# CyberProduct — Frontend Architecture & Developer Guidelines
**Design System:** BrainMint  
**Frontend Developer Lead:** Shivam Kumar  
**Branch:** `Frontend`

---

## 1. Overview & Visual Language

CyberProduct uses the **BrainMint design system** approved in Figma. Unlike standard dark cybersecurity dashboards, the approved aesthetic features:
- **Surfaces & Background:** Soft pastel pink and lavender canvas (`--color-bg-page-gradient`) with organic deep purple curves.
- **Cards & Containers:** Rounded white/light-pink cards (`--color-bg-card`, `--radius-xl: 20px`) with subtle borders (`--color-border-subtle: #F0DFE6`) and gentle shadows.
- **Primary Actions & Dock:** Deep plum/aubergine (`--color-brand-primary: #281A3C`), rounded pills and 12px buttons.
- **Typography:** Compact, legible sans-serif (`Inter` / system-ui) with high contrast.
- **Brand Asset:** Official BrainMint logo from `public/assets/brand/brainmint-logo.png` (integrated via `<BrandLogo />`).

---

## 2. Team Ownership & Feature Boundaries

| Team Member | Module / Role | Dedicated Folder | Route Prefix |
|---|---|---|---|
| **Shivam Kumar** (Lead) | Architecture, Design System, Shared UI, App Shell, Auth | `src/components/`, `src/layouts/`, `src/features/auth/`, `src/styles/` | `/login`, shell |
| **Aastha Singh** | Employee Portal | `src/features/employee/` | `/employee/*` |
| **Harsh Gupta** | Lead / Manager Approvals | `src/features/approvals/` | `/approvals/*` |
| **Ishaan Gupta** | Admin Dashboard & Policy Management | `src/features/admin/` | `/admin/*`, `/dashboard` |
| **Aarushi Srivastava** | Alerts & Audit Center | `src/features/security/` | `/security/*` |

### Coordination Rules
- **Work exclusively in your assigned feature folder.**
- **Do not modify** `src/styles/tokens.css`, `src/styles/index.css`, `src/components/ui/`, or `src/app/` without Shivam's review.
- Register routes in `src/app/router.tsx` under your designated path prefix.

---

## 3. Design Tokens (CSS Custom Properties)

All design tokens are defined in `src/styles/tokens.css`. Always use CSS variables rather than hardcoding hex colors or pixel values:

```css
/* Colors */
var(--color-brand-primary)        /* #281A3C - Deep dark purple */
var(--color-brand-primary-hover)  /* #382552 */
var(--color-accent-pink)          /* #F4DEE5 - Soft rose-mauve accent */
var(--color-bg-page)              /* #F6EBF1 - Pastel page canvas */
var(--color-bg-card)              /* #FFFFFF - Clean card surface */
var(--color-bg-card-subtle)       /* #FFF8FA - Soft blush panel */

/* Text */
var(--color-text-primary)         /* #1E1229 - Heading text */
var(--color-text-body)            /* #2A1B38 - Body text */
var(--color-text-secondary)       /* #6F5D6B - Subtitles & labels */
var(--color-text-muted)           /* #9E8C96 - Placeholders */

/* Status */
var(--color-success)              /* #10B981 - Compliant / Approved / Active */
var(--color-warning)              /* #F59E0B - Pending / Needs attention */
var(--color-danger)               /* #EF4444 - Rejected / Non-compliant */

/* Radii */
var(--radius-md)                  /* 12px - Inputs, buttons */
var(--radius-xl)                  /* 20px - Cards */
var(--radius-pill)                /* 9999px - Badges, bottom dock */
```

---

## 4. Shared UI Components Reference & Examples

Import all shared components from `@/components/ui`:

```tsx
import {
  Button,
  Input,
  PasswordInput,
  Select,
  Checkbox,
  Toggle,
  Card,
  SectionCard,
  StatusBadge,
  Avatar,
  Modal,
  ConfirmationDialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  PageHeader,
  Breadcrumb,
  LoadingSpinner,
  Skeleton,
  EmptyState,
  ErrorState,
  Icon,
} from '@/components/ui';
```

### Button
```tsx
// Primary action (dark purple)
<Button variant="primary" onClick={handleClick}>Sign In</Button>

// Secondary action (soft pink)
<Button variant="secondary" onClick={handleCancel}>Cancel</Button>

// Outline pill (view actions)
<Button variant="outline" size="sm">View Devices</Button>

// With icons & loading
<Button variant="primary" loading={isSubmitting} leftIcon={<Icon name="plus" size={16} />}>
  Request Access
</Button>
```

### Input & PasswordInput
```tsx
<Input
  label="Work Email"
  placeholder="name@cyberproduct.io"
  required
  error={errors.email}
/>

<PasswordInput
  label="Password"
  placeholder="Enter your password"
  labelAction={<a href="/forgot-password">Forgot Password?</a>}
/>
```

### StatusBadge
```tsx
<StatusBadge status="Compliant" />
<StatusBadge status="Approved" />
<StatusBadge status="Pending" />
<StatusBadge status="Rejected" />
<StatusBadge status="Active" />
```

### Card & SectionCard
```tsx
<SectionCard
  title="Personal Information"
  description="Manage your account profile"
  icon={<Icon name="user" size={18} />}
  action={<Button variant="outline" size="sm">Edit</Button>}
>
  {/* Form fields */}
</SectionCard>
```

### Table Primitives
```tsx
<Table>
  <TableHeader>
    <TableRow hoverable={false}>
      <TableHead>Resource</TableHead>
      <TableHead>Request Date</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Action</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.date}</TableCell>
        <TableCell><StatusBadge status={item.status} /></TableCell>
        <TableCell>
          <Button variant="ghost" size="sm">Review</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 5. Layout Primitives Reference

Import shared layout components from `@/components/shared` or `@/layouts`:

```tsx
import { PageLayout, Container, MetricCard, FloatingDock, BrandLogo } from '@/components/shared';
```

### Full Page Wrapper
```tsx
export default function EmployeeDashboardPage() {
  return (
    <PageLayout
      activeDockId="dashboard"
      headerAction={<Avatar name="Alex Morgan" online size="md" />}
    >
      <PageHeader
        title="Good morning, Alex"
        description="Your access, devices, and security status — all in one place."
        actions={<Button variant="primary" leftIcon={<Icon name="plus" size={16} />}>Request Access</Button>}
      />

      {/* Grid of MetricCards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricCard title="My Devices" value="3" label="Registered" subtext="Work devices linked to you" icon={<Icon name="monitor" size={20} />} />
        <MetricCard title="Pending Requests" value="2" label="Pending" subtext="Awaiting approval" icon={<Icon name="clock" size={20} />} />
        <MetricCard title="Approved Requests" value="4" label="Approved" subtext="Access ready to use" icon={<Icon name="check-circle" size={20} />} />
        <MetricCard title="Security Status" value="Compliant" valueColor="var(--color-success)" subtext="All required controls satisfied" icon={<Icon name="shield-check" size={20} />} />
      </div>

      {/* Content tables and cards */}
    </PageLayout>
  );
}
```

---

## 6. Development & Quality Checks

Run these commands before submitting changes:
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Production build
npm run build
```
