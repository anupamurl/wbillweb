'use client';

import { collection, collectionGroup, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, setDoc, writeBatch, type DocumentSnapshot, type Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firebaseAuth, firestore } from '../firebase';
import { billFromDoc, shopFromDoc, type Bill, type Shop } from '../models';
import { removeAllEmployees } from '../team';

/**
 * Data for the /administrator panel.
 *
 * Nothing here is trusted for access: Firestore's rules allow these reads
 * only to a Google-signed-in wbillapp@gmail.com session. The admin never
 * edits a shop or its bills; the only writes are blocks, deletes and the
 * segment catalogues (lib/segments.ts). A non-admin who opens this page gets permission-denied errors.
 */

export type AdminShop = Shop & { createdAt: Date | null };
export type AdminBill = Bill & { shopId: string; createdAt: Date | null };

function tsToDate(value: unknown): Date | null {
  const ts = value as Timestamp | undefined;
  return ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
}

function adminShopFromDoc(snap: DocumentSnapshot): AdminShop | null {
  const shop = shopFromDoc(snap);
  if (!shop) return null;
  return { ...shop, createdAt: tsToDate(snap.data()?.createdAt) };
}

function adminBillFromDoc(snap: DocumentSnapshot): AdminBill {
  return {
    ...billFromDoc(snap),
    shopId: snap.ref.parent.parent?.id ?? '',
    createdAt: tsToDate(snap.data()?.createdAt),
  };
}

/** The only account allowed into /administrator. Keep in sync with firestore.rules. */
export const ADMIN_EMAIL = 'wbillapp@gmail.com';

/**
 * True only if the current session was signed in with Google (SSO) as
 * ADMIN_EMAIL with a verified address. A phone-OTP session on the same
 * account doesn't count. Mirrors isAdmin() in firestore.rules.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const user = firebaseAuth().currentUser;
    if (!user) return false;
    const { claims, signInProvider } = await user.getIdTokenResult();
    return signInProvider === 'google.com' && claims.email_verified === true && claims.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

/**
 * Whether the signed-in user (by uid) is the super admin: null while
 * checking or signed out, then true/false. Re-checks when the uid changes.
 */
export function useIsAdmin(uid: string | null): boolean | null {
  const [result, setResult] = useState<{ uid: string; admin: boolean } | null>(null);
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    void checkIsAdmin().then((admin) => !cancelled && setResult({ uid, admin }));
    return () => {
      cancelled = true;
    };
  }, [uid]);
  return uid && result?.uid === uid ? result.admin : null;
}

/** One day a shop owner opened the WBill website: shops/{uid}/logins/{YYYY-MM-DD}. */
export type AdminLogin = { uid: string; day: string; at: Date | null };

export type AdminData = {
  loading: boolean;
  error: string | null;
  shops: AdminShop[];
  bills: AdminBill[];
  logins: AdminLogin[];
  /** Blocked users: uid → when they were blocked. */
  blocked: Map<string, Date | null>;
  /** Login stats failed to load (e.g. rules not yet published); the rest still works. */
  loginsError: string | null;
  lastUpdated: Date | null;
};

/** Live snapshot of every shop, bill and login day on the platform. */
export function useAdminData(enabled: boolean): AdminData {
  const [shops, setShops] = useState<AdminShop[] | null>(null);
  const [bills, setBills] = useState<AdminBill[] | null>(null);
  const [logins, setLogins] = useState<AdminLogin[]>([]);
  const [blocked, setBlocked] = useState<Map<string, Date | null>>(new Map());
  const [loginsError, setLoginsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const db = firestore();
    const onError = (e: Error & { code?: string }) =>
      setError(
        e.code === 'permission-denied'
          ? 'Firestore refused the admin reads. Publish the latest wbillmobile/firestore.rules in the Firebase console (Firestore Database → Rules), then reload.'
          : e.message || 'Could not load platform data.',
      );
    const unsubShops = onSnapshot(
      collection(db, 'shops'),
      (snap) => {
        setShops(snap.docs.map(adminShopFromDoc).filter((s): s is AdminShop => s !== null));
        setLastUpdated(new Date());
      },
      onError,
    );
    // No orderBy: a collection-group query with ordering needs an extra
    // index. Sorting happens in the browser instead.
    const unsubBills = onSnapshot(
      collectionGroup(db, 'bills'),
      (snap) => {
        const list = snap.docs.map(adminBillFromDoc);
        list.sort((a, b) => b.date.getTime() - a.date.getTime());
        setBills(list);
        setLastUpdated(new Date());
      },
      onError,
    );
    const unsubLogins = onSnapshot(
      collectionGroup(db, 'logins'),
      (snap) => {
        setLogins(
          snap.docs.map((d) => {
            return { uid: d.ref.parent.parent?.id ?? '', day: d.id, at: tsToDate(d.data().at) };
          }),
        );
        setLoginsError(null);
      },
      (e) => setLoginsError(e.message || 'Could not load login data.'),
    );
    const unsubBlocks = onSnapshot(
      collection(db, 'blocks'),
      (snap) => setBlocked(new Map(snap.docs.map((d) => [d.id, tsToDate(d.data().blockedAt)]))),
      () => setBlocked(new Map()),
    );
    return () => {
      unsubShops();
      unsubBills();
      unsubLogins();
      unsubBlocks();
    };
  }, [enabled]);

  return {
    loading: shops === null || bills === null,
    error,
    shops: shops ?? [],
    bills: bills ?? [],
    logins,
    blocked,
    loginsError,
    lastUpdated,
  };
}

/**
 * Blocks a user: Firestore's rules then refuse all their shop and bill
 * access, and every browser they're signed in on signs out at once.
 */
export async function blockUser(uid: string) {
  await step('blocking', () => setDoc(doc(firestore(), 'blocks', uid), { blockedAt: serverTimestamp() }));
}

export async function unblockUser(uid: string) {
  await step('unblocking', () => deleteDoc(doc(firestore(), 'blocks', uid)));
}

/**
 * Permanently deletes a user's data from Firestore: every bill, every login
 * record, any block record, then the shop itself. Bills go first so that a
 * failure part-way leaves the shop visible in the panel to retry.
 * The Firebase Auth sign-in record isn't touched (that needs a server).
 */
export async function deleteUserData(uid: string) {
  const db = firestore();
  const shop = doc(db, 'shops', uid);
  for (const sub of ['bills', 'logins', 'items']) {
    const snap = await step(`reading ${sub}`, () => getDocs(collection(shop, sub)));
    for (let i = 0; i < snap.docs.length; i += 450) {
      const batch = writeBatch(db);
      for (const d of snap.docs.slice(i, i + 450)) batch.delete(d.ref);
      await step(`deleting ${sub}`, () => batch.commit());
    }
  }
  // Their team (employee records + invites + links), and their own link if
  // they were someone else's employee.
  await step('removing employees', () => removeAllEmployees(uid));
  const batch = writeBatch(db);
  batch.delete(doc(db, 'blocks', uid));
  batch.delete(doc(db, 'members', uid));
  batch.delete(shop);
  await step('deleting the shop', () => batch.commit());
}

/** Runs one step, labelling any failure with the step name for the UI. */
async function step<T>(label: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (e) {
    const err = e as { code?: string; message?: string };
    console.error(`Admin action failed while ${label}:`, err);
    throw Object.assign(new Error(`${label}: ${err.code ?? err.message ?? 'unknown error'}`), { code: err.code, step: label });
  }
}
