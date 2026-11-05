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
      wasSignedIn = true;
      setSession({ status: 'signedIn', user: toSessionUser(user) });
    } else {
      const expired = wasSignedIn && !signingOut;
      wasSignedIn = false;
      signingOut = false;
      setSession({ status: 'signedOut', user: null, ...(expired && { reason: 'expired' as const }) });
    }
  });
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
