'use client';

import { useState } from 'react';
import { formatInr } from '@/lib/currency';
import { delay } from '@/lib/motion';
import { demoRevenue } from '@/content/demo';

/**
 * Monthly revenue bars. Hover, focus or tap a bar to read its value;
 * the latest month is selected by default so the readout is never empty.
 */
export default function RevenueChart({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(demoRevenue.length - 1);
  const max = Math.max(...demoRevenue.map((d) => d.value));
  const point = demoRevenue[active];

  return (
    <figure>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-ink-soft">Revenue, last 12 months</span>
        <span className="text-sm font-semibold tabular-nums text-ink" aria-live="polite">
          {point.label}: {formatInr(point.value)}
        </span>
      </figcaption>
      <div
        className={`mt-4 flex items-end gap-1.5 sm:gap-2 ${compact ? 'h-28' : 'h-40 sm:h-48'}`}
        role="group"
        aria-label="Monthly revenue, demo data"
      >
        {demoRevenue.map((d, index) => {
          const selected = index === active;
          return (
            <button
              key={d.label}
              type="button"
              aria-label={`${d.label}: ${formatInr(d.value)}`}
              aria-pressed={selected}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              className="group flex h-full flex-1 flex-col justify-end rounded-md focus-visible:outline-offset-4"
            >
              <span
                className={`wb-bar block w-full rounded-t-md transition-colors duration-200 ${
                  selected ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'
                }`}
                style={{ height: `${(d.value / max) * 100}%`, ...delay(index * 35) }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 text-center text-[0.65rem] text-ink-soft sm:gap-2" aria-hidden="true">
        {demoRevenue.map((d) => (
          <span key={d.label} className="flex-1">
            {d.label.slice(0, compact ? 1 : 3)}
          </span>
        ))}
      </div>
    </figure>
  );
}
