'use client';

import Link from 'next/link';
import { Fragment, useState } from 'react';
import { formatPaise } from '@/lib/currency';
import { formatPhone } from '@/lib/phone';
import { formatBillNo } from '@/lib/models';
import type { AdminBill } from '@/lib/admin/data';
import { Empty, fmtDate } from './ui';

const PAGE = 30;

/** Bills with click-to-expand line items. `shopName` adds a shop column. */
export default function BillsTable({ bills, shopName }: { bills: AdminBill[]; shopName?: Map<string, string> }) {
  const [open, setOpen] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(bills.length / PAGE));
  const current = Math.min(page, pages - 1);
  const visible = bills.slice(current * PAGE, current * PAGE + PAGE);
  const cols = shopName ? 7 : 6;

  if (bills.length === 0) return <Empty title="No bills" body="Nothing matches the current filters." />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-canvas text-xs text-ink-soft">
            <tr>
              <th scope="col" className="w-8 px-4 py-3" />
              <th scope="col" className="px-4 py-3 text-left font-medium">Bill no.</th>
              {shopName && <th scope="col" className="px-4 py-3 text-left font-medium">Shop</th>}
              <th scope="col" className="px-4 py-3 text-left font-medium">Customer</th>
              <th scope="col" className="px-4 py-3 text-left font-medium">Date</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Items</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((b) => {
              const key = `${b.shopId}/${b.id}`;
              const isOpen = open === key;
              return (
                <Fragment key={key}>
                  <tr className={`cursor-pointer transition-colors hover:bg-ink/[0.03] ${isOpen ? 'bg-ink/[0.03]' : ''}`} onClick={() => setOpen(isOpen ? null : key)}>
                    <td className="px-4 py-3 text-ink-faint">
                      <button type="button" aria-expanded={isOpen} aria-label={isOpen ? 'Hide items' : 'Show items'} className="inline-flex">
                        <span className={`inline-block text-[0.6rem] transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-ink">{formatBillNo(b.billNumber)}</td>
                    {shopName && (
                      <td className="px-4 py-3">
                        <Link
                          href={`/administrator/user/?id=${encodeURIComponent(b.shopId)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block max-w-[14rem] truncate font-medium text-primary hover:underline"
                        >
                          {shopName.get(b.shopId) ?? 'Deleted shop'}
                        </Link>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="block max-w-[14rem] truncate text-ink">{b.customerName || '—'}</span>
                      <span className="block text-xs text-ink-soft">{formatPhone(b.customerPhone) || b.customerPhone}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{fmtDate(b.date, true)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-soft">{b.items.length}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">{formatPaise(b.grandTotal)}</td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={cols} className="bg-canvas px-4 py-4 sm:px-12">
                        <div className="overflow-hidden rounded-xl border border-border bg-surface">
                          <table className="w-full text-xs">
                            <thead className="text-ink-soft">
                              <tr className="border-b border-border">
                                <th className="px-4 py-2 text-left font-medium">Item</th>
                                <th className="px-4 py-2 text-right font-medium">Qty</th>
                                <th className="px-4 py-2 text-right font-medium">Unit price</th>
                                <th className="px-4 py-2 text-right font-medium">Line total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {b.items.map((it, i) => (
                                <tr key={i}>
                                  <td className="px-4 py-2 text-ink">{it.name}</td>
                                  <td className="px-4 py-2 text-right tabular-nums text-ink-soft">{it.qty}</td>
                                  <td className="px-4 py-2 text-right tabular-nums text-ink-soft">{formatPaise(it.unitPrice)}</td>
                                  <td className="px-4 py-2 text-right tabular-nums text-ink">{formatPaise(it.lineTotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-border">
                                <td colSpan={3} className="px-4 py-2 text-right text-ink-soft">Subtotal</td>
                                <td className="px-4 py-2 text-right tabular-nums text-ink">{formatPaise(b.subtotal)}</td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-right font-semibold text-ink">Grand total</td>
                                <td className="px-4 py-2 text-right font-semibold tabular-nums text-ink">{formatPaise(b.grandTotal)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        <p className="mt-2 font-mono text-[0.65rem] text-ink-faint">
                          shops/{b.shopId}/bills/{b.id}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-ink-soft">
          <span>
            {current * PAGE + 1}–{Math.min(bills.length, (current + 1) * PAGE)} of {bills.length.toLocaleString('en-IN')}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="rounded-lg border border-border px-3 py-1.5 font-medium text-ink disabled:opacity-40">
              Previous
            </button>
            <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="rounded-lg border border-border px-3 py-1.5 font-medium text-ink disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
