'use client';

import { useId, useState, type FormEvent } from 'react';
import { brand } from '@/lib/brand';
import { businesses } from '@/content/businesses';
import Icon from './Icon';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const languages = ['English', 'Hindi', 'Hinglish', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Punjabi', 'Other'];

const selectClass =
  'h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text-primary shadow-sm transition-shadow focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15';

export default function WaitlistForm({
  source = 'landing-hero',
  align = 'left',
  defaultBusinessType = '',
}: {
  /** Which form on the page produced the lead. */
  source?: string;
  align?: 'left' | 'center';
  /** Pre-selects the business type, e.g. on a business-type page. */
  defaultBusinessType?: string;
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState(defaultBusinessType);
  const [language, setLanguage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // businessType and language are optional; they tell us who is signing up
        // and which language to build first. The API must accept (or ignore) them.
        body: JSON.stringify({
          email,
          source,
          ...(businessType && { businessType }),
          ...(language && { language }),
        }),
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
        You’re on the list — we’ll email you the day wbill launches.
      </p>
    );
  }

  return (
    <div className={centered ? 'mx-auto max-w-lg' : ''}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className={`grid gap-2.5 sm:grid-cols-2 ${centered ? 'text-left' : 'sm:max-w-[34rem]'}`}>
          <label className="sr-only" htmlFor={`${inputId}-business`}>
            Your business
          </label>
          <select
            id={`${inputId}-business`}
            name="businessType"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
            className={`${selectClass} ${businessType ? '' : 'text-text-disabled'}`}
          >
            <option value="">Your business (optional)</option>
            {businesses.map((business) => (
              <option key={business.slug} value={business.label}>
                {business.label}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          <label className="sr-only" htmlFor={`${inputId}-language`}>
            Preferred language
          </label>
          <select
            id={`${inputId}-language`}
            name="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className={`${selectClass} ${language ? '' : 'text-text-disabled'}`}
          >
            <option value="">Your language (optional)</option>
            {languages.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={`flex flex-col gap-2.5 sm:flex-row ${centered ? 'sm:justify-center' : ''}`}>
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
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text-primary shadow-sm transition-shadow placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="wb-btn wb-btn-md group min-w-[11.5rem] shrink-0 bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 disabled:translate-y-0 disabled:opacity-60"
        >
          {status === 'submitting' ? 'Joining…' : 'Join early access'}
          {status !== 'submitting' && (
            <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
        </div>
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
