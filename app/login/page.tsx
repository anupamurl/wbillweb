'use client';

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/Icon';
import WbillMark from '@/components/WbillMark';
import { describeAuthError, resetRecaptcha, sendOtp, signInWithGoogle, type OtpHandle } from '@/lib/auth';
import { countries, toE164, type CountryCode } from '@/lib/phone';
import { useSession } from '@/lib/session';
import { isFirebaseConfigured } from '@/lib/firebase';

const RECAPTCHA_ID = 'wb-recaptcha-container';
const RESEND_SECONDS = 30;

type Step = 'phone' | 'otp';

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const session = useSession({ eager: true });

  const [step, setStep] = useState<Step>('phone');
  const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [rawPhone, setRawPhone] = useState('');
  const [code, setCode] = useState('');
  const [e164, setE164] = useState('');
  const [otpHandle, setOtpHandle] = useState<OtpHandle | null>(null);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session.status === 'signedIn') router.replace(next);
  }, [session.status, next, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'otp') codeInputRef.current?.focus();
  }, [step]);

  useEffect(() => () => resetRecaptcha(), []);

  async function requestOtp(event?: FormEvent) {
    event?.preventDefault();
    setError('');
    const parsed = toE164(countryCode, rawPhone);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setSending(true);
    try {
      const handle = await sendOtp(parsed.e164, RECAPTCHA_ID);
      setOtpHandle(handle);
      setE164(parsed.e164);
      setStep('otp');
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      resetRecaptcha();
      setError(describeAuthError(err));
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    if (!otpHandle || code.length < 6) return;
    setError('');
    setVerifying(true);
    try {
      await otpHandle.confirm(code);
      // useSession picks up the new user and the redirect effect fires.
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setVerifying(false);
    }
  }

  async function handleGoogle() {
    setGoogleError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = describeAuthError(err);
      if (message) setGoogleError(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  if (!isFirebaseConfigured()) {
    return (
      <Centered>
        <p className="text-sm text-ink-soft">
          Sign-in isn&rsquo;t configured on this build yet. If you&rsquo;re a visitor, please check back soon.
        </p>
      </Centered>
    );
  }

  return (
    <Centered>
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <WbillMark size={36} />
        <h1 className="wb-display text-2xl text-ink">{step === 'phone' ? 'Log in or sign up' : 'Enter the code'}</h1>
        <p className="max-w-xs text-sm text-ink-soft">
          {step === 'phone'
            ? 'Use the same phone number or Google account as the wbill app.'
            : `We sent a 6-digit code to ${e164}.`}
        </p>
      </div>

      {step === 'phone' && (
        <form onSubmit={requestOtp} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select
              aria-label="Country code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value as CountryCode)}
              className="h-12 w-[6.5rem] rounded-xl border border-border bg-surface px-2 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.dial} {c.code}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="phone">
              Mobile number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              autoFocus
              placeholder="98765 43210"
              value={rawPhone}
              onChange={(e) => setRawPhone(e.target.value)}
              className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-base text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="wb-btn wb-btn-lg bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 disabled:translate-y-0 disabled:opacity-60"
          >
            {sending ? 'Sending code…' : 'Send code'}
          </button>

          <div className="my-2 flex items-center gap-3 text-xs text-ink-soft">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="wb-btn wb-btn-lg border border-border bg-surface text-ink transition-colors hover:border-ink/25 disabled:opacity-60"
          >
            <GoogleIcon />
            {googleLoading ? 'Opening Google…' : 'Continue with Google'}
          </button>
          {googleError && <p className="text-sm text-error">{googleError}</p>}
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={verifyOtp} className="flex flex-col gap-3">
          <label className="sr-only" htmlFor="otp">
            6-digit code
          </label>
          <input
            id="otp"
            ref={codeInputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="h-14 rounded-xl border border-border bg-surface px-4 text-center text-2xl tracking-[0.5em] text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={verifying || code.length < 6}
            className="wb-btn wb-btn-lg bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 disabled:translate-y-0 disabled:opacity-60"
          >
            {verifying ? 'Verifying…' : 'Verify and continue'}
          </button>
          <div className="flex items-center justify-between text-sm text-ink-soft">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setCode('');
                setError('');
              }}
              className="text-ink-soft underline-offset-2 hover:text-ink hover:underline"
            >
              Change number
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || sending}
              onClick={() => requestOtp()}
              className="text-primary underline-offset-2 hover:underline disabled:text-ink-soft disabled:no-underline"
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : sending ? 'Sending…' : 'Resend code'}
            </button>
          </div>
        </form>
      )}

      <div id={RECAPTCHA_ID} />

      <p className="mt-8 text-center text-xs text-ink-soft">
        By continuing you agree to wbill&rsquo;s{' '}
        <Link href="/terms" className="underline">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface/80 p-6 shadow-sm backdrop-blur sm:p-8">
        {children}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48a5.54 5.54 0 0 1-2.4 3.64v3.02h3.88c2.27-2.09 3.56-5.17 3.56-8.85Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.96-2.9l-3.88-3.02a7.17 7.17 0 0 1-4.08 1.15c-3.14 0-5.8-2.12-6.75-4.97H1.24v3.12A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.25 14.26a7.2 7.2 0 0 1 0-4.52V6.62H1.24a12 12 0 0 0 0 10.76l4.01-3.12Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.78l3.44-3.44A11.87 11.87 0 0 0 12 0 12 12 0 0 0 1.24 6.62l4.01 3.12C6.2 6.88 8.86 4.75 12 4.75Z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
