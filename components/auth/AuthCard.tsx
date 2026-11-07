'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { AppBillScreen, BrowserFrame, DashboardScreen, PaperReceipt, PhoneFrame } from '@/components/landing/mocks';
import { demoBill } from '@/content/demo';
import { describeAuthError, resetRecaptcha, sendOtp, signInWithGoogle, type OtpHandle } from '@/lib/auth';
import { toE164 } from '@/lib/phone';
import { useSession } from '@/lib/session';
import { useIsAdmin } from '@/lib/admin/data';
import { isFirebaseConfigured } from '@/lib/firebase';

const RECAPTCHA_ID = 'wb-recaptcha-container';
const RESEND_SECONDS = 30;
const CODE_LENGTH = 6;

type Step = 'phone' | 'otp';
export type AuthMode = 'login' | 'signup';

const copy = {
  login: {
    eyebrow: 'Log in',
    title: 'Welcome back',
    lead: 'Log in with the phone number or Google account you use for WBill.',
    switchText: 'New to WBill?',
    switchLabel: 'Create account',
    switchHref: '/signup/',
    asideEyebrow: 'Your shop, synced',
    asideTitle: 'Right where you left it.',
    asideLead: 'Every bill, customer and sale — the same on your phone and on the web.',
  },
  signup: {
    eyebrow: 'Get started',
    title: 'Create your account',
    lead: 'Set up your shop in under a minute. Free to start, no card needed.',
    switchText: 'Have an account?',
    switchLabel: 'Log in',
    switchHref: '/login/',
    asideEyebrow: 'From paper to digital',
    asideTitle: 'Every purchase deserves a digital record.',
    asideLead: 'Paper bills fade, tear and get lost. WBill bills don’t.',
  },
} as const;

const steps = ['Make the bill', 'Send on WhatsApp', 'Kept for good'] as const;

/** Only same-site paths are honoured as a post-login destination. */
function safeNext(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return '/dashboard/';
}

/**
 * Phone OTP and Google sign-in, through Firebase Auth. Signing in and
 * signing up are the same operation — Firebase creates the account on
 * first verification — so both pages share this one flow and differ
 * only in their words and the picture beside the form.
 */
