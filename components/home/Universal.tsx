import { delay } from '@/lib/motion';
import { Eyebrow } from '@/components/landing/primitives';

/** Abstract bill tokens: no business names, no categories — just the shape of a record. */
const ledger = [
  { no: 'WB-0001', amount: '₹1,240' },
  { no: 'WB-0418', amount: '₹389' },
  { no: 'WB-1093', amount: '₹12,500' },
  { no: 'WB-0027', amount: '₹760' },
  { no: 'WB-2210', amount: '₹4,385' },
  { no: 'WB-0655', amount: '₹2,099' },
  { no: 'WB-0142', amount: '₹2,260' },
  { no: 'WB-3307', amount: '₹540' },
];

const principles = [
  {
    title: 'Any business that issues a bill',
    body: 'If you sell something and give a bill, WBill fits. Products, services or both — a bill is a bill.',
  },
  {
    title: 'Small today, growing tomorrow',
    body: 'Start free with your first bill. Your records grow with you, from a handful of customers to thousands.',
  },
  {
    title: 'Your records, your data',
    body: 'Your business and customer records belong to you. Export or delete them whenever you ask.',
  },
];

export default function Universal() {
  return (
    <section aria-labelledby="universal-title" className="wb-section overflow-hidden border-t border-line">
      <div className="wb-container">
        <div className="mx-auto max-w-4xl text-center">
          <Eyebrow className="wb-reveal justify-center">One platform, every business</Eyebrow>
          <h2 id="universal-title" className="wb-reveal wb-h2 mt-5 text-ink" style={delay(60)}>
            Built for businesses. Designed for everyone.
          </h2>
          <p className="wb-reveal wb-lead mx-auto mt-6 max-w-2xl" style={delay(120)}>
            Whether you manage a small business or a growing company, WBill makes digital billing and purchase
            records simple.
          </p>
        </div>
      </div>

      {/* A moving ledger of records: universal by design */}
      <div className="relative mt-16 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]" aria-hidden="true">
        {[ledger, [...ledger].reverse()].map((items, row) => (
          <div key={row} className={`wb-ledger flex w-max gap-3 ${row === 1 ? 'wb-ledger-reverse mt-3' : ''}`}>
            {[...items, ...items].map((bill, index) => (
              <div
                key={`${row}-${index}`}
                className="flex w-56 shrink-0 items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5"
              >
                <span>
                  <span className="block font-mono text-[0.7rem] text-ink-faint">{bill.no}</span>
                  <span className="mt-1 block h-1.5 w-20 rounded-full bg-canvas-deep" />
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold tabular text-ink">{bill.amount}</span>
                  <span className="mt-0.5 flex items-center justify-end gap-1 text-[0.65rem] text-ink-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> Recorded
                  </span>
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="wb-container">
        <ul className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {principles.map((p, index) => (
            <li key={p.title} className="wb-reveal bg-canvas p-8 sm:p-10" style={delay(index * 80)}>
              <p className="text-lg font-semibold tracking-[-0.02em] text-ink">{p.title}</p>
              <p className="mt-3 leading-relaxed text-ink-soft">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
