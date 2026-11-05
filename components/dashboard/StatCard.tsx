import Icon, { type IconName } from '@/components/Icon';

export default function StatCard({ label, value, icon, hint }: { label: string; value: string; icon: IconName; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <dt className="text-xs text-ink-soft">{label}</dt>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name={icon} className="h-3.5 w-3.5" />
        </span>
      </div>
      <dd className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-[1.7rem]">{value}</dd>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
