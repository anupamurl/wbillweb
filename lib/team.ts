'use client';

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { SessionUser } from './session';

/**
 * Owners and employees. Mirrors wbillmobile/lib/data/team_repository.dart.
 *
 *   shops/{ownerUid}/employees/{id}  name, phone (10 digits), email, uid ('' until linked)
 *   invites/{key}                    shopId, employeeId, shopName — key 'p_+91<phone>' / 'e_<email>'
 *   members/{employeeUid}            shopId, employeeId, shopName — written on first sign-in
 *
 * Whoever signs up without an invite is an owner. An invited person who
 * signs in (phone OTP or Google) is linked to the owner's shop and can
 * create bills there. The Firestore rules enforce all of this.
 */

export type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
  /** Auth uid once they've signed in; '' before. */
  uid: string;
  createdAt: Date | null;
  lastLoginAt: Date | null;
};

export type Workspace =
  | { role: 'owner'; shopId: string }
  | { role: 'employee'; shopId: string; employeeId: string; shopName: string }
  | { role: 'removed'; shopName: string };

const db = () => firestore();
const employeesRef = (shopId: string) => collection(db(), 'shops', shopId, 'employees');

function toDate(v: unknown): Date | null {
  const ts = v as Timestamp | undefined;
  return ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
}

function employeeFromDoc(snap: DocumentSnapshot): Employee {
  const d = (snap.data() ?? {}) as Record<string, unknown>;
  return {
    id: snap.id,
    name: (d.name as string) ?? '',
    phone: (d.phone as string) ?? '',
    email: (d.email as string) ?? '',
    uid: (d.uid as string) ?? '',
    createdAt: toDate(d.createdAt),
    lastLoginAt: toDate(d.lastLoginAt),
  };
}

export const phoneInviteKey = (tenDigits: string) => `p_+91${tenDigits}`;
export const emailInviteKey = (email: string) => `e_${email.trim().toLowerCase()}`;

/** The invite ids this login could have been invited under. */
function myInviteKeys(user: SessionUser): string[] {
  const keys: string[] = [];
  if (user.phoneNumber) keys.push(`p_${user.phoneNumber}`);
  if (user.email) keys.push(emailInviteKey(user.email));
  return keys;
}

/** Links this login to the shop that invited it. Returns null when there's no invite. */
async function claimInvite(user: SessionUser): Promise<Extract<Workspace, { role: 'employee' }> | null> {
  for (const key of myInviteKeys(user)) {
    let snap: DocumentSnapshot;
    try {
      snap = await getDoc(doc(db(), 'invites', key));
    } catch {
      continue; // e.g. an unverified email: not readable, so not ours
    }
    if (!snap.exists()) continue;
    const inv = snap.data() as { shopId: string; employeeId: string; shopName?: string };
    const shopName = (inv.shopName ?? '').slice(0, 80);
    const batch = writeBatch(db());
    batch.set(doc(db(), 'members', user.uid), {
      shopId: inv.shopId,
      employeeId: inv.employeeId,
      shopName,
      linkedAt: serverTimestamp(),
    });
    batch.update(doc(employeesRef(inv.shopId), inv.employeeId), { uid: user.uid, linkedAt: serverTimestamp() });
    try {
      await batch.commit();
    } catch {
      continue; // already linked to someone else, or this login owns a shop
    }
    return { role: 'employee', shopId: inv.shopId, employeeId: inv.employeeId, shopName };
  }
  return null;
}

/**
 * Decides what this login is: an employee (linked, or invited and linked
 * now), an employee the owner has since removed, or an owner (with or
 * without a shop yet). A login that already owns a shop stays an owner.
 */
export async function resolveWorkspace(user: SessionUser): Promise<Workspace> {
  const member = await getDoc(doc(db(), 'members', user.uid));
  if (member.exists()) {
    const m = member.data() as { shopId: string; employeeId: string; shopName?: string };
    const emp = await getDoc(doc(employeesRef(m.shopId), m.employeeId)).catch(() => null);
    if (emp?.exists() && emp.data().uid === user.uid) {
      return { role: 'employee', shopId: m.shopId, employeeId: m.employeeId, shopName: m.shopName ?? '' };
    }
    // Removed — but maybe re-added since with a fresh invite.
    return (await claimInvite(user)) ?? { role: 'removed', shopName: m.shopName ?? '' };
  }
  const shop = await getDoc(doc(db(), 'shops', user.uid));
  if (shop.exists()) return { role: 'owner', shopId: user.uid };
  return (await claimInvite(user)) ?? { role: 'owner', shopId: user.uid };
}

