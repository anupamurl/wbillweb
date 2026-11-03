import { delay } from '@/lib/motion';
import CountUp from '../CountUp';
import RevenueChart from './RevenueChart';
import { demoKpis, demoTopProducts } from '@/content/demo';

const kpis = [
  { label: 'Revenue this month', value: demoKpis.revenue, kind: 'inr' as const },
  { label: 'Bills issued', value: demoKpis.bills, kind: 'number' as const },
  { label: 'Repeat customers', value: demoKpis.repeatPercent, kind: 'percent' as const },
  { label: 'Average bill', value: demoKpis.averageBill, kind: 'inr' as const },
];

export default function AnalyticsDemo() {
  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      <dl className="wb-stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs text-ink-soft">{kpi.label}</dt>
            <dd className="mt-1.5 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              <CountUp value={kpi.value} kind={kpi.kind} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-surface p-5">
          <RevenueChart />
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs text-ink-soft">Top-selling categories</p>
          <ul className="mt-4 space-y-4">
            {demoTopProducts.map((product, index) => (
              <li key={product.name}>
                <div className="flex justify-between text-sm">
                  <span className="text-ink">{product.name}</span>
                  <span className="tabular-nums text-ink-soft">{Math.round(product.share * 100)}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-canvas">
                  <div
                    className="wb-barx h-full rounded-full bg-primary"
                    style={{ width: `${product.share * 100 / demoTopProducts[0].share}%`, ...delay(120 + index * 80) }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
