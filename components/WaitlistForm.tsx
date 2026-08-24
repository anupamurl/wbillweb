'use client';

import { useState, type FormEvent } from 'react';
import { brand } from '@/lib/brand';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing-hero' }),
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

  if (status === 'success') {
    return (
      <p role="status" className="text-sm font-medium text-success">
        You&rsquo;re on the list — we&rsquo;ll email you at launch.
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@business.com"
          aria-describedby={status === 'error' ? 'waitlist-error' : undefined}
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {status === 'submitting' ? 'Joining…' : 'Get early access'}
        </button>
      </form>
      {status === 'error' && (
        <p id="waitlist-error" role="alert" className="mt-2 text-sm text-error">
          Couldn&rsquo;t reach us just now — email{' '}
          <a href={`mailto:${brand.email}`} className="underline">
            {brand.email}
          </a>{' '}
          and we&rsquo;ll add you.
        </p>
      )}
    </div>
  );
}
