import Link from 'next/link';
import Icon from '@/components/Icon';
import { delay } from '@/lib/motion';
import { comparison, plans, type Cell } from '@/content/pricing';

const statusLabel = { app: 'In the mobile app', soon: 'Coming soon' } as const;

function StatusNote({ status }: { status: 'app' | 'soon' }) {
  return (
    <span className={`ml-1.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.65rem] font-medium ${status === 'app' ? 'bg-primary/10 text-primary' : 'bg-canvas-deep text-ink-soft'}`}>
      {statusLabel[status]}
    </span>
  );
}

export function PlanCards({ headingLevel = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan, index) => (
        <article
          key={plan.id}
          className={`wb-reveal relative flex flex-col rounded-3xl p-7 ${
            plan.recommended ? 'bg-ink text-canvas wb-shadow-lg' : 'border border-line bg-surface'
          }`}
          style={delay(index * 70)}
        >
          <div className="flex items-center justify-between gap-2">
            <Heading className="text-base font-semibold tracking-[-0.01em]">{plan.name}</Heading>
            {plan.recommended && (
              <span className="rounded-full bg-canvas/15 px-2.5 py-1 text-[0.68rem] font-medium">Recommended</span>
            )}
          </div>
          <p className="mt-6 flex items-baseline gap-1.5">
            <span className="text-[2.6rem] font-semibold leading-none tracking-[-0.045em] tabular">₹{plan.price}</span>
            <span className={`text-sm ${plan.recommended ? 'text-canvas/60' : 'text-ink-soft'}`}>/ month</span>
          </p>
          <p className={`mt-4 min-h-[3rem] text-sm leading-relaxed ${plan.recommended ? 'text-canvas/70' : 'text-ink-soft'}`}>{plan.blurb}</p>

          <ul className={`mt-6 flex-1 space-y-3 border-t pt-6 text-sm ${plan.recommended ? 'border-canvas/15' : 'border-line'}`}>
            {plan.highlights.map((h) => (
              <li key={h.label} className="flex gap-2.5">
                <Icon name="check" className={`mt-0.5 h-4 w-4 shrink-0 ${plan.recommended ? 'text-canvas/70' : 'text-primary'}`} />
                <span>
                  {h.label}
                  {h.status && (
                    <span className={plan.recommended ? '[&>span]:bg-canvas/15 [&>span]:text-canvas/80' : ''}>
                      <StatusNote status={h.status} />
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/signup/"
            className={`wb-btn wb-btn-md group mt-8 w-full ${plan.recommended ? 'bg-canvas text-ink hover:bg-canvas/90' : plan.id === 'free' ? 'wb-btn-primary' : 'wb-btn-secondary'}`}
            aria-label={plan.id === 'free' ? 'Get started free' : `Get started — ${plan.name} plan`}
          >
            {plan.id === 'free' ? 'Get started free' : 'Get started'}
            <Icon name="arrow" className="wb-arrow h-4 w-4" />
          </Link>
        </article>
      ))}
    </div>
  );
}

export function PricingNote() {
  return (
    <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-ink-soft">
      Every account starts on Free. Paid plans aren’t billed yet — no card is needed, and we’ll tell you before
      anything is ever charged. Prices in Indian rupees.
    </p>
  );
}

function CellValue({ value, recommended }: { value: Cell; recommended?: boolean }) {
  if (value === true) return <Icon name="check" className={`mx-auto h-4 w-4 ${recommended ? 'text-ink' : 'text-primary'}`} />;
  if (value === false) return <span className="text-ink-faint" aria-label="Not included">—</span>;
  if (value === 'app' || value === 'soon') return <StatusNote status={value} />;
  return <span className="text-xs font-medium text-ink">{value}</span>;
}

function cellText(value: Cell) {
  if (value === true) return 'Included';
  if (value === false) return 'Not included';
  if (value === 'app') return 'In the mobile app';
  if (value === 'soon') return 'Coming soon';
  return value;
}

/** Desktop: one table. Mobile: one list per plan, so nothing scrolls sideways. */
export function ComparisonTable() {
  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-line bg-surface md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">What each WBill plan includes</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-[34%] px-6 py-5 text-left font-medium text-ink-soft">
                Compare plans
              </th>
              {plans.map((plan) => (
                <th key={plan.id} scope="col" className={`px-4 py-5 text-center font-semibold text-ink ${plan.recommended ? 'bg-canvas-deep' : ''}`}>
                  {plan.name}
                  <span className="block text-xs font-normal text-ink-soft tabular">₹{plan.price}/mo</span>
                </th>
              ))}
            </tr>
          </thead>
          {comparison.map((group) => (
            <tbody key={group.group}>
              <tr>
                <th scope="colgroup" colSpan={5} className="bg-canvas px-6 pb-2 pt-6 text-left font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-faint">
                  {group.group}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <th scope="row" className="px-6 py-3.5 text-left font-normal text-ink">
                    {row.label}
                  </th>
                  {row.cells.map((cell, index) => (
                    <td key={index} className={`px-4 py-3.5 text-center ${plans[index].recommended ? 'bg-canvas-deep' : ''}`}>
                      <CellValue value={cell} recommended={plans[index].recommended} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {plans.map((plan, planIndex) => (
          <details key={plan.id} className="wb-acc group rounded-3xl border border-line bg-surface" open={planIndex === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <span>
                <span className="block font-semibold text-ink">{plan.name}</span>
                <span className="text-sm text-ink-soft tabular">₹{plan.price} / month</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink">
                <span className="wb-chevron text-lg leading-none">+</span>
              </span>
            </summary>
            <div className="border-t border-line px-5 pb-5">
              {comparison.map((group) => (
                <div key={group.group}>
                  <p className="pb-1 pt-5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-faint">{group.group}</p>
                  <ul>
                    {group.rows.map((row) => {
                      const cell = row.cells[planIndex];
                      return (
                        <li key={row.label} className="flex items-center justify-between gap-4 border-b border-line py-3 text-sm last:border-0">
                          <span className={cell === false ? 'text-ink-faint' : 'text-ink'}>{row.label}</span>
                          <span className="shrink-0">
                            <span className="sr-only">{cellText(cell)}</span>
                            <span aria-hidden="true">
                              <CellValue value={cell} />
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
