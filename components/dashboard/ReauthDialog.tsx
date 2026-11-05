'use client';

import { useState, type FormEvent } from 'react';
import Icon from '@/components/Icon';
import {
  confirmReauthOtp,
  describeAuthError,
  reauthenticateWithGoogle,
  resetRecaptcha,
  sendOtpForReauth,
} from '@/lib/auth';
import { toE164 } from '@/lib/phone';
import type { SessionUser } from '@/lib/session';

const RECAPTCHA_ID = 'wb-reauth-recaptcha';

/**
 * Firebase requires a recent sign-in before deleting an account. This asks
 * the user to prove it's them again, the same way they signed in, then
 * calls onVerified() — it never signs a different person in.
 */
export default function ReauthDialog({ user, onVerified, onCancel }: { user: SessionUser; onVerified: () => void; onCancel: () => void }) {
  const hasGoogle = user.providers.includes('google.com');
  const [verificationId, setVerificationId] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setBusy(true);
    setError('');
    try {
      await reauthenticateWithGoogle();
      onVerified();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    const parsed = toE164('IN', phone);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { verificationId: id } = await sendOtpForReauth(parsed.e164, RECAPTCHA_ID);
      setVerificationId(id);
    } catch (err) {
      resetRecaptcha();
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await confirmReauthOtp(verificationId, code);
      onVerified();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold text-ink">Verify it&rsquo;s you</h2>
        <p className="mt-1 text-sm text-ink-soft">For your security, confirm your identity again before this action.</p>

        <div className="mt-5 flex flex-col gap-3">
          {hasGoogle && (
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="wb-btn wb-btn-md border border-border bg-surface text-ink hover:border-ink/25 disabled:opacity-60"
            >
              Continue with Google
            </button>
          )}

          {!verificationId ? (
            <form onSubmit={sendCode} className="flex flex-col gap-2.5">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your mobile number"
                inputMode="numeric"
                className="h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
              <button type="submit" disabled={busy} className="wb-btn wb-btn-md bg-primary text-white disabled:opacity-60">
                Send code
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="flex flex-col gap-2.5">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                maxLength={6}
                className="h-11 rounded-xl border border-border bg-surface px-3.5 text-center text-lg tracking-[0.3em] text-ink focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
              <button type="submit" disabled={busy || code.length < 6} className="wb-btn wb-btn-md bg-primary text-white disabled:opacity-60">
                Verify
              </button>
            </form>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <button type="button" onClick={onCancel} className="mt-4 flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <Icon name="cross" className="h-3.5 w-3.5" />
          Cancel
        </button>

        <div id={RECAPTCHA_ID} />
      </div>
    </div>
  );
}