export default function AuthCard({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const session = useSession({ eager: true });
  const text = copy[mode];

  const [step, setStep] = useState<Step>('phone');
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

  // The super admin has no shop: they always land on the admin panel.
  const isAdmin = useIsAdmin(session.status === 'signedIn' ? session.user.uid : null);
  useEffect(() => {
    if (session.status !== 'signedIn' || isAdmin === null) return;
    router.replace(isAdmin ? '/administrator/' : next);
  }, [session.status, isAdmin, next, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'otp') codeInputRef.current?.focus();
  }, [step]);

  // Signed straight back out because the admin blocked this account.
  const isBlocked = session.status === 'signedOut' && session.reason === 'blocked';
  const wasDeleted = session.status === 'signedOut' && session.reason === 'deleted';
  useEffect(() => {
    if (!isBlocked) return;
    setStep('phone');
    setCode('');
    setOtpHandle(null);
  }, [isBlocked]);

  useEffect(() => () => resetRecaptcha(), []);

  async function requestOtp(event?: FormEvent) {
    event?.preventDefault();
    setError('');
    const parsed = toE164('IN', rawPhone);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setSending(true);
    try {
      const handle = await sendOtp(parsed.e164, RECAPTCHA_ID);
      setOtpHandle(handle);
      setE164(parsed.e164);
      setCode('');
      setStep('otp');
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      console.error('Sending OTP failed:', (err as { code?: string })?.code ?? err);
      resetRecaptcha();
      setError(describeAuthError(err));
    } finally {
      setSending(false);
    }
  }

  async function confirmCode(value: string) {
    if (!otpHandle || value.length < CODE_LENGTH || verifying) return;
    setError('');
    setVerifying(true);
    try {
      await otpHandle.confirm(value);
      // useSession picks up the new user and the redirect effect fires.
    } catch (err) {
      console.error('Verifying OTP failed:', (err as { code?: string })?.code ?? err);
      setError(describeAuthError(err));
      setCode('');
      codeInputRef.current?.focus();
    } finally {
      setVerifying(false);
    }
  }

  function onCodeChange(raw: string) {
    const value = raw.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(value);
    if (error) setError('');
    // Submit as soon as the last digit lands — including SMS autofill and paste.
    if (value.length === CODE_LENGTH) void confirmCode(value);
  }

  async function handleGoogle() {
    setGoogleError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in failed:', (err as { code?: string })?.code ?? err);
      const message = describeAuthError(err);
      if (message) setGoogleError(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  const switchHref = `${text.switchHref}${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`;
  const switchLink = (
    <>
      {text.switchText}{' '}
      <Link href={switchHref} className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink">
        {text.switchLabel}
      </Link>
    </>
  );

  if (!isFirebaseConfigured()) {
    return (
      <Shell mode={mode} switchLink={switchLink}>
        <h1 className="wb-display text-[2rem] text-ink">{text.title}</h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
          Sign-in isn&rsquo;t configured on this build yet. If you&rsquo;re a visitor, please check back soon.
        </p>
      </Shell>
    );
  }

  const busy = sending || googleLoading;

  return (
    <Shell mode={mode} switchLink={step === 'phone' ? switchLink : null}>
      <div key={step} className="wb-in">
        {step === 'otp' && (
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setCode('');
              setError('');
            }}
            className="group -ml-1 mb-8 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
            aria-label="Back to phone number"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        <p className="wb-eyebrow">{step === 'phone' ? text.eyebrow : 'Verify your number'}</p>
        <h1 className="wb-display mt-5 text-[2.1rem] text-ink sm:text-[2.5rem]">{step === 'phone' ? text.title : 'Check your messages'}</h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
          {step === 'phone' ? (
            text.lead
          ) : (
            <>
              Enter the {CODE_LENGTH}-digit code we sent to <span className="tabular whitespace-nowrap font-medium text-ink">+91 {formatIndian(e164)}</span>.
            </>
          )}
        </p>

        {isBlocked && (
          <div role="alert" className="mt-7 flex items-start gap-3 rounded-2xl border border-error/30 bg-error/5 px-4 py-3.5 text-sm">
            <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-error" />
            <div>
              <p className="font-semibold text-error">You&rsquo;ve been blocked by the administrator</p>
              <p className="mt-0.5 text-ink-soft">Your account can&rsquo;t be used right now. Please contact your administrator.</p>
            </div>
          </div>
        )}

        {wasDeleted && (
          <div role="alert" className="mt-7 flex items-start gap-3 rounded-2xl border border-error/30 bg-error/5 px-4 py-3.5 text-sm">
            <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-error" />
            <div>
              <p className="font-semibold text-error">Your account was deleted by the administrator</p>
              <p className="mt-0.5 text-ink-soft">Your shop and bills have been removed. Please contact your administrator if you think this is a mistake.</p>
            </div>
          </div>
        )}

        {step === 'phone' && (
          <>
            <form onSubmit={requestOtp} className="mt-9 flex flex-col" noValidate>
              <div className="flex items-baseline justify-between">
                <label htmlFor="phone" className="text-sm font-medium text-ink">
                  Mobile number
                </label>
                <span className="text-xs text-ink-faint">India only</span>
              </div>
              <div
                className={`mt-2 flex h-[3.25rem] items-center rounded-full border bg-surface transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--wbill-primary)_14%,transparent)] ${
                  error ? 'border-error' : 'border-line-strong hover:border-ink-faint'
                }`}
              >
                <span className="tabular flex h-full shrink-0 items-center gap-2 pl-5 pr-3 text-[1rem] font-medium text-ink" aria-hidden="true">
                  <IndiaFlag />
                  +91
                </span>
                <span className="h-5 w-px bg-line-strong" aria-hidden="true" />
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  autoFocus
                  placeholder="98765 43210"
                  value={rawPhone}
                  onChange={(e) => {
                    setRawPhone(e.target.value);
                    if (error) setError('');
                  }}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? 'phone-error' : undefined}
                  className="wb-bare tabular h-full min-w-0 flex-1 rounded-r-full bg-transparent pl-3 pr-5 text-[1rem] tracking-[0.02em] text-ink outline-none placeholder:text-ink-faint"
                />
              </div>
              {error && <FieldError id="phone-error">{error}</FieldError>}

              <button type="submit" disabled={busy} className="wb-btn wb-btn-lg wb-btn-primary group mt-4 w-full">
                {sending ? (
                  <>
                    <Spinner /> Sending code…
                  </>
                ) : (
                  <>
                    Continue
                    <Icon name="arrow" className="wb-arrow h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            <div className="my-7 flex items-center gap-4 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
              <span className="h-px flex-1 bg-line" />
              or
              <span className="h-px flex-1 bg-line" />
            </div>

            <button type="button" onClick={handleGoogle} disabled={busy} className="wb-btn wb-btn-lg wb-btn-secondary w-full">
              {googleLoading ? <Spinner /> : <GoogleIcon />}
              {googleLoading ? 'Opening Google…' : 'Continue with Google'}
            </button>
            {googleError && <FieldError>{googleError}</FieldError>}

          </>
        )}

        {step === 'otp' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void confirmCode(code);
            }}
            className="mt-9 flex flex-col"
          >
            <label className="sr-only" htmlFor="otp">
              {CODE_LENGTH}-digit code
            </label>
            <CodeInput
              inputRef={codeInputRef}
              value={code}
              onChange={onCodeChange}
              invalid={Boolean(error)}
              disabled={verifying}
              describedBy={error ? 'otp-error' : undefined}
            />
            {error && <FieldError id="otp-error">{error}</FieldError>}

            <button type="submit" disabled={verifying || code.length < CODE_LENGTH} className="wb-btn wb-btn-lg wb-btn-primary mt-6 w-full">
              {verifying ? (
                <>
                  <Spinner /> Verifying…
                </>
              ) : (
                'Verify and continue'
              )}
            </button>

            <p className="mt-5 text-center text-sm text-ink-soft">
              Didn&rsquo;t get a code?{' '}
              <button
                type="button"
                disabled={resendIn > 0 || sending}
                onClick={() => requestOtp()}
                className="tabular font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink disabled:font-normal disabled:text-ink-faint disabled:no-underline"
              >
                {resendIn > 0 ? `Resend in 0:${String(resendIn).padStart(2, '0')}` : sending ? 'Sending…' : 'Resend'}
              </button>
            </p>
          </form>
        )}
      </div>

      <div id={RECAPTCHA_ID} />
    </Shell>
  );
}

