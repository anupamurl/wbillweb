'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * Who is signed in, as told by Firebase Auth. This module holds no Firebase
 * code of its own, so marketing pages stay light: the SDK is only fetched on
 * pages that need it (login, dashboard) or when this browser has signed in
 * before.
 *
 * This state only decides what the browser shows. It is never the authority
 * for data: every read and write goes to Firestore with the user's ID token,
 * and Firestore's security rules check that token on the server.
 */
export type SessionUser = {
  uid: string;
  phoneNumber: string | null;
  email: string | null;
  displayName: string | null;
  /** Firebase provider ids, e.g. 'phone', 'google.com'. */
  providers: string[];
};

export type Session =
  | { status: 'unknown'; user: null }
  | { status: 'signedIn'; user: SessionUser }
  | { status: 'signedOut'; user: null; reason?: 'expired' | 'unconfigured' | 'blocked' | 'deleted' };

const HINT_KEY = 'wb_signed_in';

let session: Session = { status: 'unknown', user: null };
const listeners = new Set<() => void>();
let starting: Promise<void> | null = null;

export function setSession(next: Session) {
  session = next;
  try {
    if (next.status === 'signedIn') localStorage.setItem(HINT_KEY, '1');
    else if (next.status === 'signedOut') localStorage.removeItem(HINT_KEY);
  } catch {
    // Storage blocked (private mode): the hint is only an optimisation.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True if this browser was signed in last time; decides whether to load the SDK eagerly. */
export function hadSession(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
}

/** Loads Firebase Auth (once) and starts listening for the signed-in user. */
export function startSession(): Promise<void> {
  starting ??= import('./sessionFirebase').then((m) => m.listen());
  return starting;
}

/**
 * The current session. `eager` loads Firebase straight away (login and
 * dashboard pages); otherwise it loads only if this browser had a session,
 * and a fresh visitor sees "signedOut" without downloading the SDK.
 */
export function useSession({ eager = false }: { eager?: boolean } = {}): Session {
  const current = useSyncExternalStore(subscribe, () => session, () => session);
  useEffect(() => {
    if (eager || hadSession()) {
      void startSession();
    } else if (session.status === 'unknown') {
      setSession({ status: 'signedOut', user: null });
    }
  }, [eager]);
  return current;
}

export async function signOutEverywhere(): Promise<void> {
  const m = await import('./sessionFirebase');
  await m.signOutUser();
}
