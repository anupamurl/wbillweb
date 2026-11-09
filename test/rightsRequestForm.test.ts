import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestError, type RequestDraft } from '../lib/rightsRequestForm';

const ok: RequestDraft = { type: 'access', name: 'Priya', contact: '9876543210', details: 'Send my data', shopName: '' };

test('a complete request passes, by mobile or by email', () => {
  assert.equal(requestError(ok), '');
  assert.equal(requestError({ ...ok, contact: '+91 98765 43210' }), '');
  assert.equal(requestError({ ...ok, contact: 'priya@example.com' }), '');
});

test('name, contact and details are required', () => {
  assert.notEqual(requestError({ ...ok, name: ' ' }), '');
  assert.notEqual(requestError({ ...ok, contact: '123' }), '');
  assert.notEqual(requestError({ ...ok, details: '' }), '');
});

test('a request about a shop bill needs the shop name', () => {
  assert.notEqual(requestError({ ...ok, type: 'shop_bill' }), '');
  assert.equal(requestError({ ...ok, type: 'shop_bill', shopName: 'Sharma' }), '');
});
