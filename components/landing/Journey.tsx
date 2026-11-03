'use client';

import { useState, type ReactNode } from 'react';
import Icon, { type IconName } from '@/components/Icon';
import { formatInr } from '@/lib/currency';
import { DemoBadge, SectionIntro, StatusTag, type Availability } from './primitives';
import { demoCustomer, demoInvoice, demoInvoiceNumber, demoKpis, demoShop } from '@/content/demo';

type Step = {
  icon: IconName;
  title: string;
  who: string;
  detail: string;
  status: Availability;
  mock: ReactNode;
};

function MockCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-border bg-surface p-5">{children}</div>;
}

const steps: Step[] = [
  {
    icon: 'receipt',
    title: 'Retailer creates the bill',
    who: 'At the counter',
    detail: 'Pick the customer, add products from your saved list and the GST on each line is worked out for you.',
    status: 'ready',
    mock: (
      <MockCard>
        <p className="text-xs text-ink-soft">New bill for {demoCustomer.name}</p>
        {demoInvoice.rows.map((row) => (
          <p key={row.name} className="mt-2 flex justify-between gap-3 text-sm">
            <span className="truncate text-ink">{row.name}</span>
            <span className="tabular-nums text-ink-soft">{formatInr(row.lineTotal)}</span>
          </p>
        ))}
        <p className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold text-ink">
          <span>Total incl. GST</span>
          <span className="tabular-nums">{formatInr(demoInvoice.total)}</span>
        </p>
      </MockCard>
    ),
  },
  {
    icon: 'chat',
    title: 'Customer gets it on WhatsApp',
    who: 'Seconds later',
    detail: 'The PDF arrives in a chat your customer already uses. There is nothing for them to install.',
    status: 'ready',
    mock: (
      <MockCard>
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-chat p-3 text-sm text-ink">
          <p className="font-medium">{demoInvoiceNumber}.pdf</p>
          <p className="mt-1 text-xs">Your bill from {demoShop.name} is attached.</p>
        </div>
      </MockCard>
    ),
  },
  {
    icon: 'document',
    title: 'The receipt is saved',
    who: 'For good',
    detail: 'Every bill is stored the moment it is issued, so it can be found and re-sent whenever it is asked for.',
    status: 'ready',
    mock: (
      <MockCard>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
            <Icon name="check" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{demoInvoiceNumber} stored</p>
            <p className="text-xs text-ink-soft">Searchable under {demoCustomer.name}</p>
          </div>
        </div>
      </MockCard>
    ),
  },
  {
    icon: 'shield',
    title: 'Warranty is on record',
    who: 'For the life of the product',
    detail: 'Serial number and cover period stay attached to the purchase, ready when a service request comes in.',
    status: 'planned',
    mock: (
      <MockCard>
        <p className="text-sm font-medium text-ink">1.5 Ton inverter split AC</p>
        <p className="text-xs tabular-nums text-ink-soft">SN-AC15-77821</p>
        <div className="mt-3 h-1.5 rounded-full bg-canvas">
          <div className="wb-barx h-full w-[4%] rounded-full bg-success" />
        </div>
        <p className="mt-1.5 text-xs text-ink-soft">12 months of cover, ends 3 Nov 2027</p>
      </MockCard>
    ),
  },
  {
    icon: 'chart',
    title: 'Retailer reviews sales',
    who: 'End of the month',
    detail: 'Totals, outstanding amounts and bill counts add up on their own from the bills you issued.',
    status: 'partial',
    mock: (
      <MockCard>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-ink-soft">Revenue</p>
            <p className="text-lg font-semibold tabular-nums text-ink">{formatInr(demoKpis.revenue)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft">Bills</p>
            <p className="text-lg font-semibold tabular-nums text-ink">{demoKpis.bills}</p>
          </div>
        </div>
      </MockCard>
    ),
  },
];

export default function Journey() {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <section id="journey" className="border-b border-border bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <SectionIntro
          kicker="How a sale flows"
          title="One purchase, five moments."
          lead="Follow a single sale from the counter to the monthly numbers. Select a step to see what happens."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 [&>*]:min-w-0">
          <ol className="self-start">
            {steps.map((s, index) => {
              const selected = index === active;
              const done = index < active;
              return (
                <li key={s.title} className="relative">
                  {/* Rail from this icon's centre to the next one's; none after the last step. */}
                  {index < steps.length - 1 && (
                    <span className="absolute left-[1.875rem] top-[1.875rem] h-full w-px bg-border" aria-hidden="true">
                      <span
                        className={`block h-full w-full origin-top bg-primary transition-transform duration-500 ease-out ${
                          index < active ? 'scale-y-100' : 'scale-y-0'
                        }`}
                      />
                    </span>
                  )}
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActive(index)}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(index)}
                    className={`flex w-full items-start gap-4 rounded-2xl p-2 text-left transition-colors duration-300 ${
                      selected ? 'bg-surface shadow-sm' : 'hover:bg-surface/60'
                    }`}
                  >
                    <span
                      className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                        selected
                          ? 'scale-105 border-primary bg-primary text-white'
                          : done
                            ? 'border-primary/40 bg-surface text-primary'
                            : 'border-border bg-surface text-ink-soft'
                      }`}
                    >
                      <Icon name={s.icon} className="h-5 w-5" />
                    </span>
                    <span className="py-1">
                      <span className="block text-xs text-ink-soft">
                        Step {index + 1}, {s.who.toLowerCase()}
                      </span>
                      <span className="mt-0.5 block font-semibold text-ink">{s.title}</span>
                      <span
                        className={`grid transition-all duration-300 ${selected ? 'mt-1.5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <span className="overflow-hidden text-sm leading-relaxed text-ink-soft lg:hidden">
                          {s.detail}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div key={active} className="wb-panel-in wb-shadow rounded-3xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusTag status={step.status} />
                <DemoBadge />
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight text-ink">{step.title}</h3>
              <p className="mt-2 hidden leading-relaxed text-ink-soft lg:block">{step.detail}</p>
              <div className="mt-6 rounded-2xl bg-canvas p-4">{step.mock}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
