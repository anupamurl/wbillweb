'use client';

import {
  collection,
  deleteField,
  doc,
  type Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { billFromDoc, shopFromDoc, type Bill, type BillItem, type Shop } from './models';
import { computeBill, type GstMode } from './gst';

/**
 * Mirrors wbillmobile/lib/data/*.dart exactly: same collections, same
 * transaction for the bill counter, same fields the Firestore rules expect.
 * The website and the app are two clients of one backend.
 */

const db = (): Firestore => firestore();
const shopRef = (uid: string) => doc(collection(db(), 'shops'), uid);
const billsRef = (uid: string) => collection(shopRef(uid), 'bills');

export function watchShop(uid: string, onChange: (shop: Shop | null) => void, onError: (e: Error) => void) {
  return onSnapshot(shopRef(uid), (snap) => onChange(shopFromDoc(snap)), onError);
}

/**
 * All of a shop's bills, newest first — or, with `createdBy`, only that
 * person's (employees may only read their own; the rules require the filter).
 * The filtered query sorts in the browser so it needs no composite index.
 */
export function watchBills(
  shopId: string,
  onChange: (bills: Bill[]) => void,
  onError: (e: Error) => void,
  createdBy?: string,
) {
  const q = createdBy
    ? query(billsRef(shopId), where('createdBy', '==', createdBy))
    : query(billsRef(shopId), orderBy('billNumber', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const bills = snap.docs.map(billFromDoc);
      if (createdBy) bills.sort((a, b) => b.billNumber - a.billNumber);
      onChange(bills);
    },
    onError,
  );
}

export async function getShop(uid: string): Promise<Shop | null> {
  return shopFromDoc(await getDoc(shopRef(uid)));
}

export async function createShop(
  uid: string,
  input: { name: string; address: string; phone: string; ownerPhone: string; gstin: string; segments: string[]; gstMode: GstMode },
) {
  await setDoc(shopRef(uid), {
    name: input.name,
    address: input.address,
    phone: input.phone,
    ownerPhone: input.ownerPhone,
    ...(input.gstin ? { gstin: input.gstin } : {}),
    segments: input.segments.slice(0, MAX_SHOP_SEGMENTS),
    gstMode: input.gstMode,
    nextBillNumber: 1,
    createdAt: serverTimestamp(),
  });
}

/** `gstin` is normalised and validated by the caller (lib/gstin.ts); '' removes it. */
export async function updateShop(uid: string, input: { name: string; address: string; phone: string; gstin: string }) {
  await updateDoc(shopRef(uid), { name: input.name, address: input.address, phone: input.phone, gstin: input.gstin || deleteField() });
}

/** Most segments one shop can pick. Keep in sync with firestore.rules. */
export const MAX_SHOP_SEGMENTS = 20;

/** The owner's business types (segments) and GST mode. */
export async function updateShopBilling(uid: string, input: { segments: string[]; gstMode: GstMode }) {
  await updateDoc(shopRef(uid), { segments: input.segments.slice(0, MAX_SHOP_SEGMENTS), gstMode: input.gstMode });
}

/** Sets the shop logo (`preset:<id>` or an image data URL), or removes it with null. */
export async function updateShopLogo(uid: string, logo: string | null) {
  await updateDoc(shopRef(uid), { logo: logo ?? deleteField() });
}

export type BillDraft = {
  customerName: string;
  customerPhone: string;
  items: Pick<BillItem, 'name' | 'qty' | 'unitPrice' | 'gstRate'>[];
  /** The shop's GST mode, stamped on the bill so it always reads the same. */
  gstMode: GstMode;
};

/**
 * Takes the shop's next bill number and writes the bill in the same
 * transaction, exactly like BillRepository.saveBill in the Flutter app, so
 * two bills from either client can never collide on a number. The security
 * rules re-check this invariant server-side.
 */
export async function saveBill(uid: string, draft: BillDraft, creator: { uid: string; name: string }): Promise<Bill> {
  const { items, subtotal, gstTotal, grandTotal } = computeBill(draft.items, draft.gstMode);

  return runTransaction(db(), async (tx) => {
    const shopSnap = await tx.get(shopRef(uid));
    const n = (shopSnap.data()?.nextBillNumber as number | undefined) ?? 1;
    const ref = doc(billsRef(uid));
    const data = {
      billNumber: n,
      date: serverTimestamp(),
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      items,
      subtotal,
      gstTotal,
      gstMode: draft.gstMode,
      grandTotal,
      status: 'active' as const,
      createdAt: serverTimestamp(),
      createdBy: creator.uid,
      createdByName: creator.name.slice(0, 80),
    };
    tx.set(ref, data);
    tx.update(shopRef(uid), { nextBillNumber: n + 1 });
    return {
      id: ref.id,
      billNumber: n,
      date: new Date(),
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      items,
      subtotal,
      gstTotal,
      gstMode: draft.gstMode,
      grandTotal,
      status: 'active' as const,
      createdBy: creator.uid,
      createdByName: creator.name.slice(0, 80),
    };
  });
}

/** Local calendar day as YYYY-MM-DD, the id of a logins doc. */
export function dayId(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Marks today as a day this owner used WBill (shops/{uid}/logins/{day}).
 * Written at most once per day per browser; failures are ignored because
 * this only feeds the admin panel's stats. Also clears records past the
 * one-year retention period.
 */
export function recordLogin(uid: string) {
  const day = dayId();
  const key = `wb_login_${uid}`;
  try {
    if (localStorage.getItem(key) === day) return;
  } catch {
    // Storage blocked: just write again, it's one small doc.
  }
  setDoc(doc(shopRef(uid), 'logins', day), { at: serverTimestamp(), platform: 'web' })
    .then(() => {
      try {
        localStorage.setItem(key, day);
      } catch {
        // Ignore.
      }
      void import('./privacyData').then((m) => m.purgeOldLogins(uid)).catch(() => {});
    })
    .catch(() => {});
}
