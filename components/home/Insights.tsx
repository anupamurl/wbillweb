import Link from 'next/link';
import Icon from '@/components/Icon';
import { delay } from '@/lib/motion';
import { Eyebrow } from '@/components/landing/primitives';
import { BrowserFrame, InsightsScreen } from '@/components/landing/mocks';

const metrics = [
  { label: 'Total bills', body: 'Every bill you have issued, counted.' },
  { label: 'Revenue', body: 'All-time and this month.' },
  { label: 'Customers', body: 'Unique customers, matched by phone.' },
  { label: 'Sales trend', body: 'Revenue month by month.' },
  { label: 'Busiest days', body: 'Bills by day across the last week.' },
  { label: 'Top customers', body: 'Who you bill most, by total spent.' },
];

export default function Insights() {
  return (
    <section id="insights" aria-labelledby="insights-title" className="relative scroll-mt-16 overflow-hidden bg-night text-white">
      <div className="wb-container wb-section">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="wb-reveal wb-eyebrow text-white/60">Business insights</p>
            <h2 id="insights-title" className="wb-reveal wb-h2 mt-5" style={delay(60)}>
              Your bills already know how business is going.
            </h2>
          </div>
          <div>
            <p className="wb-reveal text-lg leading-relaxed text-white/65" style={delay(120)}>
              WBill turns the bills you make into a clear picture of your business — no spreadsheets, no extra
              work. Available now on the web dashboard.
            </p>
            <Link href="/signup/" className="wb-reveal wb-btn wb-btn-md group mt-7 bg-white text-night hover:bg-white/90" style={delay(160)}>
              Open your dashboard
              <Icon name="arrow" className="wb-arrow h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="wb-reveal mt-16" style={delay(120)}>
          <BrowserFrame url="wbill.app/dashboard/insights" className="!border-white/10">
            <InsightsScreen />
          </BrowserFrame>
          <p className="mt-4 text-center text-xs text-white/45">Demo data. Figures are illustrative, not from a real business.</p>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/10 pt-10 md:grid-cols-3 lg:grid-cols-6">
          {metrics.map((m, index) => (
            <div key={m.label} className="wb-reveal" style={delay(index * 50)}>
              <dt className="text-sm font-semibold">{m.label}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-white/55">{m.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
