'use client';

import Icon from '@/components/Icon';
import { GST_MODES, GST_MODE_LABELS, type GstMode } from '@/lib/gst';
import type { Segment } from '@/lib/segments';

/** Checkbox grid of segments (business types). Hidden when the admin hasn't created any. */
export function SegmentPicker({
  segments,
  value,
  onChange,
  disabled,
}: {
  segments: Segment[] | null;
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  if (segments === null) return <p className="text-sm text-ink-soft">Loading business types…</p>;
  if (segments.length === 0) return null;
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <fieldset>
      <legend className="text-xs font-medium text-ink-soft">What do you sell? Pick all that apply</legend>
      <p className="mt-0.5 text-xs text-ink-faint">We&rsquo;ll suggest these products, with price and GST, while you make bills.</p>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {segments.map((s) => {
          const checked = value.includes(s.id);
          return (
            <label
              key={s.id}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                checked ? 'border-primary bg-primary/5 text-ink' : 'border-border text-ink-soft hover:bg-ink/5'
              } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(s.id)} disabled={disabled} />
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked ? 'border-primary bg-primary text-white' : 'border-line-strong bg-surface'}`}
              >
                {checked && <Icon name="check" className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** How prices and GST work on the shop's bills. */
export function GstModePicker({ value, onChange, disabled }: { value: GstMode; onChange: (m: GstMode) => void; disabled?: boolean }) {
  return (
    <fieldset>
      <legend className="text-xs font-medium text-ink-soft">GST on bills</legend>
      <div className="mt-2 flex flex-col gap-2">
        {GST_MODES.map((m) => (
          <label
            key={m}
            className={`flex cursor-pointer gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
              value === m ? 'border-primary bg-primary/5' : 'border-border hover:bg-ink/5'
            } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input type="radio" name="gst-mode" checked={value === m} onChange={() => onChange(m)} disabled={disabled} className="mt-0.5 accent-[var(--color-primary)]" />
            <span>
              <span className="block font-medium text-ink">{GST_MODE_LABELS[m].title}</span>
              <span className="mt-0.5 block text-xs text-ink-soft">{GST_MODE_LABELS[m].body}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
