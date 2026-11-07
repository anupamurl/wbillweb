'use client';

import { useState, type FormEvent } from 'react';
import WbillMark from '@/components/WbillMark';
import { createShop } from '@/lib/data';
import { DEFAULT_GST_MODE } from '@/lib/gst';
import { useSegments } from '@/lib/segments';
import { SegmentPicker } from './BillingSetupFields';
import { cleanNumber } from '@/lib/phone';
import { gstinError, normalizeGstin } from '@/lib/gstin';
import type { SessionUser } from '@/lib/session';

/** First-time setup: `shops/{uid}` doesn't exist yet. Mirrors the mobile app's shop-setup screen. */
export default function ShopSetupForm({ user }: { user: SessionUser }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user.phoneNumber ? cleanNumber(user.phoneNumber) : '');
  const [gstin, setGstin] = useState('');
  const segments = useSegments();
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Enter your shop or business name.');
      return;
    }
    const badGstin = gstinError(gstin);
    if (badGstin) {
      setError(badGstin);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createShop(user.uid, {
        name: name.trim(),
        address: address.trim(),
        phone: cleanNumber(phone),
        ownerPhone: user.phoneNumber ? cleanNumber(user.phoneNumber) : cleanNumber(phone),
        gstin: normalizeGstin(gstin),
        segments: picked.filter((id) => segments?.some((s) => s.id === id)),
        // Changeable later in Profile; most retail prices already include GST.
        gstMode: DEFAULT_GST_MODE,
      });
      // The shop snapshot listener picks this up and the dashboard renders.
    } catch {
      setError('Could not save your shop. Check your connection and try again.');
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className={`w-full ${segments?.length ? 'max-w-lg' : 'max-w-sm'} rounded-3xl border border-border bg-surface/80 p-6 shadow-sm backdrop-blur sm:p-8`}>
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <WbillMark size={36} />
          <h1 className="wb-display text-2xl text-ink">Set up your shop</h1>
          <p className="max-w-xs text-sm text-ink-soft">One-time setup. You can edit this later from Profile.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Shop or business name" required>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sharma Mobiles"
              maxLength={80}
              className={inputClass}
            />
          </Field>
          <Field label="Address (optional)">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop no. 4, Main Market"
              maxLength={200}
              className={inputClass}
            />
          </Field>
          <Field label="Shop phone (optional)">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              inputMode="numeric"
              maxLength={20}
              className={inputClass}
            />
          </Field>
          <Field label="GSTIN (optional)">
            <input
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="27AAPFU0939F1ZV"
              maxLength={18}
              autoCapitalize="characters"
              spellCheck={false}
              className={`${inputClass} font-mono tracking-wide`}
            />
          </Field>
          {segments?.length !== 0 && (
            <div className="mt-2">
              <SegmentPicker segments={segments} value={picked} onChange={setPicked} disabled={saving} />
            </div>
          )}
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="wb-btn wb-btn-lg mt-2 bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 disabled:translate-y-0 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Continue to dashboard'}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  'h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-left">
      <span className="text-xs font-medium text-ink-soft">
        {label} {required && <span className="text-error">*</span>}
      </span>
      {children}
    </label>
  );
}
