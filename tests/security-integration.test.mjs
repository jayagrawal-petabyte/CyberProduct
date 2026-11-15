/**
 * Security Administrator Portal Integration Tests
 * CyberProduct Platform
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { isRouteAllowedForRole } from '../src/layouts/navigation.ts';

// ── 1. Security Route Access Control ─────────────────────────────────────────

test('isRouteAllowedForRole strictly limits security routes to security and admin roles', () => {
  const securityRoutes = [
    '/security/dashboard',
    '/security/users',
    '/security/devices',
    '/security/network-compliance',
    '/security/restricted-resources',
    '/security/policies',
    '/security/alerts',
    '/security/audit-logs',
    '/security/notifications',
    '/security/profile',
  ];

  for (const route of securityRoutes) {
    // Security role must have access
    assert.strictEqual(
      isRouteAllowedForRole('security', route),
      true,
      `security role should access ${route}`
    );

    // Admin role must have access
    assert.strictEqual(
      isRouteAllowedForRole('admin', route),
      true,
      `admin role should access ${route}`
    );

    // Employee must NEVER have access to security routes
    assert.strictEqual(
      isRouteAllowedForRole('employee', route),
      false,
      `employee role must NOT access ${route}`
    );

    // Lead must NEVER have access to security routes
    assert.strictEqual(
      isRouteAllowedForRole('lead', route),
      false,
      `lead role must NOT access ${route}`
    );
  }
});

// ── 2. Policy Payload & Effect Validation ───────────────────────────────────

function validatePolicyPayload(payload) {
  const errors = [];
  const ALLOWED_EFFECTS = ['ALLOW', 'BLOCK', 'REQUIRES_APPROVAL'];

  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    errors.push('Policy name is required and must be a non-empty string');
  }

  if (payload.effect && !ALLOWED_EFFECTS.includes(payload.effect)) {
    errors.push(`Invalid policy effect: ${payload.effect}. Must be one of: ${ALLOWED_EFFECTS.join(', ')}`);
  }

  return errors;
}

test('validatePolicyPayload validates policy creation and effect contracts', () => {
  // Valid policies
  assert.deepStrictEqual(
    validatePolicyPayload({ name: 'Device Isolation Policy', effect: 'BLOCK' }),
    []
  );
  assert.deepStrictEqual(
    validatePolicyPayload({ name: 'Workforce Acknowledgment', effect: 'ALLOW' }),
    []
  );
  assert.deepStrictEqual(
    validatePolicyPayload({ name: 'Elevated Database Access', effect: 'REQUIRES_APPROVAL' }),
    []
  );

  // Missing name
  const missingName = validatePolicyPayload({ effect: 'ALLOW' });
  assert.ok(missingName.some((e) => e.includes('Policy name is required')));

  // Invalid effect
  const invalidEffect = validatePolicyPayload({ name: 'Test Policy', effect: 'DENY_ALL' });
  assert.ok(invalidEffect.some((e) => e.includes('Invalid policy effect')));
});

// ── 3. Resource Payload Sanitization ────────────────────────────────────────

const ALLOWED_RESOURCE_FIELDS = [
  'name',
  'description',
  'category',
  'resource_type',
  'sensitivity',
  'requires_approval',
  'status',
];

function sanitizeResourcePayload(payload) {
  const sanitized = {};
  for (const key of ALLOWED_RESOURCE_FIELDS) {
    if (key in payload) {
      sanitized[key] = payload[key];
    }
  }
  return sanitized;
}

test('sanitizeResourcePayload preserves allowed fields and strips unauthorized keys', () => {
  const rawInput = {
    name: 'Production PostgreSQL Cluster',
    description: 'Primary customer database cluster',
    resource_type: 'Relational Database',
    category: 'Databases',
    sensitivity: 'confidential',
    requires_approval: true,
    status: 'restricted',
    // Unauthorized / internal properties that must be stripped:
    company_id: 'malicious-override-id',
    id: 'injected-id',
    created_at: '2020-01-01',
    credentials: { password: 'secret' },
  };

  const sanitized = sanitizeResourcePayload(rawInput);
  assert.strictEqual(sanitized.name, 'Production PostgreSQL Cluster');
  assert.strictEqual(sanitized.category, 'Databases');
  assert.strictEqual(sanitized.sensitivity, 'confidential');
  assert.strictEqual(sanitized.status, 'restricted');
  assert.strictEqual(sanitized.company_id, undefined);
  assert.strictEqual(sanitized.id, undefined);
  assert.strictEqual(sanitized.credentials, undefined);
});

// ── 4. Security User Update Validation ──────────────────────────────────────

const ALLOWED_USER_UPDATE_FIELDS = [
  'full_name',
  'employee_code',
  'department_id',
  'manager_id',
  'job_title',
];

function sanitizeUserUpdate(payload) {
  const sanitized = {};
  for (const key of ALLOWED_USER_UPDATE_FIELDS) {
    if (key in payload) {
      sanitized[key] = payload[key];
    }
  }
  return sanitized;
}

test('sanitizeUserUpdate prohibits elevation of privileges or company alteration', () => {
  const attempt = {
    full_name: 'Jane Doe',
    job_title: 'Principal Security Architect',
    role: 'super_admin', // must be stripped
    company_id: 'other-corp', // must be stripped
    is_active: false, // must be stripped from regular update
    email: 'new@attacker.com', // email cannot be altered via user profile update
  };

  const sanitized = sanitizeUserUpdate(attempt);
  assert.strictEqual(sanitized.full_name, 'Jane Doe');
  assert.strictEqual(sanitized.job_title, 'Principal Security Architect');
  assert.strictEqual(sanitized.role, undefined);
  assert.strictEqual(sanitized.company_id, undefined);
  assert.strictEqual(sanitized.email, undefined);
});

// ── 5. Device Revocation Invariants ─────────────────────────────────────────

function processDeviceRevocation(device) {
  if (!device || !device.id) {
    throw new Error('Device ID is required for revocation');
  }
  if (device.status === 'revoked') {
    return { ...device, alreadyRevoked: true };
  }
  return {
    ...device,
    status: 'revoked',
    revokedAt: new Date().toISOString(),
  };
}

test('processDeviceRevocation safely updates device status and handles idempotent calls', () => {
  const activeDevice = { id: 'dev-101', name: 'Work MacBook Pro', status: 'active' };
  const revoked = processDeviceRevocation(activeDevice);
  assert.strictEqual(revoked.status, 'revoked');
  assert.ok(revoked.revokedAt);

  const idempotent = processDeviceRevocation(revoked);
  assert.strictEqual(idempotent.status, 'revoked');
  assert.strictEqual(idempotent.alreadyRevoked, true);

  assert.throws(() => processDeviceRevocation(null), /Device ID is required/);
  assert.throws(() => processDeviceRevocation({}), /Device ID is required/);
});
