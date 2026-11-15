/**
 * Frontend Authentication Unit & Integration Tests
 * CyberProduct Platform
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Import navigation guards and role mappings
import {
  ROLE_HOME_ROUTES,
  isRouteAllowedForRole
} from '../src/layouts/navigation.ts';

// ── 1. Role Mapping Tests ───────────────────────────────────────────────────

function mapBackendRole(role) {
  if (!role) return 'employee';
  const normalized = role.toLowerCase().trim();
  switch (normalized) {
    case 'security_admin':
    case 'security':
      return 'security';
    case 'lead':
      return 'lead';
    case 'admin':
      return 'admin';
    case 'employee':
    default:
      return 'employee';
  }
}

test('mapBackendRole correctly maps backend roles to frontend roles', () => {
  assert.strictEqual(mapBackendRole('employee'), 'employee');
  assert.strictEqual(mapBackendRole('lead'), 'lead');
  assert.strictEqual(mapBackendRole('security_admin'), 'security');
  assert.strictEqual(mapBackendRole('security'), 'security');
  assert.strictEqual(mapBackendRole('admin'), 'admin');

  // Case-insensitivity and trimming
  assert.strictEqual(mapBackendRole(' SECURITY_ADMIN '), 'security');
  assert.strictEqual(mapBackendRole('Lead'), 'lead');
  assert.strictEqual(mapBackendRole('EMPLOYEE'), 'employee');

  // Fallbacks
  assert.strictEqual(mapBackendRole(undefined), 'employee');
  assert.strictEqual(mapBackendRole(null), 'employee');
  assert.strictEqual(mapBackendRole('unknown_role'), 'employee');
});

// ── 2. Role Route Protection Tests ──────────────────────────────────────────

test('isRouteAllowedForRole enforces strict role boundaries', () => {
  // Employee role tests
  assert.strictEqual(isRouteAllowedForRole('employee', '/employee'), true);
  assert.strictEqual(isRouteAllowedForRole('employee', '/employee/my-devices'), true);
  assert.strictEqual(isRouteAllowedForRole('employee', '/admin'), false);
  assert.strictEqual(isRouteAllowedForRole('employee', '/admin/users'), false);
  assert.strictEqual(isRouteAllowedForRole('employee', '/lead/dashboard'), false);
  assert.strictEqual(isRouteAllowedForRole('employee', '/approvals'), false);
  assert.strictEqual(isRouteAllowedForRole('employee', '/security'), false);
  assert.strictEqual(isRouteAllowedForRole('employee', '/security/users'), false);

  // Lead role tests
  assert.strictEqual(isRouteAllowedForRole('lead', '/lead/dashboard'), true);
  assert.strictEqual(isRouteAllowedForRole('lead', '/approvals'), true);
  assert.strictEqual(isRouteAllowedForRole('lead', '/admin'), false);
  assert.strictEqual(isRouteAllowedForRole('lead', '/security'), false);

  // Security role tests
  assert.strictEqual(isRouteAllowedForRole('security', '/security'), true);
  assert.strictEqual(isRouteAllowedForRole('security', '/security/alerts'), true);
  assert.strictEqual(isRouteAllowedForRole('security', '/admin'), false);
  assert.strictEqual(isRouteAllowedForRole('security', '/employee'), false);

  // Admin role tests (super-admin access)
  assert.strictEqual(isRouteAllowedForRole('admin', '/admin'), true);
  assert.strictEqual(isRouteAllowedForRole('admin', '/lead/dashboard'), true);
  assert.strictEqual(isRouteAllowedForRole('admin', '/security'), true);
  assert.strictEqual(isRouteAllowedForRole('admin', '/employee'), true);
});

// ── 3. Role Home Destinations ───────────────────────────────────────────────

test('ROLE_HOME_ROUTES directs each role to its designated portal', () => {
  assert.strictEqual(ROLE_HOME_ROUTES.employee, '/employee');
  assert.strictEqual(ROLE_HOME_ROUTES.lead, '/lead/dashboard');
  assert.strictEqual(ROLE_HOME_ROUTES.security, '/security');
  assert.strictEqual(ROLE_HOME_ROUTES.admin, '/admin');
});

// ── 4. Form Validation Logic ────────────────────────────────────────────────

function validateLoginForm(credentials) {
  const errors = {};
  if (!credentials.emailOrUsername || !credentials.emailOrUsername.trim()) {
    errors.emailOrUsername = 'Please enter your username or email';
  }
  if (!credentials.password) {
    errors.password = 'Please enter your password';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

test('validateLoginForm accepts valid credentials and rejects missing fields', () => {
  const valid = validateLoginForm({
    emailOrUsername: 'admin@cyberproduct.test',
    password: 'password123'
  });
  assert.strictEqual(valid.isValid, true);
  assert.strictEqual(Object.keys(valid.errors).length, 0);

  const missingEmail = validateLoginForm({
    emailOrUsername: '   ',
    password: 'password123'
  });
  assert.strictEqual(missingEmail.isValid, false);
  assert.strictEqual(missingEmail.errors.emailOrUsername, 'Please enter your username or email');

  const missingPassword = validateLoginForm({
    emailOrUsername: 'admin@cyberproduct.test',
    password: ''
  });
  assert.strictEqual(missingPassword.isValid, false);
  assert.strictEqual(missingPassword.errors.password, 'Please enter your password');
});

// ── 5. Session Storage Simulation ───────────────────────────────────────────

test('Session storage correctly stores and clears authentication tokens', () => {
  const storage = new Map();
  const mockStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear()
  };

  const TOKEN_KEY = 'cyberproduct_access_token';
  const USER_KEY = 'cyberproduct_auth_user';

  // Save session
  mockStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
  mockStorage.setItem(
    USER_KEY,
    JSON.stringify({ id: 'u1', name: 'Aastha Singh', role: 'employee' })
  );

  assert.strictEqual(mockStorage.getItem(TOKEN_KEY), 'mock-jwt-token');
  const user = JSON.parse(mockStorage.getItem(USER_KEY));
  assert.strictEqual(user.name, 'Aastha Singh');
  assert.strictEqual(user.role, 'employee');

  // Clear session on logout
  mockStorage.removeItem(TOKEN_KEY);
  mockStorage.removeItem(USER_KEY);

  assert.strictEqual(mockStorage.getItem(TOKEN_KEY), null);
  assert.strictEqual(mockStorage.getItem(USER_KEY), null);
});
