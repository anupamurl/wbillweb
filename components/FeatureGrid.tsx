import type { ReactNode } from 'react';
import Icon, { type IconName } from './Icon';
import { SectionIntro, StatusTag, type Availability } from './landing/primitives';
import { formatInr } from '@/lib/currency';
import { delay } from '@/lib/motion';
import { demoInvoice, demoRevenue } from '@/content/demo';

/* Miniature previews. Decorative: the card text carries the meaning. */

function BillingPreview() {
  return (
    <div className="grid grid-cols-[1fr_auto] items-end gap-4">
      <div className="rounded-xl border border-border bg-surface p-4 text-xs">
        {demoInvoice.rows.slice(0, 2).map((row) => (
          <p key={row.name} className="flex justify-between gap-3 py-1 text-ink-soft">
            <span className="truncate">{row.name}</span>
            <span className="tabular-nums text-ink">{formatInr(row.lineTotal)}</span>
          </p>
        ))}
        <p className="mt-1 flex justify-between border-t border-border pt-2 font-semibold text-ink">
          <span>Total</span>
          <span className="tabular-nums">{formatInr(demoInvoice.total)}</span>
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="wb-hover-slide rounded-lg bg-error/10 px-2.5 py-1.5 text-[0.65rem] font-bold text-error">PDF</span>
        <span className="wb-hover-slide rounded-lg bg-success/15 px-2.5 py-1.5 text-[0.65rem] font-semibold text-success" style={delay(80)}>
          Sent
        </span>
      </div>
    </div>
  );
}

function RecordsPreview() {
  return (
    <div className="space-y-1.5">
      {['BILL-0142', 'BILL-0131', 'BILL-0097'].map((id, i) => (
        <div
          key={id}
          className="wb-hover-slide flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs"
          style={delay(i * 60)}
        >
          <span className="tabular-nums text-ink">{id}</span>
          <span className="text-ink-soft">Ramesh K.</span>
        </div>
      ))}
    </div>
  );
}

function WarrantyPreview() {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 text-xs">
      <p className="flex justify-between text-ink-soft">
        <span>IMEI 35 2098…210 1</span>
        <span className="font-medium text-success">Active</span>
      </p>
      <div className="mt-2.5 h-1.5 rounded-full bg-canvas">
        <div className="wb-barx h-full w-1/3 rounded-full bg-success" />
      </div>
    </div>
  );
}

function OrdersPreview() {
  const stages = [
    { label: 'Pending', tone: 'bg-warning' },
    { label: 'Processing', tone: 'bg-primary' },
    { label: 'Delivered', tone: 'bg-success' },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {stages.map((stage, i) => (
        <span
          key={stage.label}
          className="wb-hover-slide flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-2 text-[0.68rem] text-ink"
          style={delay(i * 70)}
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stage.tone}`} />
          {stage.label}
        </span>
      ))}
    </div>
  );
}

function CustomersPreview() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
      {['RM', 'AK', 'SP', 'NV'].map((initials, i) => (
        <span
          key={initials}
          className="wb-hover-slide flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-primary/15 text-[0.65rem] font-semibold text-primary"
          style={delay(i * 50)}
        >
          {initials}
        </span>
      ))}
      </div>
      <span className="text-xs text-ink-soft">and 120 more</span>
    </div>
  );
}

function AnalyticsPreview() {
  const max = Math.max(...demoRevenue.map((d) => d.value));
  return (
    <div className="flex h-24 items-end gap-1.5">
      {demoRevenue.map((d, i) => (
        <span
          key={d.label}
          className="wb-hover-grow block flex-1 rounded-t bg-primary/30"
          style={{ height: `${(d.value / max) * 100}%`, ...delay(i * 25) }}
        />
      ))}
    </div>
  );
}

const features: Array<{
  icon: IconName;
  title: string;
  description: string;
  status: Availability;
  span: string;
  preview: ReactNode;
}> = [
  {
    icon: 'receipt',
    title: 'Digital billing',
    description:
      'Simple bills with items, quantity, labour or service charges and discount. Add GST only if you need it. A clean PDF, shared on WhatsApp in one tap.',
    status: 'ready',
    span: 'lg:col-span-4',
    preview: <BillingPreview />,
  },
  {
    icon: 'document',
    title: 'Every bill saved',
    description: 'Search any customer’s bills by name and send the PDF again while they wait.',
    status: 'ready',
    span: 'lg:col-span-2',
    preview: <RecordsPreview />,
  },
  {
    icon: 'shield',
    title: 'Warranty for phone & electronics shops',
    description: 'Serial number or IMEI, purchase date and warranty, kept with each sale.',
    status: 'planned',
    span: 'lg:col-span-2',
    preview: <WarrantyPreview />,
  },
  {
    icon: 'layers',
    title: 'Order management',
    description: 'Follow every order or job from pending to in progress to delivered.',
    status: 'planned',
    span: 'lg:col-span-2',
    preview: <OrdersPreview />,
  },
  {
    icon: 'users',
    title: 'Customer management',
    description: 'Save a customer once and see every bill you have given them.',
    status: 'ready',
    span: 'lg:col-span-2',
    preview: <CustomersPreview />,
  },
  {
    icon: 'chart',
    title: 'Sales analytics',
    description:
      'Today’s sales, pending amount and bill count at launch. Monthly trends, top items and repeat customers next.',
    status: 'partial',
    span: 'lg:col-span-6',
    preview: <AnalyticsPreview />,
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <SectionIntro
          kicker="Features"
          title="Everything a small business needs from a bill."
          lead="Built around the bill you already give — at a shop counter or after a job. Each card says plainly whether it is ready at launch or still coming."
        />

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {features.map((feature, index) => {
            const wide = feature.span === 'lg:col-span-6';
            return (
              <li
                key={feature.title}
                className={`wb-tile wb-reveal group flex flex-col gap-8 rounded-3xl border border-border bg-canvas p-6 sm:p-7 ${feature.span} ${
                  wide ? 'sm:col-span-2 lg:flex-row lg:items-end' : ''
                } ${index === 0 ? 'sm:col-span-2' : ''}`}
                style={delay((index % 3) * 70)}
              >
                <div className={wide ? 'lg:w-[26rem]' : ''}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="wb-tile-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon name={feature.icon} className="h-5 w-5" />
                    </span>
                    <StatusTag status={feature.status} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-[-0.015em] text-ink">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.description}</p>
                </div>
                <div className={`wb-tile-preview mt-auto ${wide ? 'lg:ml-auto lg:w-[28rem]' : ''}`} aria-hidden="true">
                  {feature.preview}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
