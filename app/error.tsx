'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Catches any client-side error below the root layout, so a failure shows
 * a readable message (and the header and footer) instead of a blank
 * "Application error" screen. The message is shown so users can report it.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('WBill page error:', error);
  }, [error]);

  return (
    <main className="wb-container flex min-h-[60vh] flex-col justify-center py-24">
      <p className="wb-eyebrow">Something went wrong</p>
      <h1 className="wb-h2 mt-5 max-w-2xl text-ink">This page hit a problem.</h1>
      <p className="wb-lead mt-5 max-w-xl">
        Try again, and if it keeps happening, email support@wbill.app with the message below.
      </p>
      <pre className="mt-6 max-w-2xl overflow-x-auto whitespace-pre-wrap rounded-xl border border-line bg-surface p-4 font-mono text-xs text-ink-soft">
        {error.message || 'Unknown error'}
        {error.digest ? `\nRef: ${error.digest}` : ''}
      </pre>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="wb-btn wb-btn-md wb-btn-primary">
          Try again
        </button>
        <Link href="/" className="wb-btn wb-btn-md wb-btn-secondary">
          Go home
        </Link>
      </div>
    </main>
  );
}
