'use client';

import { useId, useState } from 'react';
import Icon, { type IconName } from '@/components/Icon';
import type { SeriesPoint, UserRow } from '@/lib/admin/stats';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="wb-display text-2xl text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
  flush,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface ${className}`}>
      {title && (
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </section>
  );
}

export function Kpi({
  label,
  value,
  icon,
  delta,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  icon: IconName;
  delta?: number | null;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ${accent ? 'border-primary/30 bg-primary text-white' : 'border-border bg-surface'}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${accent ? 'text-white/80' : 'text-ink-soft'}`}>{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary'}`}>
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.65rem] ${accent ? 'text-white' : 'text-ink'}`}>{value}</p>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        {delta !== undefined && <Delta value={delta} onAccent={accent} />}
        {hint && <span className={accent ? 'text-white/75' : 'text-ink-soft'}>{hint}</span>}
      </div>
    </div>
  );
}

export function Delta({ value, onAccent }: { value: number | null; onAccent?: boolean }) {
  if (value === null) return <span className={`rounded-md px-1.5 py-0.5 font-medium ${onAccent ? 'bg-white/15' : 'bg-primary/10 text-primary'}`}>New</span>;
  const up = value >= 0;
  const cls = onAccent ? 'bg-white/15 text-white' : up ? 'bg-success/10 text-success' : 'bg-error/10 text-error';
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums ${cls}`}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(Math.abs(value) < 10 ? 1 : 0)}%
    </span>
  );
}

const statusStyles: Record<UserRow['status'], string> = {
  active: 'bg-success/10 text-success',
  idle: 'bg-warning/10 text-warning',
  dormant: 'bg-ink/5 text-ink-soft',
  new: 'bg-primary/10 text-primary',
};
const statusLabels: Record<UserRow['status'], string> = { active: 'Active', idle: 'Idle', dormant: 'Dormant', new: 'No bills yet' };

export function StatusBadge({ status }: { status: UserRow['status'] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${statusStyles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}

export function BlockedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2 py-0.5 text-[0.7rem] font-medium text-error">
      <span className="h-1.5 w-1.5 rounded-full bg-error" />
      Blocked
    </span>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?';
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const hue = Math.abs(hash) % 360;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl text-xs font-semibold"
      style={{ width: size, height: size, background: `hsl(${hue} 70% 50% / 0.14)`, color: `hsl(${hue} 60% 42%)` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">{placeholder}</span>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

export function Select<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ToolbarButton({ onClick, children, icon }: { onClick: () => void; children: React.ReactNode; icon?: IconName }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
    >
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function SortTh<K extends string>({
  label,
  k,
  sort,
  onSort,
  align = 'left',
}: {
  label: string;
  k: K;
  sort: { key: K; dir: 'asc' | 'desc' };
  onSort: (k: K) => void;
  align?: 'left' | 'right';
}) {
  const active = sort.key === k;
  return (
    <th scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={`px-4 py-3 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button type="button" onClick={() => onSort(k)} className={`inline-flex items-center gap-1 hover:text-ink ${active ? 'text-ink' : ''}`}>
        {label}
        <span className={`text-[0.6rem] ${active ? 'opacity-100' : 'opacity-30'}`}>{active && sort.dir === 'asc' ? '▲' : '▼'}</span>
      </button>
    </th>
  );
}

export function Empty({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink/5 text-ink-soft">
        <Icon name="layers" className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-xs text-ink-soft">{body}</p>}
    </div>
  );
}

/**
 * Area chart with a hover crosshair and tooltip. Pure SVG, scales to its
 * container; the viewBox is fixed and the strokes don't scale.
 */
export function AreaChart({
  points,
  format,
  formatSecondary,
  secondaryLabel,
  height = 220,
}: {
  points: SeriesPoint[];
  format: (v: number) => string;
  formatSecondary?: (v: number) => string;
  secondaryLabel?: string;
  height?: number;
}) {
  const id = useId().replace(/:/g, '');
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = height;
  const padL = 8;
  const padR = 8;
  const padT = 16;
  const padB = 26;
  const max = Math.max(1, ...points.map((p) => p.value));
  const n = points.length;
  const x = (i: number) => padL + (n <= 1 ? 0 : (i / (n - 1)) * (W - padL - padR));
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(n - 1)},${H - padB} L${x(0)},${H - padB} Z`;
  const labelEvery = Math.max(1, Math.ceil(n / 8));
  const hp = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label={`Chart: ${points.map((p) => `${p.label} ${format(p.value)}`).join(', ')}`}
        onMouseLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const rx = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((rx - padL) / (W - padL - padR)) * (n - 1));
          setHover(Math.min(n - 1, Math.max(0, i)));
        }}
      >
        <defs>
          <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wbill-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--wbill-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={padL} x2={W - padR} y1={y(max * f)} y2={y(max * f)} stroke="var(--wb-line)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="var(--wb-line-strong)" vectorEffect="non-scaling-stroke" />
        <path d={area} fill={`url(#g${id})`} />
        <path d={line} fill="none" stroke="var(--wbill-primary)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize="11" fill="var(--wb-ink-faint)">
              {p.label}
            </text>
          ) : null,
        )}
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="var(--wb-line-strong)" vectorEffect="non-scaling-stroke" />
            <circle cx={x(hover)} cy={y(points[hover].value)} r="4.5" fill="var(--wbill-surface)" stroke="var(--wbill-primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {hp && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg"
          style={{ left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%` }}
        >
          <p className="font-medium text-ink-soft">{hp.label}</p>
          <p className="mt-0.5 font-semibold tabular-nums text-ink">{format(hp.value)}</p>
          {formatSecondary && hp.secondary !== undefined && (
            <p className="tabular-nums text-ink-soft">
              {formatSecondary(hp.secondary)} {secondaryLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Vertical bars with hover values. */
export function Bars({ points, format, height = 160 }: { points: SeriesPoint[]; format: (v: number) => string; height?: number }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const labelEvery = Math.max(1, Math.ceil(points.length / 12));
  return (
    <div>
      <div className="flex items-end gap-1" style={{ height }} role="img" aria-label={points.map((p) => `${p.label} ${format(p.value)}`).join(', ')}>
        {points.map((p, i) => (
          <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
            <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-[0.65rem] font-medium text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              {p.label}: {format(p.value)}
            </span>
            <span
              className="block w-full rounded-t bg-primary/60 transition-colors group-hover:bg-primary"
              style={{ height: p.value === 0 ? 2 : `${Math.max(4, (p.value / max) * 100)}%`, opacity: p.value === 0 ? 0.35 : 1 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1 text-center text-[0.62rem] text-ink-faint">
        {points.map((p, i) => (
          <span key={i} className="flex-1 truncate">
            {i % labelEvery === 0 ? p.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A horizontal share bar, for ranked lists. */
export function ShareBar({ fraction }: { fraction: number }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
      <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(2, Math.min(100, fraction * 100))}%` }} />
    </span>
  );
}

export function relativeTime(d: Date | null): string {
  if (!d) return '—';
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDate(d: Date | null, withTime = false): string {
  if (!d) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  });
}
