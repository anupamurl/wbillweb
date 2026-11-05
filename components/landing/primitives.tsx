import type { ReactNode } from 'react';
import { delay } from '@/lib/motion';

/**
 * Availability of a capability, stated plainly wherever it is shown.
 * "live"    — available now, on the web dashboard.
 * "app"     — built into the WBill mobile app (coming to the App Store and Google Play).
 * "planned" — on the roadmap, not built yet.
 */
export type Availability = 'live' | 'app' | 'planned';

const tagStyles: Record<Availability, string> = {
  live: 'text-success',
  app: 'text-primary',
  planned: 'text-ink-faint',
};

export const availabilityLabel: Record<Availability, string> = {
  live: 'Available now',
  app: 'In the mobile app',
  planned: 'Planned',
};

export function StatusTag({ status, className = '' }: { status: Availability; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[0.7rem] font-medium leading-none ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${tagStyles[status]}`} aria-hidden="true" />
      <span className="text-ink-soft">{availabilityLabel[status]}</span>
    </span>
  );
}

/** Every mockup carries this so sample numbers are never read as real ones. */
export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-dashed border-ink-faint/60 bg-surface/90 px-[0.75em] py-[0.2em] font-mono text-[0.6em] font-medium uppercase tracking-[0.08em] text-ink-soft backdrop-blur ${className}`}
    >
      Demo data
    </span>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`wb-eyebrow ${className}`}>{children}</p>;
}

export function SectionIntro({
  eyebrow,
  title,
  lead,
  align = 'left',
  id,
  children,
  className = '',
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
  children?: ReactNode;
  className?: string;
}) {
  const centered = align === 'center';
  return (
    <div className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}>
      {eyebrow && <Eyebrow className="wb-reveal">{eyebrow}</Eyebrow>}
      <h2 id={id} className="wb-reveal wb-h2 mt-5 text-ink" style={delay(60)}>
        {title}
      </h2>
      {lead && (
        <p className={`wb-reveal wb-lead mt-6 ${centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`} style={delay(120)}>
          {lead}
        </p>
      )}
      {children}
    </div>
  );
}
