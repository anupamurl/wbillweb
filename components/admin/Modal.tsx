'use client';

import { useEffect, useRef } from 'react';

/**
 * A native <dialog> shown as a modal while mounted. Escape and a click on
 * the backdrop close it, unless `busy` (a save is running).
 */
export default function Modal({
  onClose,
  busy = false,
  wide = false,
  labelledBy,
  children,
}: {
  onClose: () => void;
  busy?: boolean;
  wide?: boolean;
  labelledBy: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onClose();
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] ${wide ? 'w-[min(40rem,calc(100vw-2rem))]' : 'w-[min(28rem,calc(100vw-2rem))]'} overflow-y-auto rounded-2xl border border-border bg-surface p-0 text-left text-ink shadow-xl backdrop:bg-ink/40`}
    >
      {children}
    </dialog>
  );
}
