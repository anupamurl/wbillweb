'use client';

import { useId, useMemo, useState } from 'react';
import { formatPaise } from '@/lib/currency';
import { formatRate } from '@/lib/gst';
import { itemKey, searchSuggestions, type Suggestion } from '@/lib/catalog';

/**
 * Item-name input that suggests products (the shop's own first, then its
 * business types' catalogues) as you type. ↑/↓ to move, Enter or a click
 * to pick, Esc to close. Picking fills the whole line (see `onPick`).
 * Typing a name that isn't suggested is always fine.
 */
export default function ItemCombobox({
  value,
  onChange,
  onPick,
  suggestions,
  className,
  placeholder = 'Item name',
}: {
  value: string;
  onChange: (text: string) => void;
  onPick: (s: Suggestion) => void;
  suggestions: Suggestion[];
  className: string;
  placeholder?: string;
}) {
  const listId = useId();
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => searchSuggestions(suggestions, value, 8), [suggestions, value]);
  // Don't keep offering the one product that's already been picked.
  const settled = results.length === 1 && itemKey(results[0].name) === itemKey(value);
  const open = focused && !dismissed && results.length > 0 && !settled;
  const current = Math.min(active, results.length - 1);

  function pick(s: Suggestion) {
    onPick(s);
    setDismissed(true);
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setDismissed(false);
          setActive(0);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (!open) {
            if (e.key === 'ArrowDown' && results.length) {
              setDismissed(false);
              e.preventDefault();
            }
            return;
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((current + 1) % results.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((current - 1 + results.length) % results.length);
          } else if (e.key === 'Enter') {
            e.preventDefault(); // pick, don't submit the bill
            pick(results[current]);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setDismissed(true);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${current}` : undefined}
        aria-label="Item name"
        maxLength={100}
        className={className}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 min-w-[16rem] overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-xl sm:right-auto sm:w-[26rem]"
        >
          {results.map((s, i) => (
            <li
              key={`${s.source}:${s.name}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === current}
              onMouseDown={(e) => e.preventDefault()} // keep focus in the input
              onClick={() => pick(s)}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${i === current ? 'bg-primary/10' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">
                  <Highlight text={s.name} query={value} />
                </p>
                <p className="truncate text-[0.7rem] text-ink-soft">
                  {s.source === 'mine' ? 'My item' : s.segment || 'Catalogue'} · GST {formatRate(s.gst)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatPaise(s.price)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Bolds each typed word where it appears in the name. */
function Highlight({ text, query }: { text: string; query: string }) {
  const words = itemKey(query).split(' ').filter(Boolean);
  if (!words.length) return <>{text}</>;
  const lower = text.toLowerCase();
  const marks = new Array<boolean>(text.length).fill(false);
  for (const w of words) {
    const at = lower.indexOf(w);
    if (at >= 0) for (let k = at; k < at + w.length; k++) marks[k] = true;
  }
  const parts: { s: string; on: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.on === marks[i]) last.s += text[i];
    else parts.push({ s: text[i], on: marks[i] });
  }
  return (
    <>
      {parts.map((p, i) =>
        p.on ? (
          <strong key={i} className="font-semibold text-primary">
            {p.s}
          </strong>
        ) : (
          <span key={i}>{p.s}</span>
        ),
      )}
    </>
  );
}
