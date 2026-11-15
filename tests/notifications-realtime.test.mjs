/**
 * Frontend Realtime Notifications Integration Tests
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Verifies:
 *  - Storage key isolation across user roles and user IDs
 *  - Incoming SSE notification normalization and deduplication
 *  - Real-time unread count updates
 *  - Single read and mark-all-read event propagation
 *  - Missed event reconciliation preserving client-side read states
 */

import test from 'node:test';
import assert from 'node:assert/strict';

function getStorageKey(role, userId) {
  return `cyberproduct_notifications_${role}_${userId}`;
}

function processIncomingNotification(currentList, rawEvent) {
  const notif = rawEvent.notification;
  if (!notif || !notif.id) return currentList;

  // Deduplicate
  if (currentList.some((n) => n.id === notif.id)) {
    return currentList;
  }

  const newItem = {
    id: notif.id,
    title: notif.title || '',
    message: notif.message || notif.body || '',
    timestamp: notif.timestamp || new Date().toISOString(),
    isRead: Boolean(notif.isRead || notif.read_at),
    priority: notif.priority || 'medium',
    type: notif.type || 'system',
    targetRoles: notif.targetRoles || [],
    targetUserId: notif.targetUserId,
    actionUrl: notif.actionUrl,
    actionLabel: notif.actionLabel,
  };

  return [newItem, ...currentList];
}

function processReadUpdate(currentList, readEvent) {
  if (readEvent.all) {
    return currentList.map((n) => ({ ...n, isRead: true }));
  }
  if (readEvent.notificationId) {
    return currentList.map((n) =>
      n.id === readEvent.notificationId ? { ...n, isRead: true } : n
    );
  }
  return currentList;
}

function reconcileMissedEvents(existingList, freshLoadedList) {
  const readIds = new Set(existingList.filter((n) => n.isRead).map((n) => n.id));
  const merged = freshLoadedList.map((n) => ({
    ...n,
    isRead: readIds.has(n.id) ? true : n.isRead,
  }));
  const loadedIds = new Set(freshLoadedList.map((n) => n.id));
  const unreturned = existingList.filter((n) => !loadedIds.has(n.id));

  return [...unreturned, ...merged].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

test('getStorageKey enforces strict role and user namespace isolation', () => {
  const empKey = getStorageKey('employee', 'user-1');
  const leadKey = getStorageKey('lead', 'user-1');
  const otherEmpKey = getStorageKey('employee', 'user-2');

  assert.strictEqual(empKey, 'cyberproduct_notifications_employee_user-1');
  assert.strictEqual(leadKey, 'cyberproduct_notifications_lead_user-1');
  assert.strictEqual(otherEmpKey, 'cyberproduct_notifications_employee_user-2');

  assert.notStrictEqual(empKey, leadKey);
  assert.notStrictEqual(empKey, otherEmpKey);
});

test('processIncomingNotification prepends new notification and deduplicates identical events', () => {
  const initial = [
    { id: 'notif-1', title: 'Old 1', isRead: true, timestamp: '2026-11-15T10:00:00Z' },
  ];

  const rawEvent = {
    type: 'new_notification',
    notification: {
      id: 'notif-2',
      title: 'Realtime Alert',
      message: 'New access request submitted',
      isRead: false,
      timestamp: '2026-11-15T11:00:00Z',
      type: 'access',
      priority: 'high',
    },
  };

  const updated = processIncomingNotification(initial, rawEvent);
  assert.strictEqual(updated.length, 2);
  assert.strictEqual(updated[0].id, 'notif-2');
  assert.strictEqual(updated[0].isRead, false);

  // Re-broadcasting same event must NOT create a duplicate
  const duplicateRun = processIncomingNotification(updated, rawEvent);
  assert.strictEqual(duplicateRun.length, 2);
});

test('processReadUpdate updates single notification read state correctly', () => {
  const list = [
    { id: 'notif-1', isRead: false },
    { id: 'notif-2', isRead: false },
  ];

  const updated = processReadUpdate(list, { notificationId: 'notif-1' });
  assert.strictEqual(updated.find((n) => n.id === 'notif-1').isRead, true);
  assert.strictEqual(updated.find((n) => n.id === 'notif-2').isRead, false);
});

test('processReadUpdate marks all notifications as read when all: true', () => {
  const list = [
    { id: 'notif-1', isRead: false },
    { id: 'notif-2', isRead: false },
    { id: 'notif-3', isRead: true },
  ];

  const updated = processReadUpdate(list, { all: true });
  assert.strictEqual(updated.every((n) => n.isRead === true), true);
  assert.strictEqual(updated.filter((n) => !n.isRead).length, 0);
});

test('reconcileMissedEvents merges fresh server list while preserving client read states', () => {
  const clientList = [
    { id: 'notif-1', isRead: true, timestamp: '2026-11-15T10:00:00Z' },
    { id: 'notif-pending', isRead: false, timestamp: '2026-11-15T12:00:00Z' },
  ];

  // Server response where notif-1 still says isRead: false due to async replication lag
  const freshServerList = [
    { id: 'notif-1', isRead: false, timestamp: '2026-11-15T10:00:00Z' },
    { id: 'notif-new', isRead: false, timestamp: '2026-11-15T13:00:00Z' },
  ];

  const reconciled = reconcileMissedEvents(clientList, freshServerList);

  assert.strictEqual(reconciled.length, 3);
  // notif-1 must preserve client isRead: true
  const item1 = reconciled.find((n) => n.id === 'notif-1');
  assert.strictEqual(item1.isRead, true);

  // New item from server must be present and unread
  const itemNew = reconciled.find((n) => n.id === 'notif-new');
  assert.strictEqual(itemNew.isRead, false);

  // Pending item not yet returned by server is preserved
  const itemPending = reconciled.find((n) => n.id === 'notif-pending');
  assert.strictEqual(itemPending.isRead, false);
});

test('parseSSEBuffer correctly handles events, ping comments, and partial chunks', () => {
  function parseSSEBuffer(buffer) {
    const messages = [];
    const normalized = buffer.replace(/\r\n/g, '\n');
    const parts = normalized.split('\n\n');
    const remaining = parts.pop() ?? '';

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;

      let event = 'message';
      let data = '';
      const lines = part.split('\n');

      for (const line of lines) {
        if (line.startsWith('event:')) {
          event = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          const value = line.slice(5).trim();
          data = data ? `${data}\n${value}` : value;
        }
      }

      if (data) {
        messages.push({ event, data });
      }
    }

    return { messages, remaining };
  }

  const chunk1 = 'event: notification\ndata: {"id":"123"}\n\n:ping\n\nevent: read\ndata: {"all":true';
  const res1 = parseSSEBuffer(chunk1);

  assert.strictEqual(res1.messages.length, 1);
  assert.strictEqual(res1.messages[0].event, 'notification');
  assert.strictEqual(res1.messages[0].data, '{"id":"123"}');
  assert.strictEqual(res1.remaining, 'event: read\ndata: {"all":true');

  // Complete chunk2
  const chunk2 = res1.remaining + '}\n\n';
  const res2 = parseSSEBuffer(chunk2);
  assert.strictEqual(res2.messages.length, 1);
  assert.strictEqual(res2.messages[0].event, 'read');
  assert.strictEqual(res2.messages[0].data, '{"all":true}');
  assert.strictEqual(res2.remaining, '');
});
