'use client';

import { collection, doc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { ConsentLanguage } from '@/content/consentNotice';
import { firestore } from './firebase';
import { POLICY_VERSION } from './legal';

export type ConsentState = { status: 'given' | 'withdrawn'; policyVersion: string; language: ConsentLanguage } | null;

/** The login's consent; null when it has never been recorded. */
export function watchConsent(uid: string, onChange: (c: ConsentState) => void, onError: (e: Error) => void) {
  return onSnapshot(
    doc(firestore(), 'consents', uid),
    (snap) => {
      const d = snap.data();
      onChange(d ? { status: d.status, policyVersion: d.policyVersion, language: d.language === 'hi' ? 'hi' : 'en' } : null);
    },
    onError,
  );
}

export function consentIsCurrent(c: ConsentState): boolean {
  return c?.status === 'given' && c.policyVersion === POLICY_VERSION;
}

/** Saves the current state and adds to the permanent history, together. */
async function record(uid: string, status: 'given' | 'withdrawn', language: ConsentLanguage, confirmed: boolean) {
  const db = firestore();
  const data = {
    status,
    policyVersion: POLICY_VERSION,
    language,
    platform: 'web' as const,
    ageConfirmed: confirmed,
    termsAccepted: confirmed,
    at: serverTimestamp(),
  };
  const current = doc(db, 'consents', uid);
  const batch = writeBatch(db);
  batch.set(current, data);
  batch.set(doc(collection(current, 'events')), data);
  await batch.commit();
}

export const giveConsent = (uid: string, language: ConsentLanguage) => record(uid, 'given', language, true);
export const withdrawConsent = (uid: string, language: ConsentLanguage) => record(uid, 'withdrawn', language, false);
