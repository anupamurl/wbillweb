'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminGate';
import { Avatar, BlockedBadge, Empty, PageHeader, Panel, SearchInput, Select, SortTh, StatusBadge, ToolbarButton, fmtDate, relativeTime } from '@/components/admin/ui';
import { formatPaise } from '@/lib/currency';
import { formatPhone } from '@/lib/phone';
import { userRows, type UserRow } from '@/lib/admin/stats';
import { downloadCsv, isoDate, paiseToRupees } from '@/lib/admin/csv';
import { logAdminAccess } from '@/lib/admin/data';
import BlockButton from '@/components/admin/BlockButton';
import DeleteUserButton from '@/components/admin/DeleteUserButton';

type SortKey = 'name' | 'joined' | 'bills' | 'revenue' | 'avg' | 'month' | 'last';
type StatusFilter = 'all' | 'blocked' | UserRow['status'];

const sorters: Record<SortKey, (r: UserRow) => number | string> = {
  name: (r) => r.shop.name.toLowerCase(),
  joined: (r) => r.shop.createdAt?.getTime() ?? 0,
  bills: (r) => r.bills,
  revenue: (r) => r.revenue,
  avg: (r) => r.avgBill,
  month: (r) => r.revenueThisMonth,
  last: (r) => r.lastBillAt?.getTime() ?? 0,
};

const PAGE = 25;

export default function AdminUsersPage() {
  const { shops, bills, blocked } = useAdmin();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'revenue', dir: 'desc' });
  const [page, setPage] = useState(0);

  const rows = useMemo(() => userRows(shops, bills), [shops, bills]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const digits = needle.replace(/\D/g, '');
    const list = rows.filter((r) => {
      if (status === 'blocked' ? !blocked.has(r.shop.id) : status !== 'all' && r.status !== status) return false;
      if (!needle) return true;
      return (
        r.shop.name.toLowerCase().includes(needle) ||
        r.shop.address.toLowerCase().includes(needle) ||
        r.shop.id.toLowerCase().includes(needle) ||
        (digits.length >= 3 && (r.shop.ownerPhone.includes(digits) || r.shop.phone.replace(/\D/g, '').includes(digits)))
      );
    });
    const get = sorters[sort.key];
    list.sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const c = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === 'asc' ? c : -c;
    });
    return list;
  }, [rows, q, status, sort, blocked]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE, current * PAGE + PAGE);
  const totals = filtered.reduce((acc, r) => ({ bills: acc.bills + r.bills, revenue: acc.revenue + r.revenue }), { bills: 0, revenue: 0 });

  function onSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' ? 'asc' : 'desc' }));
  }

  async function exportCsv() {
    await logAdminAccess('export_users', 'all', 'Users export', filtered.length);
    downloadCsv(
      `wbill-users-${isoDate(new Date())}.csv`,
      ['UID', 'Shop name', 'Owner phone', 'Shop phone', 'Address', 'Joined', 'Status', 'Blocked', 'Bills', 'Total billed (INR)', 'Average bill (INR)', 'Billed this month (INR)', 'Customers', 'Last bill'],
      filtered.map((r) => [
        r.shop.id,
        r.shop.name,
        r.shop.ownerPhone,
        r.shop.phone,
        r.shop.address,
        isoDate(r.shop.createdAt),
        r.status,
        blocked.has(r.shop.id) ? 'yes' : 'no',
        r.bills,
        paiseToRupees(r.revenue),
        paiseToRupees(r.avgBill),
        paiseToRupees(r.revenueThisMonth),
        r.customers,
        isoDate(r.lastBillAt),
      ]),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        subtitle={`${rows.length.toLocaleString('en-IN')} registered shops · click a row for full details`}
        actions={<ToolbarButton onClick={() => void exportCsv()} icon="document">Export CSV</ToolbarButton>}
      />

      <Panel flush>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={q}
              onChange={(v) => {
                setQ(v);
                setPage(0);
              }}
              placeholder="Search shop, phone, address, uid…"
            />
            <Select<StatusFilter>
              label="Filter by status"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(0);
              }}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'active', label: 'Active (7 days)' },
                { value: 'idle', label: 'Idle (8–30 days)' },
                { value: 'dormant', label: 'Dormant (30+ days)' },
                { value: 'new', label: 'No bills yet' },
                { value: 'blocked', label: `Blocked (${blocked.size})` },
              ]}
            />
          </div>
          <p className="text-xs text-ink-soft tabular-nums">
            {filtered.length} users · {totals.bills.toLocaleString('en-IN')} bills · {formatPaise(totals.revenue)}
          </p>
        </div>

        {filtered.length === 0 ? (
          <Empty title="No users match" body="Try a different search or status filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-canvas text-xs text-ink-soft">
                <tr>
                  <SortTh label="Shop / owner" k="name" sort={sort} onSort={onSort} />
                  <th scope="col" className="px-4 py-3 text-left font-medium">Status</th>
                  <SortTh label="Joined" k="joined" sort={sort} onSort={onSort} />
                  <SortTh label="Bills" k="bills" sort={sort} onSort={onSort} align="right" />
                  <SortTh label="Total billed" k="revenue" sort={sort} onSort={onSort} align="right" />
                  <SortTh label="Avg bill" k="avg" sort={sort} onSort={onSort} align="right" />
                  <SortTh label="This month" k="month" sort={sort} onSort={onSort} align="right" />
                  <SortTh label="Last bill" k="last" sort={sort} onSort={onSort} align="right" />
                  <th scope="col" className="px-4 py-3 text-right font-medium">Access</th>
                  <th scope="col" className="w-12 px-2 py-3"><span className="sr-only">Delete</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((r) => {
                  const href = `/administrator/user/?id=${encodeURIComponent(r.shop.id)}`;
                  const isBlocked = blocked.has(r.shop.id);
                  return (
                    <tr key={r.shop.id} onClick={() => router.push(href)} className={`cursor-pointer transition-colors hover:bg-ink/[0.03] ${isBlocked ? 'bg-error/[0.03]' : ''}`}>
                      <td className="px-4 py-3">
                        <Link href={href} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3">
                          <Avatar name={r.shop.name} />
                          <span className="min-w-0">
                            <span className="block max-w-[16rem] truncate font-medium text-ink">{r.shop.name}</span>
                            <span className="block text-xs text-ink-soft">{formatPhone(r.shop.ownerPhone) || r.shop.ownerPhone || 'No phone'}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {isBlocked ? <BlockedBadge /> : <StatusBadge status={r.status} />}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{fmtDate(r.shop.createdAt)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">{r.bills.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">{formatPaise(r.revenue)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink-soft">{formatPaise(r.avgBill)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">{formatPaise(r.revenueThisMonth)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-ink-soft">{relativeTime(r.lastBillAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <BlockButton uid={r.shop.id} name={r.shop.name} blocked={isBlocked} compact />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <DeleteUserButton uid={r.shop.id} name={r.shop.name} bills={r.bills} compact />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-ink-soft">
            <span>
              Page {current + 1} of {pages}
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
      </Panel>
    </div>
  );
}
