'use client';

import {
  addDoc,
  collection,
  doc,
  documentId,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { downloadCsv, isoDate, paiseToRupees } from './admin/csv';
import { firestore } from './firebase';
import { formatBillNo, type Bill, type Shop } from './models';
import { loginCutoffDay } from './retention';
import { leaveShop, removeAllEmployees, type Employee } from './team';

const db = () => firestore();
const shopDoc = (uid: string) => doc(db(), 'shops', uid);

/**
 * Closes an account (DPDP Rule 8(3)). Access to the shop ends now, but the
 * data stays, visible only to the admin, for the legal minimum of one year.
 * The Retention page in the admin panel then erases it. Safe to run twice:
 * a retry after re-verifying keeps the team list saved the first time.
 */
export async function closeAccount(uid: string, input: { role: 'owner' | 'employee'; shopName: string; employees: Employee[] }) {
  await setDoc(
    doc(db(), 'deletionRequests', uid),
    {
      requestedAt: serverTimestamp(),
      role: input.role,
      platform: 'web',
      shopName: input.shopName.slice(0, 80),
      ...(input.employees.length
        ? { employees: input.employees.map((e) => ({ name: e.name, phone: e.phone, email: e.email, uid: e.uid })) }
        : {}),
    },
    { merge: true },
  );
  if (input.role === 'owner') await removeAllEmployees(uid);
  else await leaveShop(uid);
}

/**
 * Corrects or removes one customer's name and mobile on all their bills.
 * Amounts, items and dates stay untouched. The audit entry records how many
 * bills changed, not the details themselves.
 */
export async function updateCustomerDetails(
  shopId: string,
  bills: Bill[],
  details: { name: string; phone: string },
  action: 'corrected' | 'removed',
) {
  for (let i = 0; i < bills.length; i += 400) {
    const batch = writeBatch(db());
    for (const b of bills.slice(i, i + 400)) {
      batch.update(doc(shopDoc(shopId), 'bills', b.id), { customerName: details.name, customerPhone: details.phone });
    }
    await batch.commit();
  }
  await addDoc(collection(shopDoc(shopId), 'customerEdits'), { action, bills: bills.length, at: serverTimestamp() });
}

/** Erases this owner's login records once they are past the one-year minimum. */
export async function purgeOldLogins(uid: string) {
  const old = await getDocs(query(collection(shopDoc(uid), 'logins'), where(documentId(), '<', loginCutoffDay())));
  for (let i = 0; i < old.docs.length; i += 400) {
    const batch = writeBatch(db());
    for (const d of old.docs.slice(i, i + 400)) batch.delete(d.ref);
    await batch.commit();
  }
}

/** Firestore timestamps become ISO dates, so the file is readable. */
function readable(value: unknown): unknown {
  if (value && typeof (value as { toDate?: unknown }).toDate === 'function') return (value as { toDate: () => Date }).toDate().toISOString();
  if (Array.isArray(value)) return value.map(readable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, readable(v)]));
  return value;
}

async function allDocs(path: ReturnType<typeof collection>) {
  const snap = await getDocs(path);
  return snap.docs.map((d) => ({ id: d.id, ...(readable(d.data()) as object) }));
}

/** Everything held for this login, as one JSON file (DPDP Section 11). */
export async function downloadMyData(input: {
  uid: string;
  isOwner: boolean;
  account: { phoneNumber: string | null; email: string | null; displayName: string | null };
  shop: Shop | null;
  bills: Bill[];
  employees: Employee[];
}) {
  const { uid, isOwner, account, shop, bills, employees } = input;
  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    account,
    role: isOwner ? 'owner' : 'employee',
    consentHistory: await allDocs(collection(doc(db(), 'consents', uid), 'events')),
    bills: readable(bills),
  };
  if (isOwner) {
    data.shop = shop && { ...shop, logo: shop.logo ? '(logo image not included)' : '' };
    data.employees = readable(employees);
    data.items = await allDocs(collection(shopDoc(uid), 'items'));
    data.loginDays = await allDocs(collection(shopDoc(uid), 'logins'));
    data.customerEdits = await allDocs(collection(shopDoc(uid), 'customerEdits'));
  } else {
    data.workplace = shop?.name ?? '';
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wbill-my-data-${isoDate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The bills as a spreadsheet, for accounts and GST records. */
export function downloadBillsCsv(bills: Bill[]) {
  downloadCsv(
    `wbill-bills-${isoDate(new Date())}.csv`,
    ['Bill no.', 'Date', 'Customer name', 'Customer mobile', 'Items', 'Subtotal (INR)', 'GST (INR)', 'Grand total (INR)', 'Made by'],
    bills.map((b) => [
      formatBillNo(b.billNumber),
      b.date.toISOString(),
      b.customerName,
      b.customerPhone,
      b.items.map((i) => `${i.name} x${i.qty} @ ${paiseToRupees(i.unitPrice)}`).join('; '),
      paiseToRupees(b.subtotal),
      paiseToRupees(b.gstTotal),
      paiseToRupees(b.grandTotal),
      b.createdByName,
    ]),
  );
}
