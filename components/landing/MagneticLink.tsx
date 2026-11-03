'use client';

import { useRef, type ReactNode, type PointerEvent } from 'react';

/**
 * A link that leans a few pixels toward the pointer. The pull is capped,
 * only runs for fine pointers, and is skipped for reduced motion — focus,
 * keyboard activation and hit area are those of a plain anchor.
 */
export default function MagneticLink({
  href,
  children,
  className = '',
  strength = 0.22,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMove(event: PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el || event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (event.clientY - (rect.top + rect.height / 2)) * strength;
    el.style.setProperty('--mx', `${Math.max(-8, Math.min(8, x))}px`);
    el.style.setProperty('--my', `${Math.max(-6, Math.min(6, y))}px`);
  }

  function reset() {
    ref.current?.style.setProperty('--mx', '0px');
    ref.current?.style.setProperty('--my', '0px');
  }

  return (
    <a ref={ref} href={href} onPointerMove={handleMove} onPointerLeave={reset} className={className}>
      {children}
    </a>
  );
}
