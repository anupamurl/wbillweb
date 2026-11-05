import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanNumber, formatPhone, isIndianMobile, toE164 } from '../lib/phone';

test('toE164 accepts a plain 10-digit Indian number', () => {
  const r = toE164('IN', '9876543210');
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.e164, '+919876543210');
});

test('toE164 strips a leading 0 and spaces', () => {
  const r = toE164('IN', '098765 43210');
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.e164, '+919876543210');
});

test('toE164 strips a pasted country code', () => {
  const r = toE164('IN', '+91 98765 43210');
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.e164, '+919876543210');
});

test('toE164 rejects an Indian number starting with 0-5', () => {
  const r = toE164('IN', '5876543210');
  assert.equal(r.ok, false);
});

test('toE164 rejects the wrong digit count', () => {
  assert.equal(toE164('IN', '98765').ok, false);
  assert.equal(toE164('IN', '98765432100').ok, false);
});

test('toE164 rejects an empty number', () => {
  assert.equal(toE164('IN', '').ok, false);
});

test('toE164 handles a different country length (UAE, 9 digits)', () => {
  const r = toE164('AE', '501234567');
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.e164, '+971501234567');
});

test('isIndianMobile matches the Firestore rules regex exactly', () => {
  assert.equal(isIndianMobile('9876543210'), true);
  assert.equal(isIndianMobile('6000000000'), true);
  assert.equal(isIndianMobile('5876543210'), false); // starts 0-5
  assert.equal(isIndianMobile('987654321'), false); // 9 digits
  assert.equal(isIndianMobile('98765432100'), false); // 11 digits
  assert.equal(isIndianMobile('+919876543210'), false); // must be bare digits
});

test('cleanNumber strips non-digits and a leading trunk zero', () => {
  assert.equal(cleanNumber('098765-43210'), '9876543210');
  assert.equal(cleanNumber('+91 98765 43210'), '919876543210'); // digits only; +91 is not stripped here
});

test('formatPhone groups a 10-digit number and strips a +91 prefix', () => {
  assert.equal(formatPhone('9876543210'), '98765 43210');
  assert.equal(formatPhone('+919876543210'), '98765 43210');
  assert.equal(formatPhone(null), '');
  assert.equal(formatPhone(undefined), '');
});
