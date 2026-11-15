/**
 * Employee Portal Integration Tests
 * CyberProduct Platform
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// ── 1. Access Request Validation Tests ───────────────────────────────────────

function validateAccessRequestPayload(payload) {
  const errors = [];
  if (!payload.resource_id || typeof payload.resource_id !== 'string') {
    errors.push('resource_id is required');
  }
  if (!payload.reason || typeof payload.reason !== 'string' || !payload.reason.trim()) {
    errors.push('reason is required');
  } else if (payload.reason.trim().length > 1000) {
    errors.push('reason cannot exceed 1000 characters');
  }
  if (payload.requested_duration_minutes !== undefined) {
    if (
      typeof payload.requested_duration_minutes !== 'number' ||
      payload.requested_duration_minutes <= 0
    ) {
      errors.push('requested_duration_minutes must be a positive integer');
    }
  }
  return errors;
}

test('validateAccessRequestPayload verifies access request contract', () => {
  // Valid payload
  const valid = validateAccessRequestPayload({
    resource_id: '11111111-1111-4111-8111-111111111111',
    reason: 'Need Snowflake analytics for quarterly reporting.',
    requested_duration_minutes: 10080,
  });
  assert.strictEqual(valid.length, 0);

  // Missing resource_id
  const missingResource = validateAccessRequestPayload({
    reason: 'Need access',
  });
  assert.ok(missingResource.includes('resource_id is required'));

  // Missing reason
  const missingReason = validateAccessRequestPayload({
    resource_id: '11111111-1111-4111-8111-111111111111',
    reason: '   ',
  });
  assert.ok(missingReason.includes('reason is required'));

  // Exceeds max length
  const tooLong = validateAccessRequestPayload({
    resource_id: '11111111-1111-4111-8111-111111111111',
    reason: 'x'.repeat(1001),
  });
  assert.ok(tooLong.includes('reason cannot exceed 1000 characters'));

  // Invalid duration
  const badDuration = validateAccessRequestPayload({
    resource_id: '11111111-1111-4111-8111-111111111111',
    reason: 'Valid reason',
    requested_duration_minutes: -10,
  });
  assert.ok(badDuration.includes('requested_duration_minutes must be a positive integer'));
});

// ── 2. Device Registration Payload Tests ────────────────────────────────────

function validateDeviceRegistration(payload) {
  const errors = [];
  if (!payload.device_name?.trim()) errors.push('device_name is required');
  if (!payload.device_type?.trim()) errors.push('device_type is required');
  if (!payload.platform?.trim()) errors.push('platform is required');
  if (!payload.hardware_id?.trim()) errors.push('hardware_id is required');
  return errors;
}

test('validateDeviceRegistration enforces required device registration fields', () => {
  const valid = validateDeviceRegistration({
    device_name: 'Work MacBook Pro',
    device_type: 'laptop',
    platform: 'macOS',
    hardware_id: 'HW-MBP-2024-9988',
  });
  assert.strictEqual(valid.length, 0);

  const invalid = validateDeviceRegistration({
    device_name: '',
    device_type: 'laptop',
    platform: '',
    hardware_id: '   ',
  });
  assert.strictEqual(invalid.length, 3);
  assert.ok(invalid.includes('device_name is required'));
  assert.ok(invalid.includes('platform is required'));
  assert.ok(invalid.includes('hardware_id is required'));
});

// ── 3. Notification Normalization Tests ─────────────────────────────────────

function normalizeNotification(raw) {
  return {
    id: raw.id,
    title: raw.title,
    message: raw.message || raw.body || '',
    timestamp: raw.timestamp || raw.created_at,
    isRead: Boolean(raw.isRead ?? raw.is_read),
    priority: raw.priority || 'medium',
    type: raw.type || 'system',
  };
}

test('normalizeNotification correctly maps backend notification response', () => {
  const backendItem = {
    id: 'notif-123',
    title: 'Access Approved',
    body: 'Your request for Snowflake has been approved.',
    created_at: '2026-11-15T10:00:00Z',
    is_read: false,
    priority: 'high',
    type: 'access',
  };

  const normalized = normalizeNotification(backendItem);
  assert.strictEqual(normalized.id, 'notif-123');
  assert.strictEqual(normalized.title, 'Access Approved');
  assert.strictEqual(normalized.message, 'Your request for Snowflake has been approved.');
  assert.strictEqual(normalized.isRead, false);
  assert.strictEqual(normalized.priority, 'high');
  assert.strictEqual(normalized.type, 'access');
});

// ── 4. Profile Update Sanitization Tests ────────────────────────────────────

function sanitizeProfileUpdate(changes) {
  const ALLOWED_FIELDS = ['full_name', 'employee_code', 'department_id', 'manager_id', 'job_title'];
  const sanitized = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in changes && changes[key] !== undefined) {
      sanitized[key] = changes[key];
    }
  }
  return sanitized;
}

test('sanitizeProfileUpdate permits only allowed backend fields and strips restricted fields', () => {
  const rawChanges = {
    full_name: 'Shivam Kumar',
    role: 'security_admin', // Restricted: should be stripped
    company_id: 'comp-999',  // Restricted: should be stripped
    job_title: 'Staff Engineer',
    department_id: 'dept-123',
  };

  const sanitized = sanitizeProfileUpdate(rawChanges);
  assert.strictEqual(sanitized.full_name, 'Shivam Kumar');
  assert.strictEqual(sanitized.job_title, 'Staff Engineer');
  assert.strictEqual(sanitized.department_id, 'dept-123');
  assert.strictEqual(sanitized.role, undefined);
  assert.strictEqual(sanitized.company_id, undefined);
});
