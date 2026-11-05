import Link from 'next/link';
import Icon, { type IconName } from '@/components/Icon';

export default function EmptyState({
  icon,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  icon: IconName;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{body}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="wb-btn wb-btn-md mt-2 bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
