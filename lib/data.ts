'use client';

import {
  collection,
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
  writeBatch,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { billFromDoc, shopFromDoc, type Bill, type BillItem, type Shop } from './models';

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

export function watchBills(uid: string, onChange: (bills: Bill[]) => void, onError: (e: Error) => void) {
  const q = query(billsRef(uid), orderBy('billNumber', 'desc'));
  return onSnapshot(q, (snap) => onChange(snap.docs.map(billFromDoc)), onError);
}

export async function getShop(uid: string): Promise<Shop | null> {
  return shopFromDoc(await getDoc(shopRef(uid)));
}

export async function createShop(uid: string, input: { name: string; address: string; phone: string; ownerPhone: string }) {
  await setDoc(shopRef(uid), {
    name: input.name,
    address: input.address,
    phone: input.phone,
    ownerPhone: input.ownerPhone,
    nextBillNumber: 1,
    createdAt: serverTimestamp(),
  });
}

export async function updateShop(uid: string, input: { name: string; address: string; phone: string }) {
  await updateDoc(shopRef(uid), { name: input.name, address: input.address, phone: input.phone });
}

export type BillDraft = {
  customerName: string;
  customerPhone: string;
  items: Pick<BillItem, 'name' | 'qty' | 'unitPrice'>[];
};

/**
 * Takes the shop's next bill number and writes the bill in the same
 * transaction, exactly like BillRepository.saveBill in the Flutter app, so
 * two bills from either client can never collide on a number. The security
 * rules re-check this invariant server-side.
 */
export async function saveBill(uid: string, draft: BillDraft): Promise<Bill> {
  const items: BillItem[] = draft.items.map((i) => ({ ...i, lineTotal: i.qty * i.unitPrice }));
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

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
      grandTotal: subtotal,
      status: 'active' as const,
      createdAt: serverTimestamp(),
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
      grandTotal: subtotal,
      status: 'active' as const,
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
 * this only feeds the admin panel's stats.
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
    })
    .catch(() => {});
}

let selfDeleting = false;
/** True while the owner is deleting their own account (so it isn't mistaken for an admin delete). */
export function isSelfDeleting() {
  return selfDeleting;
}

/** Deletes the shop, every bill and login record under it — used for account deletion. */
export async function deleteShopAndBills(uid: string, bills: Bill[]) {
  selfDeleting = true;
  try {
    const batch = writeBatch(db());
    for (const bill of bills) batch.delete(doc(billsRef(uid), bill.id));
    const logins = await getDocs(collection(shopRef(uid), 'logins'));
    for (const login of logins.docs) batch.delete(login.ref);
    batch.delete(shopRef(uid));
    await batch.commit();
  } catch (err) {
    selfDeleting = false;
    throw err;
  }
}
