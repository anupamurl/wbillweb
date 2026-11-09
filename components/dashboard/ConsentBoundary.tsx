'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { consentNotice, type ConsentLanguage } from '@/content/consentNotice';
import { consentIsCurrent, giveConsent, watchConsent, type ConsentState } from '@/lib/consent';
import { signOutEverywhere, type SessionUser } from '@/lib/session';

/**
 * Nothing in the dashboard runs, and no shop or bill data loads, until this
 * login has given consent to the current notice. If that can't be checked
 * it stops and says so, rather than letting the user through.
 */
export default function ConsentBoundary({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setConsent(undefined);
    setFailed(false);
    return watchConsent(user.uid, setConsent, () => setFailed(true));
  }, [user.uid, attempt]);

  if (failed) {
    return (
      <div role="alert" className="mx-auto mt-16 max-w-md rounded-2xl border border-error/30 bg-error/5 p-6 text-center">
        <p className="font-semibold text-ink">We couldn&rsquo;t load your account</p>
        <p className="mt-2 text-sm text-ink-soft">Check your connection and try again.</p>
        <button type="button" onClick={() => setAttempt((n) => n + 1)} className="wb-btn wb-btn-md wb-btn-primary mt-5">
          Try again
        </button>
      </div>
    );
  }
  if (consent === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center" aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }
  if (!consentIsCurrent(consent)) return <ConsentScreen uid={user.uid} withdrawn={consent?.status === 'withdrawn'} initial={consent?.language ?? 'en'} />;
  return <>{children}</>;
}

function ConsentScreen({ uid, withdrawn, initial }: { uid: string; withdrawn: boolean; initial: ConsentLanguage }) {
  const [language, setLanguage] = useState<ConsentLanguage>(initial);
  const [consented, setConsented] = useState(false);
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const t = consentNotice[language];
  const ready = consented && adult && terms && !busy;

  async function agree() {
    if (!ready) return;
    setBusy(true);
    setError(false);
    try {
      await giveConsent(uid, language);
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  const check = (checked: boolean, set: (v: boolean) => void, label: React.ReactNode) => (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--wbill-primary)]" />
      <span>{label}</span>
    </label>
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14" lang={language}>
      <div className="flex justify-end gap-1" role="group" aria-label="Language / भाषा">
        {(Object.keys(consentNotice) as ConsentLanguage[]).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={language === l}
            onClick={() => setLanguage(l)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${language === l ? 'bg-primary/10 text-primary' : 'text-ink-soft hover:text-ink'}`}
          >
            {consentNotice[l].languageName}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="wb-display text-2xl text-ink sm:text-3xl">{withdrawn ? t.withdrawnTitle : t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{withdrawn ? t.withdrawnBody : t.intro}</p>

        <h2 className="mt-6 text-sm font-semibold text-ink">{t.dataHeading}</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-soft">
          {t.data.map((x) => <li key={x}>{x}</li>)}
        </ul>
        <h2 className="mt-6 text-sm font-semibold text-ink">{t.purposesHeading}</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-soft">
          {t.purposes.map((x) => <li key={x}>{x}</li>)}
        </ul>
        <h2 className="mt-6 text-sm font-semibold text-ink">{t.sharingHeading}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.sharing}</p>
        <h2 className="mt-6 text-sm font-semibold text-ink">{t.retentionHeading}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.retention}</p>
        <h2 className="mt-6 text-sm font-semibold text-ink">{t.rightsHeading}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {t.rights}{' '}
          <Link href="/your-data/" target="_blank" className="font-medium text-primary underline underline-offset-2">
            {t.rightsLink}
          </Link>
        </p>

        <div className="mt-7 flex flex-col gap-3.5 border-t border-border pt-6">
          {check(consented, setConsented, t.consentLabel)}
          {check(adult, setAdult, t.ageLabel)}
          {check(terms, setTerms, <Link href="/terms/" target="_blank" className="underline underline-offset-2">{t.termsLabel}</Link>)}
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-error">{t.error}</p>}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:items-center sm:justify-between">
          <button type="button" onClick={agree} disabled={!ready} className="wb-btn wb-btn-md wb-btn-primary disabled:opacity-50">
            {busy ? t.saving : t.continueLabel}
          </button>
          <button type="button" onClick={() => void signOutEverywhere()} className="wb-btn wb-btn-md text-ink-soft hover:text-ink">
            {t.logOutLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