/** "+919876543210" → "98765 43210" */
function formatIndian(e164: string) {
  const d = e164.replace(/^\+91/, '');
  return d.length === 10 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

/* ------------------------------------------------------------------ *
 * Layout — flat, full-bleed split: the form on the warm canvas, product
 * mocks on a deeper panel running to the viewport edge. No cards, no shadows.
 * ------------------------------------------------------------------ */

function Shell({ mode, switchLink, children }: { mode: AuthMode; switchLink: ReactNode; children: ReactNode }) {
  return (
    <main className="relative isolate grid grid-cols-[minmax(0,1fr)] overflow-hidden border-t border-line lg:min-h-[max(44rem,calc(100dvh-4.5rem))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="wb-in flex flex-col items-center px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-12 lg:pb-12 lg:pt-12">
        <section className="flex w-full max-w-[24rem] flex-1 items-center">
          <div className="w-full">
            {children}
            {switchLink && <p className="mt-8 text-sm text-ink-soft">{switchLink}</p>}
          </div>
        </section>
        <p className="mt-12 w-full max-w-[24rem] border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
          By continuing you agree to WBill&rsquo;s{' '}
          <Link href="/terms/" className="underline underline-offset-2 hover:text-ink">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy/" className="underline underline-offset-2 hover:text-ink">
            Privacy Policy
          </Link>
          . Need help?{' '}
          <Link href="/support/" className="underline underline-offset-2 hover:text-ink">
            Contact support
          </Link>
          .
        </p>
      </div>

      <div className="hidden border-l border-line lg:block">
        <Aside mode={mode} />
      </div>
    </main>
  );
}

/** Product context beside the form — desktop only, so phones go straight to the task. */
function Aside({ mode }: { mode: AuthMode }) {
  const text = copy[mode];
  return (
    <aside aria-hidden="true" className="relative flex h-full flex-col overflow-hidden bg-canvas-deep">
      <div className="wb-dots" />

      <div className="relative px-10 pt-12 xl:px-14 xl:pt-14">
        <p className="wb-eyebrow">{text.asideEyebrow}</p>
        <h2 className="wb-display mt-5 max-w-[28rem] text-[clamp(1.9rem,1.1rem+1.4vw,2.6rem)] text-ink">{text.asideTitle}</h2>
        <p className="mt-4 max-w-[26rem] text-[1rem] leading-relaxed text-ink-soft">{text.asideLead}</p>
        {mode === 'signup' && (
          <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8rem] font-medium text-ink">
            {steps.map((label, i) => (
              <li key={label} className="flex items-center gap-3">
                {i > 0 && <span className="h-px w-5 bg-line-strong" />}
                <span className="flex items-center gap-2">
                  <span className="tabular flex h-5 w-5 items-center justify-center rounded-full border border-line-strong bg-surface font-mono text-[0.65rem] text-ink-soft">
                    {i + 1}
                  </span>
                  {label}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="relative min-h-0 flex-1">{mode === 'signup' ? <SignupVisual /> : <LoginVisual />}</div>
    </aside>
  );
}

function Toast({ tone, title, detail, className }: { tone: 'success' | 'primary'; title: string; detail: string; className: string }) {
  return (
    <div
      className={`wb-pop absolute z-20 flex items-center gap-2.5 whitespace-nowrap rounded-2xl border border-line bg-surface py-2 pl-2 pr-4 text-ink wb-shadow ${className}`}
      style={{ '--wb-delay': '700ms' } as React.CSSProperties}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-white ${tone === 'success' ? 'bg-success' : 'bg-primary'}`}>
        <Icon name="check" className="h-4 w-4" />
      </span>
      <span className="leading-tight">
        <span className="block text-[0.8rem] font-semibold">{title}</span>
        <span className="tabular block text-[0.7rem] text-ink-soft">{detail}</span>
      </span>
    </div>
  );
}

/** A fading paper receipt behind the same bill, made digital. */
function SignupVisual() {
  return (
    <div className="absolute inset-0 flex justify-center">
      <div className="relative flex w-full max-w-[34rem] justify-center pt-10">
        <PaperReceipt faded className="wb-in-fade absolute left-6 top-28 w-[15rem] -rotate-[7deg] xl:left-10 xl:w-[16rem]" />
        <div className="relative z-10 ml-28 h-fit w-[15rem] xl:w-[16.5rem]">
          <PhoneFrame label="A WBill bill" className="wb-in-rise">
            <AppBillScreen />
          </PhoneFrame>
          <Toast tone="success" title="Sent on WhatsApp" detail={`${demoBill.number} · just now`} className="-left-24 top-28" />
        </div>
      </div>
    </div>
  );
}

/** The dashboard on the web with the same bill on the phone, both running off the panel's edges. */
function LoginVisual() {
  return (
    <div className="absolute inset-0">
      <div className="wb-in-rise absolute left-28 top-10 w-[54rem] text-[14px] xl:left-36 xl:text-[15px]">
        <BrowserFrame url="wbill.app/dashboard">
          <DashboardScreen />
        </BrowserFrame>
      </div>
      <div className="absolute left-8 top-60 z-10 w-[12.5rem] xl:left-10 xl:w-[13.5rem]">
        <PhoneFrame label="The same bill in the WBill app" className="wb-in-rise">
          <AppBillScreen />
        </PhoneFrame>
        <Toast tone="primary" title="Synced" detail={`Phone and web · ${demoBill.number}`} className="-right-40 top-10" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Form pieces
 * ------------------------------------------------------------------ */

/**
 * Six visual boxes over one real input, so SMS autofill
 * (autocomplete="one-time-code"), paste and screen readers all see a
 * single ordinary text field.
 */
function CodeInput({
  inputRef,
  value,
  onChange,
  invalid,
  disabled,
  describedBy,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  disabled: boolean;
  describedBy?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <div className="relative">
      <input
        id="otp"
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="wb-bare absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
      />
      <div className="grid grid-cols-6 gap-2 sm:gap-2.5" aria-hidden="true">
        {Array.from({ length: CODE_LENGTH }, (_, i) => {
          const digit = value[i];
          const isActive = focused && i === active && value.length < CODE_LENGTH;
          return (
            <div
              key={i}
              className={`tabular flex aspect-[5/6] items-center justify-center rounded-2xl border bg-surface text-[1.6rem] font-semibold text-ink transition-[border-color,box-shadow,transform] ${
                invalid
                  ? 'border-error'
                  : isActive
                    ? 'border-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--wbill-primary)_14%,transparent)]'
                    : digit
                      ? 'border-ink-faint'
                      : 'border-line-strong'
              } ${disabled ? 'opacity-60' : ''}`}
            >
              {digit ?? (isActive ? <span className="h-7 w-[2px] animate-pulse rounded-full bg-primary" /> : null)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-2.5 flex items-start gap-1.5 pl-1 text-sm text-error">
      <Icon name="cross" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />;
}

function IndiaFlag() {
  return (
    <svg viewBox="0 0 30 20" className="h-3.5 w-5 overflow-hidden rounded-[3px] ring-1 ring-line" aria-hidden="true">
      <rect width="30" height="20" fill="#FFFFFF" />
      <rect width="30" height="6.67" fill="#FF9933" />
      <rect y="13.33" width="30" height="6.67" fill="#138808" />
      <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.6" />
      <circle cx="15" cy="10" r="0.6" fill="#000080" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48a5.54 5.54 0 0 1-2.4 3.64v3.02h3.88c2.27-2.09 3.56-5.17 3.56-8.85Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.96-2.9l-3.88-3.02a7.17 7.17 0 0 1-4.08 1.15c-3.14 0-5.8-2.12-6.75-4.97H1.24v3.12A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.25 14.26a7.2 7.2 0 0 1 0-4.52V6.62H1.24a12 12 0 0 0 0 10.76l4.01-3.12Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.78l3.44-3.44A11.87 11.87 0 0 0 12 0 12 12 0 0 0 1.24 6.62l4.01 3.12C6.2 6.88 8.86 4.75 12 4.75Z" />
    </svg>
  );
}
