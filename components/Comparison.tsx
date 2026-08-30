import Icon from './Icon';
import SectionHeading from './SectionHeading';
import { delay } from '@/lib/motion';

const criteria = [
  'Works from your phone, at the job',
  'Looks professional to the customer',
  'Leaves a record you can search',
  'Usable on the first day you try it',
];

type Column = {
  label: string;
  note: string;
  has: boolean[];
  highlight?: boolean;
};

/**
 * The real alternatives a visitor is choosing between — described by what
 * they are, never by brand name. No competitor is named anywhere on this site.
 */
const columns: Column[] = [
  {
    label: 'A handwritten slip',
    note: 'Free and instant, until someone asks for last month’s bill.',
    has: [true, false, false, true],
  },
  {
    label: 'A template on the laptop',
    note: 'Fine at a desk. The desk is never where the customer is.',
    has: [false, true, true, true],
  },
  {
    label: 'A full accounting suite',
    note: 'Built for people who want accounting. Most of it never gets opened.',
    has: [false, true, true, false],
  },
  {
    label: 'wbill',
    note: 'One loop, done in seconds, from the phone already in your hand.',
    has: [true, true, true, true],
    highlight: true,
  },
];

export default function Comparison() {
  return (
    <section className="border-b border-border bg-surface-variant/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading
          eyebrow="Honestly compared"
          title="What you’re billing with today"
          lead="Most small businesses in India aren’t choosing between billing apps. They’re choosing between a notebook, a laptop template, and nothing at all."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column, index) => (
            <div
              key={column.label}
              className={`wb-reveal rounded-2xl border p-6 ${
                column.highlight
                  ? 'wb-elevated border-primary/40 bg-surface ring-1 ring-primary/20'
                  : 'border-border bg-surface/60'
              }`}
              style={delay(index * 70)}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-base font-semibold tracking-[-0.01em] ${
                    column.highlight ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  {column.label}
                </p>
                {column.highlight && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                    Us
                  </span>
                )}
              </div>
              {/* Fixed height so the four checklists line up row-for-row. */}
              <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:min-h-[4.3rem]">
                {column.note}
              </p>

              <ul className="mt-5 space-y-3 border-t border-border pt-5">
                {criteria.map((criterion, criterionIndex) => {
                  const yes = column.has[criterionIndex];
                  return (
                    <li key={criterion} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                          yes ? 'bg-success/15 text-success' : 'bg-text-disabled/15 text-text-disabled'
                        }`}
                      >
                        <Icon name={yes ? 'check' : 'cross'} className="h-3 w-3" />
                      </span>
                      <span className={yes ? 'text-text-primary' : 'text-text-disabled'}>
                        {criterion}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