/** The employee's own record (for their name); null once the owner removes them. */
export function watchMyEmployeeRecord(shopId: string, employeeId: string, uid: string, onChange: (e: Employee | null) => void) {
  return onSnapshot(
    doc(employeesRef(shopId), employeeId),
    (snap) => onChange(snap.exists() && snap.data().uid === uid ? employeeFromDoc(snap) : null),
    () => onChange(null),
  );
}

/** A removed employee leaves the shop for good, e.g. to set up their own. */
export async function leaveShop(uid: string) {
  await deleteDoc(doc(db(), 'members', uid));
}

/** Records "last seen" for the owner's team list, at most once a day per browser. */
export function touchEmployeeLogin(shopId: string, employeeId: string) {
  const key = `wb_emp_login_${employeeId}`;
  const today = new Date().toDateString();
  try {
    if (localStorage.getItem(key) === today) return;
  } catch {
    // Storage blocked: write anyway.
  }
  updateDoc(doc(employeesRef(shopId), employeeId), { lastLoginAt: serverTimestamp() })
    .then(() => {
      try {
        localStorage.setItem(key, today);
      } catch {
        // Ignore.
      }
    })
    .catch(() => {});
}

// ── Owner side ─────────────────────────────────────────────

export function watchEmployees(shopId: string, onChange: (e: Employee[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    query(employeesRef(shopId), orderBy('createdAt', 'desc')),
    (snap) => onChange(snap.docs.map(employeeFromDoc)),
    onError,
  );
}

export class TeamError extends Error {}

/** Adds an employee and the invite(s) that let them sign in. */
export async function addEmployee(shopId: string, shopName: string, input: { name: string; phone: string; email: string }) {
  const ref = doc(employeesRef(shopId));
  const batch = writeBatch(db());
  batch.set(ref, { name: input.name, phone: input.phone, email: input.email, uid: '', createdAt: serverTimestamp() });
  const invite = { shopId, employeeId: ref.id, shopName: shopName.slice(0, 80), createdAt: serverTimestamp() };
  if (input.phone) batch.set(doc(db(), 'invites', phoneInviteKey(input.phone)), invite);
  if (input.email) batch.set(doc(db(), 'invites', emailInviteKey(input.email)), invite);
  try {
    await batch.commit();
  } catch (err) {
    if ((err as { code?: string })?.code === 'permission-denied') {
      throw new TeamError('This phone number or email is already on a WBill team. Ask them to be removed from it first.');
    }
    throw new TeamError('Could not add the employee. Check your connection and try again.');
  }
}

export async function renameEmployee(shopId: string, employeeId: string, name: string) {
  await updateDoc(doc(employeesRef(shopId), employeeId), { name });
}

/**
 * Removes access at once (the employee record goes), then deletes the
 * invites. Their members link stays on purpose: next time they sign in they
 * see "you were removed from <shop>" rather than a blank shop-setup screen.
 * Their bills stay, still showing their name.
 */
export async function removeEmployee(shopId: string, emp: Employee) {
  await deleteDoc(doc(employeesRef(shopId), emp.id));
  const extras = [
    emp.phone && doc(db(), 'invites', phoneInviteKey(emp.phone)),
    emp.email && doc(db(), 'invites', emailInviteKey(emp.email)),
  ].filter(Boolean) as ReturnType<typeof doc>[];
  await Promise.all(extras.map((r) => deleteDoc(r).catch(() => {})));
}

/** Every employee of a shop and their invites — for deleting the whole account. */
export async function removeAllEmployees(shopId: string) {
  const snap = await getDocs(employeesRef(shopId));
  for (const d of snap.docs) await removeEmployee(shopId, employeeFromDoc(d));
}
