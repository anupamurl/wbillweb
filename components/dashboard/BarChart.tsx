'use client';

type Point = { label: string; value: number };

export default function BarChart({ points, formatValue, ariaLabel }: { points: Point[]; formatValue: (v: number) => string; ariaLabel: string }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const allZero = points.every((p) => p.value === 0);

  return (
    <div>
      <div className="flex h-32 items-end gap-1.5 sm:gap-2" role="group" aria-label={ariaLabel}>
        {points.map((p, index) => (
          <div key={`${p.label}-${index}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[0.65rem] text-ink-soft opacity-0 transition-opacity group-hover:opacity-100">
              {p.value > 0 ? formatValue(p.value) : ''}
            </span>
            <span
              className="wb-bar block w-full rounded-t-md bg-primary/70 transition-colors group-hover:bg-primary"
              style={{ height: allZero ? '2px' : `${Math.max((p.value / max) * 100, p.value > 0 ? 4 : 0)}%` }}
              title={`${p.label}: ${formatValue(p.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-center text-[0.65rem] text-ink-soft sm:gap-2">
        {points.map((p, index) => (
          <span key={`${p.label}-${index}`} className="flex-1 truncate">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
