import type { CSSProperties } from 'react';

/**
 * Stagger helper. The animation utilities in `globals.css` all read
 * `--wb-delay`, so a component only has to hand each child its offset.
 */
export function delay(ms: number): CSSProperties {
  return { '--wb-delay': `${ms}ms` } as CSSProperties;
}

/** Per-blob timing for the hero's decorative aurora. */
export function drift(ms: number, durationSeconds: number): CSSProperties {
  return { '--wb-delay': `${ms}ms`, '--wb-dur': `${durationSeconds}s` } as CSSProperties;
}
