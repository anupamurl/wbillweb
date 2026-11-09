'use client';

import { useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminGate';
import BillsTable from '@/components/admin/BillsTable';
import { Kpi, PageHeader, Panel, SearchInput, Select, ToolbarButton } from '@/components/admin/ui';
import { formatPaise } from '@/lib/currency';
import { formatBillNo } from '@/lib/models';
import { downloadCsv, isoDate, paiseToRupees } from '@/lib/admin/csv';
import { logAdminAccess } from '@/lib/admin/data';
import { maskName, maskPhone } from '@/lib/phone';

type Range = 'all' | 'today' | '7d' | '30d' | 'month' | 'lastMonth' | 'year';

function rangeBounds(range: Range): [number, number] {
  const now = new Date();
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  switch (range) {
    case 'today':
      return [day, Infinity];
    case '7d':
      return [day - 6 * 86_400_000, Infinity];
    case '30d':
      return [day - 29 * 86_400_000, Infinity];
    case 'month':
      return [new Date(now.getFullYear(), now.getMonth(), 1).getTime(), Infinity];
    case 'lastMonth':
      return [new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(), new Date(now.getFullYear(), now.getMonth(), 1).getTime()];
    case 'year':
      return [new Date(now.getFullYear(), 0, 1).getTime(), Infinity];
    default:
      return [-Infinity, Infinity];
  }
}

export default function AdminBillsPage() {
  const { shops, bills } = useAdmin();
  const [q, setQ] = useState('');
  const [range, setRange] = useState<Range>('all');
  const [shopId, setShopId] = useState('all');
  const [minAmount, setMinAmount] = useState('');

  const shopName = useMemo(() => new Map(shops.map((s) => [s.id, s.name])), [shops]);
  const shopOptions = useMemo(
    () => [{ value: 'all', label: 'All shops' }, ...[...shops].sort((a, b) => a.name.localeCompare(b.name)).map((s) => ({ value: s.id, label: s.name }))],
    [shops],
  );

  const filtered = useMemo(() => {
    const [from, to] = rangeBounds(range);
    const needle = q.trim().toLowerCase();
    const min = Number(minAmount) * 100 || 0;
    return bills.filter((b) => {
      const t = b.date.getTime();
      if (t < from || t >= to) return false;
      if (shopId !== 'all' && b.shopId !== shopId) return false;
      if (b.grandTotal < min) return false;
      if (!needle) return true;
      return (
        formatBillNo(b.billNumber).toLowerCase().includes(needle) ||
        (shopName.get(b.shopId) ?? '').toLowerCase().includes(needle) ||
        b.items.some((i) => i.name.toLowerCase().includes(needle))
      );
    });
  }, [bills, q, range, shopId, minAmount, shopName]);

  const total = filtered.reduce((s, b) => s + b.grandTotal, 0);
  const shopsInView = new Set(filtered.map((b) => b.shopId)).size;
  const itemsInView = filtered.reduce((s, b) => s + b.items.reduce((n, i) => n + i.qty, 0), 0);

  async function exportCsv() {
    await logAdminAccess('export_all_bills', 'all', 'Bills export, customer details masked', filtered.length);
    downloadCsv(
      `wbill-all-bills-${isoDate(new Date())}.csv`,
      ['Shop UID', 'Shop name', 'Bill no.', 'Date', 'Customer name', 'Customer phone', 'Items', 'Item details', 'Subtotal (INR)', 'Grand total (INR)'],
      filtered.map((b) => [
        b.shopId,
        shopName.get(b.shopId) ?? 'Deleted shop',
        formatBillNo(b.billNumber),
        b.date.toISOString(),
        maskName(b.customerName),
        maskPhone(b.customerPhone),
        b.items.length,
        b.items.map((i) => `${i.name} x${i.qty} @ ${paiseToRupees(i.unitPrice)}`).join('; '),
        paiseToRupees(b.subtotal),
        paiseToRupees(b.grandTotal),
      ]),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All bills"
        subtitle="Every bill from every shop, newest first. Click a row to see its items."
        actions={<ToolbarButton onClick={() => void exportCsv()} icon="document">Export CSV</ToolbarButton>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi accent label="Billed in view" value={formatPaise(total)} icon="chart" />
        <Kpi label="Bills in view" value={filtered.length.toLocaleString('en-IN')} icon="receipt" />
        <Kpi label="Average bill" value={formatPaise(filtered.length ? Math.round(total / filtered.length) : 0)} icon="percent" />
        <Kpi label="Shops / units sold" value={`${shopsInView} / ${itemsInView.toLocaleString('en-IN')}`} icon="store" />
      </div>

      <Panel flush>
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 lg:flex-row lg:flex-wrap lg:items-center">
          <SearchInput value={q} onChange={setQ} placeholder="Search bill no., shop, item…" />
          <Select<Range>
            label="Date range"
            value={range}
            onChange={setRange}
            options={[
              { value: 'all', label: 'All time' },
              { value: 'today', label: 'Today' },
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: 'month', label: 'This month' },
              { value: 'lastMonth', label: 'Last month' },
              { value: 'year', label: 'This year' },
            ]}
          />
          <Select<string> label="Shop" value={shopId} onChange={setShopId} options={shopOptions} />
          <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-ink-soft focus-within:border-primary">
            Min ₹
            <input
              inputMode="decimal"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="0"
              className="w-20 bg-transparent text-ink outline-none placeholder:text-ink-faint"
            />
          </label>
        </div>
        <BillsTable bills={filtered} shopName={shopName} />
      </Panel>
    </div>
  );
}
