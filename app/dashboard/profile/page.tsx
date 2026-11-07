'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Icon from '@/components/Icon';
import ShopLogo from '@/components/ShopLogo';
import ReauthDialog from '@/components/dashboard/ReauthDialog';
import BillingSettings from '@/components/dashboard/BillingSettings';
import { useDashboard } from '@/lib/DashboardContext';
import { deleteShopAndBills, updateShop, updateShopLogo } from '@/lib/data';
import { imageFileToLogo, PRESET_LOGOS } from '@/lib/logos';
import { describeAuthError, linkGoogle, resetRecaptcha, sendOtpForLinking, confirmLinkOtp, unlinkProvider } from '@/lib/auth';
import { toE164, formatPhone } from '@/lib/phone';
import { gstinError, normalizeGstin } from '@/lib/gstin';
import { firebaseAuth } from '@/lib/firebase';
import { signOutEverywhere } from '@/lib/session';

const RECAPTCHA_ID = 'wb-profile-link-recaptcha';

export default function ProfilePage() {
  const router = useRouter();
  const { user, shop, bills, isOwner, employeeName } = useDashboard();

  const [name, setName] = useState(shop?.name ?? '');
  const [address, setAddress] = useState(shop?.address ?? '');
  const [phone, setPhone] = useState(shop?.phone ?? '');
  const [gstin, setGstin] = useState(shop?.gstin ?? '');
  const [savedAt, setSavedAt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [shopError, setShopError] = useState('');

  const [linkPhone, setLinkPhone] = useState('');
  const [linkVerificationId, setLinkVerificationId] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linking, setLinking] = useState(false);
  const [showLinkPhone, setShowLinkPhone] = useState(false);

  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'reauth' | 'deleting'>('idle');
  const [deleteError, setDeleteError] = useState('');

  // Re-sync fields if the shop doc changes elsewhere (e.g. edited on mobile).
  const [editedShopId, setEditedShopId] = useState(shop?.id);
  if (shop && shop.id !== editedShopId) {
    setEditedShopId(shop.id);
    setName(shop.name);
    setAddress(shop.address);
    setPhone(shop.phone);
    setGstin(shop.gstin);
  }

  async function saveShop(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setShopError('Shop name is required.');
      return;
    }
    const badGstin = gstinError(gstin);
    if (badGstin) {
      setShopError(badGstin);
      return;
    }
    setSaving(true);
    setShopError('');
    try {
      await updateShop(user.uid, {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        gstin: normalizeGstin(gstin),
      });
      setGstin(normalizeGstin(gstin));
      setSavedAt(Date.now());
    } catch {
      setShopError('Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLinkGoogle() {
    setLinkError('');
    try {
      await linkGoogle();
    } catch (err) {
      const message = describeAuthError(err);
      if (message) setLinkError(message);
    }
  }

  async function sendLinkOtp(event: FormEvent) {
    event.preventDefault();
    const parsed = toE164('IN', linkPhone);
    if (!parsed.ok) {
      setLinkError(parsed.error);
      return;
    }
    setLinking(true);
    setLinkError('');
    try {
      const { verificationId } = await sendOtpForLinking(parsed.e164, RECAPTCHA_ID);
      setLinkVerificationId(verificationId);
    } catch (err) {
      resetRecaptcha();
      setLinkError(describeAuthError(err));
    } finally {
      setLinking(false);
    }
  }

  async function confirmLink(event: FormEvent) {
    event.preventDefault();
    setLinking(true);
    setLinkError('');
    try {
      await confirmLinkOtp(linkVerificationId, linkCode);
      setShowLinkPhone(false);
      setLinkVerificationId('');
      setLinkCode('');
    } catch (err) {
      setLinkError(describeAuthError(err));
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlink(providerId: string) {
    setLinkError('');
    try {
      await unlinkProvider(providerId);
    } catch (err) {
      setLinkError(describeAuthError(err));
    }
  }

  async function performDelete() {
    setDeleteStep('deleting');
    setDeleteError('');
    try {
      await deleteShopAndBills(user.uid, bills);
      const current = firebaseAuth().currentUser;
      if (current) await current.delete();
      router.replace('/');
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/requires-recent-login') {
        setDeleteStep('reauth');
      } else {
        setDeleteError(describeAuthError(err) || 'Could not delete your account. Try again.');
        setDeleteStep('confirm');
      }
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <h1 className="wb-display text-2xl text-ink sm:text-3xl">{isOwner ? 'Profile' : 'Account'}</h1>

      {!isOwner && (
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-base font-semibold text-ink">Your workplace</h2>
          <div className="mt-4 flex items-center gap-3.5">
            <ShopLogo logo={shop?.logo} name={shop?.name ?? 'Shop'} size={48} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{shop?.name}</p>
              <p className="text-sm text-ink-soft">Employee{employeeName ? ` · ${employeeName}` : ''}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Bills you make carry this shop&rsquo;s name and logo. Only the owner can change shop details or remove you from the team.
          </p>
        </section>
      )}

      {isOwner && (
        <>
          <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-base font-semibold text-ink">Shop details</h2>
            <form onSubmit={saveShop} className="mt-5 flex flex-col gap-3.5">
              <Field label="Shop or business name" required>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
              </Field>
              <Field label="Address">
                <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} className={inputClass} />
              </Field>
              <Field label="Shop phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className={inputClass} />
              </Field>
              <Field label="GSTIN (optional)">
                <input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  maxLength={18}
                  placeholder="27AAPFU0939F1ZV"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className={`${inputClass} font-mono tracking-wide`}
                />
                <span className="text-xs text-ink-faint">Printed on your bills when filled in.</span>
              </Field>
              {shopError && <p className="text-sm text-error">{shopError}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="wb-btn wb-btn-md bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 disabled:translate-y-0 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                {savedAt > 0 && !saving && (
                  <span className="flex items-center gap-1.5 text-sm text-success">
                    <Icon name="check" className="h-4 w-4" />
                    Saved
                  </span>
                )}
              </div>
            </form>
          </section>

          {shop && <LogoSection uid={user.uid} name={name || shop.name} logo={shop.logo} />}

          {shop && <BillingSettings key={shop.id} shop={shop} />}
        </>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-base font-semibold text-ink">Sign-in methods</h2>
        <p className="mt-1 text-sm text-ink-soft">The same methods work in the wbill app.</p>

        <ul className="mt-5 flex flex-col gap-2.5">
          <li className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <span className="flex items-center gap-2.5 text-sm text-ink">
              <Icon name="phone" className="h-4 w-4 text-ink-soft" />
              {user.phoneNumber ? formatPhone(user.phoneNumber) : 'Phone number'}
            </span>
            {user.providers.includes('phone') ? (
              <span className="text-xs text-ink-soft">
                Connected
                {user.providers.length > 1 && (
                  <button type="button" onClick={() => handleUnlink('phone')} className="ml-3 text-error hover:underline">
                    Remove
                  </button>
                )}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowLinkPhone((v) => !v)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Add
              </button>
            )}
          </li>
          <li className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <span className="flex items-center gap-2.5 text-sm text-ink">
              <Icon name="key" className="h-4 w-4 text-ink-soft" />
              {user.providers.includes('google.com') ? user.email : 'Google account'}
            </span>
            {user.providers.includes('google.com') ? (
              <span className="text-xs text-ink-soft">
                Connected
                {user.providers.length > 1 && (
                  <button type="button" onClick={() => handleUnlink('google.com')} className="ml-3 text-error hover:underline">
                    Remove
                  </button>
                )}
              </span>
            ) : (
              <button type="button" onClick={handleLinkGoogle} className="text-xs font-medium text-primary hover:underline">
                Add
              </button>
            )}
          </li>
        </ul>

        {showLinkPhone && !user.providers.includes('phone') && (
          <div className="mt-4 rounded-xl border border-border bg-canvas p-4">
            {!linkVerificationId ? (
              <form onSubmit={sendLinkOtp} className="flex gap-2">
                <input
                  value={linkPhone}
                  onChange={(e) => setLinkPhone(e.target.value)}
                  placeholder="98765 43210"
                  inputMode="numeric"
                  className={`${inputClass} min-w-0 flex-1`}
                />
                <button type="submit" disabled={linking} className="wb-btn wb-btn-md bg-primary text-white disabled:opacity-60">
                  Send code
                </button>
              </form>
            ) : (
              <form onSubmit={confirmLink} className="flex gap-2">
                <input
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                  className={`${inputClass} min-w-0 flex-1 text-center tracking-[0.3em]`}
                />
                <button
                  type="submit"
                  disabled={linking || linkCode.length < 6}
                  className="wb-btn wb-btn-md bg-primary text-white disabled:opacity-60"
                >
                  Verify
                </button>
              </form>
            )}
          </div>
        )}
        {linkError && <p className="mt-3 text-sm text-error">{linkError}</p>}
        <div id={RECAPTCHA_ID} />
      </section>

      {isOwner && (
        <section className="rounded-2xl border border-error/30 bg-error/5 p-6 sm:p-8">
          <h2 className="text-base font-semibold text-ink">Delete account</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Permanently deletes your shop, all {bills.length} saved bill
            {bills.length === 1 ? '' : 's'}, and your account. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setDeleteStep('confirm')}
            className="wb-btn wb-btn-md mt-4 border border-error/40 bg-surface text-error hover:bg-error/10"
          >
            Delete my account
          </button>
        </section>
      )}

      {deleteStep === 'confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-base font-semibold text-ink">Delete your account?</h2>
            <p className="mt-2 text-sm text-ink-soft">
              This permanently deletes {shop?.name ?? 'your shop'}, all {bills.length} bill{bills.length === 1 ? '' : 's'}, and signs you
              out everywhere. This cannot be undone.
            </p>
            {deleteError && <p className="mt-3 text-sm text-error">{deleteError}</p>}
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteStep('idle')}
                className="wb-btn wb-btn-md border border-border bg-surface text-ink"
              >
                Cancel
              </button>
              <button type="button" onClick={performDelete} className="wb-btn wb-btn-md bg-error text-white">
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteStep === 'reauth' && (
        <ReauthDialog
          user={user}
          onCancel={() => setDeleteStep('confirm')}
          onVerified={() => {
            setDeleteStep('idle');
            void performDelete();
          }}
        />
      )}

      {deleteStep === 'deleting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      <button
        type="button"
        onClick={() => signOutEverywhere().then(() => router.replace('/'))}
        className="self-start text-sm text-ink-soft hover:text-ink"
      >
        Log out
      </button>
    </div>
  );
}

/** Upload a logo or pick a preset. Saves straight away; shown on every bill. */
function LogoSection({ uid, name, logo }: { uid: string; name: string; logo: string }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState(0);
  const uploaded = logo.startsWith('data:');

  async function save(next: string | null) {
    setBusy(true);
    setError('');
    try {
      await updateShopLogo(uid, next);
      setSavedAt(Date.now());
    } catch {
      setError('Could not save the logo. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    let dataUrl: string;
    try {
      dataUrl = await imageFileToLogo(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that image.');
      setBusy(false);
      return;
    }
    await save(dataUrl);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-base font-semibold text-ink">Shop logo</h2>
      <p className="mt-1 text-sm text-ink-soft">Shown at the top of every bill you share.</p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <ShopLogo logo={logo} name={name} size={72} className="border border-border" />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              className="wb-btn wb-btn-md bg-primary text-white shadow-sm disabled:opacity-60"
            >
              {busy ? 'Saving…' : uploaded ? 'Replace image' : 'Upload image'}
            </button>
            {logo && (
              <button
                type="button"
                disabled={busy}
                onClick={() => save(null)}
                className="wb-btn wb-btn-md border border-border bg-surface text-ink disabled:opacity-60"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-ink-soft">PNG or JPG. Square images look best.</p>
        </div>
        {savedAt > 0 && !busy && !error && (
          <span className="flex items-center gap-1.5 text-sm text-success">
            <Icon name="check" className="h-4 w-4" />
            Saved
          </span>
        )}
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} />
      </div>

      <p className="mt-6 text-xs font-medium text-ink-soft">Or choose a ready-made logo</p>
      <div className="mt-2.5 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
        {PRESET_LOGOS.map((p) => {
          const value = `preset:${p.id}`;
          const selected = logo === value;
          return (
            <button
              key={p.id}
              type="button"
              disabled={busy}
              onClick={() => !selected && save(value)}
              title={p.label}
              aria-label={p.label}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors disabled:opacity-60 ${
                selected ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
              }`}
            >
              <ShopLogo logo={value} name={p.label} size={44} />
              <span className="w-full truncate text-center text-[11px] text-ink-soft">{p.label}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
    </section>
  );
}

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-soft">
        {label} {required && <span className="text-error">*</span>}
      </span>
      {children}
    </label>
  );
}
