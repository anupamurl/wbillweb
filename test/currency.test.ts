import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPaise, parseRupeesToPaise } from '../lib/currency';

test('formatPaise renders rupees and paise with the rupee sign', () => {
  assert.equal(formatPaise(12345), '₹123.45');
  assert.equal(formatPaise(0), '₹0.00');
  assert.equal(formatPaise(100), '₹1.00');
});

test('parseRupeesToPaise round-trips a whole and a fractional amount', () => {
  assert.equal(parseRupeesToPaise('123.45'), 12345);
  assert.equal(parseRupeesToPaise('100'), 10000);
  assert.equal(parseRupeesToPaise('0.5'), 50);
  assert.equal(parseRupeesToPaise('1,234.50'), 123450);
});

test('parseRupeesToPaise rejects garbage and over-precise input', () => {
  assert.equal(parseRupeesToPaise(''), null);
  assert.equal(parseRupeesToPaise('abc'), null);
  assert.equal(parseRupeesToPaise('12.345'), null);
  assert.equal(parseRupeesToPaise('-5'), null);
});

test('formatPaise and parseRupeesToPaise agree on a line-total style computation', () => {
  const qty = 3;
  const unitPrice = parseRupeesToPaise('499.00')!;
  assert.equal(unitPrice, 49900);
  const lineTotal = qty * unitPrice;
  assert.equal(formatPaise(lineTotal), '₹1,497.00');
});
