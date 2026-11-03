'use client';

import { useEffect, useRef, useState } from 'react';
import { formatInr } from '@/lib/currency';

const formats = {
  number: (n: number) => Math.round(n).toLocaleString('en-IN'),
  inr: (n: number) => formatInr(n),
  percent: (n: number) => `${Math.round(n)}%`,
};

/**
 * Counts from zero to `value` once the number scrolls into view. The final
 * value is server-rendered, so crawlers, no-JS and reduced-motion visitors
 * all read the real number; the count only replays it on screen.
 */
export default function CountUp({
  value,
  kind = 'number',
  duration = 1200,
}: {
  value: number;
  kind?: keyof typeof formats;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(value * (1 - Math.pow(1 - t, 3)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setShown(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {formats[kind](shown)}
    </span>
  );
}
