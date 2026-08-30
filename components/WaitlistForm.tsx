'use client';

import { useId, useState, type FormEvent } from 'react';
import { brand } from '@/lib/brand';
import Icon from './Icon';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export default function WaitlistForm({
  source = 'landing-hero',
  align = 'left',
}: {
  /** Which form on the page produced the lead. */
  source?: string;
  align?: 'left' | 'center';
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      if (!response.ok) {
        throw new Error(`Waitlist request failed with status ${response.status}`);
      }
      setStatus('success');
    } catch (error) {
      console.error('Waitlist signup failed:', error);
      setStatus('error');
    }
  }

  const centered = align === 'center';

  if (status === 'success') {
    return (
      <p
        role="status"
        className={`inline-flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success ${
          centered ? 'mx-auto' : ''
        }`}
      >
        <Icon name="check" className="h-4 w-4" />
        You’re on the list — we’ll email you the moment wbill launches.
      </p>
    );
  }

  return (
    <div className={centered ? 'mx-auto max-w-lg' : ''}>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-2.5 sm:flex-row ${centered ? 'sm:justify-center' : ''}`}
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@business.com"
          aria-describedby={status === 'error' ? errorId : undefined}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary shadow-sm transition-shadow placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 disabled:translate-y-0 disabled:opacity-60"
        >
          {status === 'submitting' ? 'Joining…' : 'Get early access'}
          {status !== 'submitting' && (
            <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </form>
      {status === 'error' && (
        <p id={errorId} role="alert" className="mt-2.5 text-sm text-error">
          Couldn’t reach us just now — email{' '}
          <a href={`mailto:${brand.email}`} className="underline">
            {brand.email}
          </a>{' '}
          and we’ll add you.
        </p>
      )}
    </div>
  );
}
