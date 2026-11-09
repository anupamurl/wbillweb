import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isErasureDue, isInactive, lastActivity, loginCutoffDay, noticeHasRun, retainUntil } from '../lib/retention';
import { maskName, maskPhone } from '../lib/phone';

const day = 24 * 60 * 60 * 1000;

test('a closed account is kept for a full year', () => {
  const closed = new Date('2026-01-01T00:00:00Z');
  assert.equal(retainUntil(closed).toISOString(), '2027-01-01T00:00:00.000Z');
  assert.equal(isErasureDue(closed, new Date(closed.getTime() + 364 * day)), false);
  assert.equal(isErasureDue(closed, new Date(closed.getTime() + 365 * day)), true);
  assert.equal(isErasureDue(null), false);
});

test('an account is inactive only after three full years', () => {
  const now = new Date('2026-11-09T00:00:00Z');
  assert.equal(isInactive(new Date('2023-11-10T00:00:00Z'), now), false);
  assert.equal(isInactive(new Date('2023-11-08T00:00:00Z'), now), true);
  assert.equal(isInactive(null, now), false);
});

test('last activity picks the newest date and ignores gaps', () => {
  const a = new Date('2024-01-01');
  const b = new Date('2025-01-01');
  assert.equal(lastActivity([a, null, b, undefined]), b);
  assert.equal(lastActivity([null]), null);
});

test('erasure needs the full warning period', () => {
  const sent = new Date('2026-11-01T00:00:00Z');
  assert.equal(noticeHasRun(sent, new Date('2026-11-02T23:59:00Z')), false);
  assert.equal(noticeHasRun(sent, new Date('2026-11-03T00:00:00Z')), true);
  assert.equal(noticeHasRun(null), false);
});

test('login records older than a year are the ones erased', () => {
  assert.equal(loginCutoffDay(new Date(2026, 10, 9, 12)), '2025-11-09');
});

test('masking hides customer details and copes with empty values', () => {
  assert.equal(maskPhone('9876543210'), '••••••3210');
  assert.equal(maskPhone(''), '');
  assert.equal(maskName('Priya Sharma'), 'P••• S•••');
  assert.equal(maskName('   '), '');
});
