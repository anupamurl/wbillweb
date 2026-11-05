'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import Icon, { type IconName } from '@/components/Icon';
import { AppWindow, StatusTag, type Availability } from './primitives';
import InvoiceDemo from './demos/InvoiceDemo';
import WarrantyDemo from './demos/WarrantyDemo';
import AnalyticsDemo from './demos/AnalyticsDemo';

type Tab = {
  id: string;
  label: string;
  icon: IconName;
  window: string;
  status: Availability;
  note: string;
  panel: ReactNode;
};

const tabs: Tab[] = [
  {
    id: 'billing',
    label: 'Digital billing',
    icon: 'receipt',
    window: 'New bill',
    status: 'ready',
    note: 'Items, labour charges, discount, optional GST, a clean PDF and sharing on WhatsApp are built and ship with the app.',
    panel: <InvoiceDemo />,
  },
  {
    id: 'analytics',
    label: 'Sales analytics',
    icon: 'chart',
    window: 'Insights',
    status: 'partial',
    note: 'Total sales, outstanding amount and bill count are ready at launch. Charts, top products and repeat customers come later.',
    panel: <AnalyticsDemo />,
  },
  {
    id: 'warranty',
    label: 'Warranty (phone shops)',
    icon: 'shield',
    window: 'Warranty',
    status: 'planned',
    note: 'Dedicated warranty records are on the roadmap. Useful for mobile, electronics and appliance shops. At launch you can note a serial number or IMEI in the item description.',
    panel: <WarrantyDemo />,
  },
];

export default function ProductDemo() {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const base = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = {
      ArrowRight: (active + 1) % tabs.length,
      ArrowLeft: (active - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = keys[event.key];
    setActive(next);
    setTouched(true);
    tabRefs.current[next]?.focus();
  }

  const current = tabs[active];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product demonstrations"
        onKeyDown={onKeyDown}
        className="wb-noscroll mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl border border-border bg-surface/80 p-1.5 shadow-sm backdrop-blur"
      >
        {tabs.map((tab, index) => {
          const selected = index === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              type="button"
              id={`${base}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setActive(index);
                setTouched(true);
              }}
              className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[0.8rem] font-medium transition-all duration-300 sm:px-4 sm:text-sm ${
                selected
                  ? 'bg-ink text-surface shadow-md'
                  : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <Icon name={tab.icon} className="hidden h-4 w-4 sm:block" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <p className="mx-auto mt-4 flex max-w-2xl flex-col items-center gap-2 text-center text-sm text-ink-soft sm:flex-row sm:justify-center sm:text-left">
        <StatusTag status={current.status} />
        <span>{current.note}</span>
      </p>

      <div className="relative mt-6">
        <div
          className="absolute -inset-x-6 -inset-y-8 -z-10 rounded-[3rem] bg-gradient-to-b from-primary/10 via-violet/5 to-transparent blur-2xl"
          aria-hidden="true"
        />
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${base}-panel-${tab.id}`}
            aria-labelledby={`${base}-tab-${tab.id}`}
            hidden={index !== active}
            tabIndex={0}
            className={index === active && touched ? 'wb-panel-in' : undefined}
          >
            <AppWindow title={`wbill / ${tab.window}`} className="bg-canvas">
              {tab.panel}
            </AppWindow>
          </div>
        ))}
      </div>
    </div>
  );
}
