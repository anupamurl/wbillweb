'use client';

import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

/**
 * The website signs in against the same Firebase project as the mobile app
 * (wbill-284da), so a shop owner sees the same shop and bills on both.
 *
 * Every value here is a public client identifier, not a secret: access to
 * data is decided by Firestore security rules on Google's servers, which
 * check the caller's verified ID token on every read and write.
 */
const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

/**
 * Local emulators, for automated tests only. Production builds never set this.
 * Format: "127.0.0.1:9099,127.0.0.1:8080" (auth, firestore).
 */
const emulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS ?? '';

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super('Sign-in is not configured: the NEXT_PUBLIC_FIREBASE_* variables are missing from this build.');
    this.name = 'FirebaseNotConfiguredError';
  }
}

export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function firebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) throw new FirebaseNotConfiguredError();
  app ??= getApps().length ? getApp() : initializeApp(config);
  return app;
}

export function firebaseAuth(): Auth {
  if (auth) return auth;
  const a = firebaseApp();
  // IndexedDB first, localStorage as fallback: the session survives refreshes
  // and browser restarts, and Firebase refreshes the 1-hour ID token itself.
  // initializeAuth, unlike getAuth, ships no popup/redirect support unless
  // it is passed in — without it Google sign-in (signInWithPopup,
  // linkWithPopup, reauthenticateWithPopup) fails with auth/argument-error.
  try {
    auth = initializeAuth(a, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    auth = getAuth(a);
  }
  auth.languageCode = 'en';
  const [authHost] = emulators.split(',');
  if (authHost) connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
  return auth;
}

export function firestore(): Firestore {
  if (db) return db;
  db = getFirestore(firebaseApp());
  const host = emulators.split(',')[1];
  if (host) {
    const [h, p] = host.split(':');
    connectFirestoreEmulator(db, h, Number(p));
  }
  return db;
}
