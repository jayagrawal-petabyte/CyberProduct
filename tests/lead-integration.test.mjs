/**
 * Lead Portal & Approval Workflow Integration Tests
 * CyberProduct Platform
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { isRouteAllowedForRole } from '../src/layouts/navigation.ts';

// ── 1. Approval Decision Validation Tests ────────────────────────────────────

function validateDecisionPayload(decision, decisionReason) {
  const errors = [];
  if (!['approved', 'rejected'].includes(decision)) {
    errors.push('Decision must be either "approved" or "rejected"');
  }
  if (decisionReason !== undefined && decisionReason !== null) {
    if (typeof decisionReason !== 'string') {
      errors.push('Decision reason must be a string');
    } else if (decisionReason.trim().length > 1000) {
      errors.push('Decision reason must not exceed 1000 characters');
    }
  }
  return errors;
}

test('validateDecisionPayload enforces valid decision types and reason bounds', () => {
  // Valid approval
  assert.deepStrictEqual(validateDecisionPayload('approved', 'Verified business need with project manager.'), []);

  // Valid rejection
  assert.deepStrictEqual(validateDecisionPayload('rejected', 'Access level too permissive for contractor role.'), []);

  // Valid without reason
  assert.deepStrictEqual(validateDecisionPayload('approved'), []);

  // Invalid decision type
  const badDecision = validateDecisionPayload('deferred', 'Pending further review');
  assert.ok(badDecision.includes('Decision must be either "approved" or "rejected"'));

  // Reason exceeds 1000 characters
  const tooLong = validateDecisionPayload('approved', 'a'.repeat(1001));
  assert.ok(tooLong.includes('Decision reason must not exceed 1000 characters'));
});

// ── 2. Self-Approval Invariant Enforcement Tests ─────────────────────────────

function checkSelfApproval(requesterId, deciderId) {
  if (requesterId && deciderId && requesterId === deciderId) {
    return {
      allowed: false,
      statusCode: 403,
      message: 'Self-approval of access requests is strictly prohibited.',
    };
  }
  return { allowed: true };
}

test('checkSelfApproval prohibits leads from approving their own access requests', () => {
  const selfApprovalAttempt = checkSelfApproval('usr-lead-001', 'usr-lead-001');
  assert.strictEqual(selfApprovalAttempt.allowed, false);
  assert.strictEqual(selfApprovalAttempt.statusCode, 403);
  assert.strictEqual(
    selfApprovalAttempt.message,
    'Self-approval of access requests is strictly prohibited.',
  );

  const peerApproval = checkSelfApproval('usr-emp-002', 'usr-lead-001');
  assert.strictEqual(peerApproval.allowed, true);
});

// ── 3. Lead Route Guard Authorization Tests ─────────────────────────────────

test('isRouteAllowedForRole permits lead portal routes only to lead and admin roles', () => {
  const leadRoutes = [
    '/lead/dashboard',
    '/lead/approvals',
    '/lead/approvals/req-123',
    '/lead/approval-history',
    '/lead/employee-activity',
    '/lead/notifications',
    '/lead/profile',
  ];

  for (const route of leadRoutes) {
    // Lead is authorized
    assert.strictEqual(isRouteAllowedForRole('lead', route), true, `Lead should access ${route}`);

    // Admin is authorized
    assert.strictEqual(isRouteAllowedForRole('admin', route), true, `Admin should access ${route}`);

    // Ordinary Employee is blocked
    assert.strictEqual(isRouteAllowedForRole('employee', route), false, `Employee must not access ${route}`);
  }
});

// ── 4. Approval Request Normalization Tests ─────────────────────────────────

function normalizeApprovalRequest(backendReq, user, resource) {
  return {
    id: backendReq.id,
    employeeName: user?.full_name || 'Team Member',
    employeeEmail: user?.email || 'employee@company.com',
    resourceName: resource?.name || 'Resource',
    status: backendReq.status,
    requestedAt: backendReq.created_at,
    decisionNotes: backendReq.decision_reason || undefined,
  };
}

test('normalizeApprovalRequest maps backend access request fields to UI model', () => {
  const backendReq = {
    id: 'req-uuid-999',
    requester_id: 'usr-111',
    resource_id: 'res-222',
    status: 'pending',
    reason: 'Need access to Snowflake for sprint deliverables',
    created_at: '2026-11-15T12:00:00Z',
    updated_at: '2026-11-15T12:00:00Z',
    decision_reason: null,
  };

  const user = {
    id: 'usr-111',
    full_name: 'Maya Chen',
    email: 'maya.chen@company.com',
  };

  const resource = {
    id: 'res-222',
    name: 'Snowflake Analytics',
  };

  const normalized = normalizeApprovalRequest(backendReq, user, resource);
  assert.strictEqual(normalized.id, 'req-uuid-999');
  assert.strictEqual(normalized.employeeName, 'Maya Chen');
  assert.strictEqual(normalized.employeeEmail, 'maya.chen@company.com');
  assert.strictEqual(normalized.resourceName, 'Snowflake Analytics');
  assert.strictEqual(normalized.status, 'pending');
  assert.strictEqual(normalized.decisionNotes, undefined);
});
