import Icon from '@/components/Icon';
import { formatInr } from '@/lib/currency';
import { delay } from '@/lib/motion';
import { comparison, plans, type Cell } from '@/content/pricing';
import MagneticLink from './MagneticLink';
import { SectionIntro, StatusTag } from './primitives';

function CellValue({ value }: { value: Cell }) {
  if (value === true)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name="check" className="h-3.5 w-3.5" />
        <span className="sr-only">Included</span>
      </span>
    );
  if (value === false)
    return (
      <span className="text-ink-soft/50">
        <span aria-hidden="true">–</span>
        <span className="sr-only">Not included</span>
      </span>
    );
  if (value === 'soon')
    return <span className="rounded-full bg-violet/10 px-2 py-0.5 text-xs font-medium text-violet">Coming later</span>;
  return <span className="text-xs font-medium text-success">{value}</span>;
}

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 border-b border-border bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <SectionIntro
          kicker="Pricing"
          align="center"
          title="Simple monthly plans. Free for your customers, always."
          lead="These are launch prices. Every plan is free for now, and nothing is charged until we tell you first."
        />

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <li
              key={plan.id}
              className={`wb-reveal relative flex flex-col rounded-3xl border p-6 transition-transform duration-300 hover:-translate-y-1 ${
                plan.recommended
                  ? 'wb-shadow border-primary/40 bg-surface ring-1 ring-primary/30'
                  : 'border-border bg-surface/70'
              }`}
              style={delay(index * 70)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink">{plan.name}</h3>
                {plan.recommended && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[0.7rem] font-semibold text-white">
                    Recommended
                  </span>
                )}
              </div>
              <p className="mt-1.5 min-h-[2.5rem] text-sm leading-snug text-ink-soft">{plan.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-[-0.03em] tabular-nums text-ink">
                  {formatInr(plan.price)}
                </span>
                <span className="text-sm text-ink-soft">/month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 border-t border-border pt-6 text-sm">
                {plan.highlights.map((h) => (
                  <li key={h.label} className="flex items-start gap-2.5 text-ink">
                    <Icon
                      name={h.soon ? 'clock' : 'check'}
                      className={`mt-0.5 h-4 w-4 shrink-0 ${h.soon ? 'text-violet' : 'text-primary'}`}
                    />
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {h.label}
                      {h.soon && <StatusTag status="planned" />}
                    </span>
                  </li>
                ))}
              </ul>
              {plan.recommended ? (
                <MagneticLink
                  href="/login"
                  className="wb-cta wb-btn wb-btn-md mt-8 w-full bg-primary text-white"
                >
                  Get started
                </MagneticLink>
              ) : (
                <a
                  href="/login"
                  className="wb-btn wb-btn-md mt-8 w-full border border-border bg-surface text-ink transition-colors hover:border-ink/25"
                >
                  Get started
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="wb-reveal mt-6 flex flex-col items-center justify-center gap-2 text-center text-sm text-ink-soft sm:flex-row">
          <Icon name="shield" className="h-4 w-4 text-success" />
          Customers open and keep their digital receipts free, whichever plan you choose.
        </div>

        {/* Comparison. Scrolls inside its own box on small screens. */}
        <div className="mt-20">
          <h3 className="text-center text-2xl font-semibold tracking-tight text-ink">Compare plans</h3>
          <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-surface">
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">Features included in each wbill plan</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="w-[34%] px-5 py-4 text-left font-medium text-ink-soft">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      scope="col"
                      className={`px-3 py-4 text-center font-semibold ${plan.recommended ? 'bg-primary/5 text-primary' : 'text-ink'}`}
                    >
                      {plan.name}
                      <span className="block text-xs font-normal tabular-nums text-ink-soft">
                        {formatInr(plan.price)}/mo
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              {comparison.map((group) => (
                <tbody key={group.group}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={5}
                      className="bg-canvas/70 px-5 py-2.5 text-left text-xs font-semibold text-ink"
                    >
                      {group.group}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-t border-border/70 transition-colors hover:bg-canvas/50">
                      <th scope="row" className="px-5 py-3.5 text-left font-normal text-ink">
                        {row.label}
                      </th>
                      {row.cells.map((cell, i) => (
                        <td
                          key={plans[i].id}
                          className={`px-3 py-3.5 text-center ${plans[i].recommended ? 'bg-primary/5' : ''}`}
                        >
                          <CellValue value={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
