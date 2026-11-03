'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import Icon, { type IconName } from '@/components/Icon';
import { formatInr } from '@/lib/currency';
import { DemoBadge, SectionIntro, subHeading } from './primitives';

type Industry = {
  id: string;
  label: string;
  icon: IconName;
  headline: string;
  useCase: string;
  product: { name: string; price: number; gst: number };
  fields: Array<[string, string]>;
  record: string[];
};

const industries: Industry[] = [
  {
    id: 'electronics',
    label: 'Electronics',
    icon: 'bolt',
    headline: 'Every TV, speaker and laptop, traceable to its sale.',
    useCase:
      'A customer comes back with a faulty soundbar. Search their name, open the bill and the serial number and purchase date are right there.',
    product: { name: 'Bluetooth soundbar 300 W', price: 6999, gst: 18 },
    fields: [
      ['Serial number', 'SN-SB300-41187'],
      ['Purchase date', '14 Aug 2026'],
      ['Warranty', '12 months'],
    ],
    record: ['Serial numbers', 'Warranty period', 'Purchase records'],
  },
  {
    id: 'mobile',
    label: 'Mobile shops',
    icon: 'phone',
    headline: 'IMEI on the bill, not on a sticky note.',
    useCase:
      'Record the handset’s IMEI, model and colour on the invoice, so a warranty claim or a lost-phone report starts with the right details.',
    product: { name: 'Smartphone 8 GB / 128 GB, blue', price: 18643, gst: 18 },
    fields: [
      ['IMEI 1', '35 209876 543210 1'],
      ['IMEI 2', '35 209876 543211 9'],
      ['Warranty', '12 months'],
    ],
    record: ['IMEI and device details', 'Invoices', 'Warranty information'],
  },
  {
    id: 'appliances',
    label: 'Home appliances',
    icon: 'layers',
    headline: 'From delivery day to the third service visit.',
    useCase:
      'Note the installation date and address with the sale, then keep the warranty period and every service call in the same history.',
    product: { name: 'Front-load washing machine 8 kg', price: 32490, gst: 18 },
    fields: [
      ['Installed', '20 Sep 2026, Saket'],
      ['Warranty', '24 months, motor 10 years'],
      ['Service history', '1 visit'],
    ],
    record: ['Installation details', 'Warranty periods', 'Service history'],
  },
];

export default function Industries() {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const base = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const industry = industries[active];
  const tax = Math.round((industry.product.price * industry.product.gst) / 100);

  function onKeyDown(event: KeyboardEvent) {
    const next =
      event.key === 'ArrowRight' ? (active + 1) % industries.length
      : event.key === 'ArrowLeft' ? (active - 1 + industries.length) % industries.length
      : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    setTouched(true);
    refs.current[next]?.focus();
  }

  return (
    <section id="industries" className="scroll-mt-20 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="flex flex-col gap-8">
          <SectionIntro
            kicker="Industries"
            title="Built first for the shops that sell things with serial numbers."
          />
          <div
            role="tablist"
            aria-label="Choose your industry"
            onKeyDown={onKeyDown}
            className="wb-noscroll flex w-full gap-1 overflow-x-auto rounded-2xl border border-border bg-canvas p-1.5 sm:w-fit"
          >
            {industries.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    refs.current[index] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`${base}-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`${base}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => {
                    setActive(index);
                    setTouched(true);
                  }}
                  className={`flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[0.8rem] sm:px-4 sm:text-sm font-medium transition-all duration-300 ${
                    selected ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icon name={item.icon} className="hidden h-4 w-4 sm:block" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={industry.id}
          role="tabpanel"
          id={`${base}-panel`}
          aria-labelledby={`${base}-${industry.id}`}
          className={`mt-12 grid gap-8 lg:grid-cols-2 lg:gap-14 ${touched ? 'wb-panel-in' : ''}`}
        >
          <div className="wb-stagger">
            <h3 className={subHeading}>{industry.headline}</h3>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{industry.useCase}</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {industry.record.map((entry) => (
                <li key={entry} className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-ink">
                  {entry}
                </li>
              ))}
            </ul>
            <p className="mt-7 rounded-2xl border border-violet/25 bg-violet/5 p-4 text-sm leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">What works at launch: </span>
              GST bills, PDFs and WhatsApp sharing, with details like these written in the item
              description. Dedicated fields for serials, IMEI, installation and service history
              are coming later.
            </p>
          </div>

          <div className="wb-shadow rounded-3xl border border-border bg-surface p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">Bill line</p>
              <DemoBadge />
            </div>
            <div className="mt-5 rounded-2xl bg-canvas p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-ink">{industry.product.name}</p>
                <p className="shrink-0 font-semibold tabular-nums text-ink">{formatInr(industry.product.price)}</p>
              </div>
              <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
                {industry.fields.map(([term, value]) => (
                  <div key={term} className="flex justify-between gap-4">
                    <dt className="text-ink-soft">{term}</dt>
                    <dd className="text-right font-medium tabular-nums text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <dl className="mt-5 space-y-1.5 text-sm">
              <div className="flex justify-between text-ink-soft">
                <dt>GST {industry.product.gst}%</dt>
                <dd className="tabular-nums">{formatInr(tax)}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold text-ink">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatInr(industry.product.price + tax)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
