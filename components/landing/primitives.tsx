import type { ReactNode } from 'react';
import { delay } from '@/lib/motion';

/**
 * Availability of a capability, stated plainly wherever it is shown.
 * "ready"   — built and shipping with the app at launch.
 * "partial" — some of it is built; the tag's label says which part.
 * "planned" — on the roadmap, not built yet.
 */
export type Availability = 'ready' | 'partial' | 'planned';

const tagStyles: Record<Availability, string> = {
  ready: 'border-success/25 bg-success/10 text-success',
  partial: 'border-primary/25 bg-primary/10 text-primary',
  planned: 'border-violet/25 bg-violet/10 text-violet',
};

const tagDefaults: Record<Availability, string> = {
  ready: 'Ready at launch',
  partial: 'Partly built',
  planned: 'Coming later',
};

export function StatusTag({ status }: { status: Availability }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium ${tagStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {tagDefaults[status]}
    </span>
  );
}

/** Every mockup on the page carries this so sample numbers are never read as real ones. */
export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-dashed border-ink-soft/40 bg-surface/80 px-2 py-0.5 text-[0.65rem] font-medium text-ink-soft ${className}`}
    >
      Demo data
    </span>
  );
}

export function SectionIntro({
  kicker,
  title,
  lead,
  align = 'left',
  children,
}: {
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  children?: ReactNode;
}) {
  const centered = align === 'center';
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {kicker && (
        <p className="wb-reveal text-sm font-medium text-primary">{kicker}</p>
      )}
      <h2
        className="wb-reveal wb-display mt-3 text-[2.25rem] text-ink sm:text-5xl"
        style={delay(60)}
      >
        {title}
      </h2>
      {lead && (
        <p
          className="wb-reveal mt-5 text-base leading-relaxed text-ink-soft sm:text-lg"
          style={delay(120)}
        >
          {lead}
        </p>
      )}
      {children}
    </div>
  );
}

/** Sub-section heading: one size everywhere below a section title. */
export const subHeading = 'wb-display text-3xl text-ink sm:text-[2.5rem]';

/** A window frame for product mockups. */
export function AppWindow({
  title,
  children,
  className = '',
  aside,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <div
      className={`wb-shadow overflow-hidden rounded-2xl border border-border ${className.includes("bg-") ? "" : "bg-surface"} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-canvas/70 px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
        </div>
        <p className="truncate text-xs font-medium text-ink-soft">{title}</p>
        <div className="flex items-center gap-2">{aside ?? <DemoBadge />}</div>
      </div>
      {children}
    </div>
  );
}
