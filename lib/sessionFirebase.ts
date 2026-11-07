'use client';

import { onIdTokenChanged, signOut, type User } from 'firebase/auth';
import { firebaseAuth, isFirebaseConfigured } from './firebase';
import { setSession, type SessionUser } from './session';

let listening = false;
let wasSignedIn = false;
let signingOut = false;

export function toSessionUser(user: User): SessionUser {
  return {
    uid: user.uid,
    phoneNumber: user.phoneNumber,
    email: user.email,
    displayName: user.displayName,
    providers: user.providerData.map((p) => p.providerId),
  };
}

export function listen() {
  if (listening) return;
  listening = true;
  if (!isFirebaseConfigured()) {
    setSession({ status: 'signedOut', user: null, reason: 'unconfigured' });
    return;
  }
  // Fires on sign-in, sign-out and every token refresh. If Firebase cannot
  // refresh the token (account disabled or deleted, refresh token revoked,
  // password-equivalent change), it signs the user out and this reports it.
  onIdTokenChanged(firebaseAuth(), (user) => {
    if (user) {
      watchBlock(user);
    } else {
      stopBlockWatch();
      const reason = blockedOut ? ('blocked' as const) : removedOut ? ('deleted' as const) : wasSignedIn && !signingOut ? ('expired' as const) : undefined;
      wasSignedIn = false;
      signingOut = false;
      blockedOut = false;
      removedOut = false;
      setSession({ status: 'signedOut', user: null, ...(reason && { reason }) });
    }
  });
}

/*
 * Admin blocks: each signed-in browser watches its own blocks/{uid} record.
 * The session only becomes "signedIn" once that record is known to be
 * absent, and the moment it appears every browser signs out and shows the
 * blocked message. Firestore's rules refuse a blocked user's data anyway.
 */
let watchedUid: string | null = null;
let unwatchBlock: (() => void) | null = null;
/** Block status for watchedUid: null until the first answer arrives. */
let blocked: boolean | null = null;
let blockedOut = false;
let removedOut = false;

/** Signs out because the admin deleted this account; the login page says so. */
export async function signOutDeleted() {
  removedOut = true;
  await signOut(firebaseAuth());
}

function watchBlock(user: User) {
  if (watchedUid === user.uid) {
    // Token refresh for the same user: keep the existing watch.
    if (blocked === false) setSession({ status: 'signedIn', user: toSessionUser(user) });
    return;
  }
  stopBlockWatch();
  const uid = user.uid;
  watchedUid = uid;
  void import('./blocks').then(({ watchBlocked }) => {
    if (watchedUid !== uid) return;
    unwatchBlock = watchBlocked(uid, (isBlocked) => {
      if (watchedUid !== uid) return;
      blocked = isBlocked;
      if (isBlocked) {
        blockedOut = true;
        void signOut(firebaseAuth());
        return;
      }
      wasSignedIn = true;
      const current = firebaseAuth().currentUser;
      if (current?.uid === uid) setSession({ status: 'signedIn', user: toSessionUser(current) });
    });
  });
}

function stopBlockWatch() {
  unwatchBlock?.();
  unwatchBlock = null;
  watchedUid = null;
  blocked = null;
}

/** Re-reads the user after linking or unlinking a sign-in method. */
export async function refreshUser() {
  const user = firebaseAuth().currentUser;
  if (!user) return;
  await user.reload();
  await user.getIdToken(true);
  setSession({ status: 'signedIn', user: toSessionUser(firebaseAuth().currentUser ?? user) });
}

export async function signOutUser() {
  signingOut = true;
  await signOut(firebaseAuth());
}
