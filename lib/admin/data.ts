'use client';

import { collection, collectionGroup, doc, getDoc, onSnapshot, type DocumentSnapshot, type Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { billFromDoc, shopFromDoc, type Bill, type Shop } from '../models';

/**
 * Read-only data for the /administrator panel.
 *
 * Nothing here is trusted for access: Firestore's rules allow these reads
 * only when admins/{request.auth.uid} exists, and they never allow an admin
 * to write. A non-admin who opens this page gets permission-denied errors.
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

/** True if the signed-in user has an admins/{uid} document. */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(firestore(), 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export type AdminData = {
  loading: boolean;
  error: string | null;
  shops: AdminShop[];
  bills: AdminBill[];
  lastUpdated: Date | null;
};

/** Live snapshot of every shop and every bill on the platform. */
export function useAdminData(enabled: boolean): AdminData {
  const [shops, setShops] = useState<AdminShop[] | null>(null);
  const [bills, setBills] = useState<AdminBill[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const db = firestore();
    const onError = (e: Error) => setError(e.message || 'Could not load platform data.');
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
    return () => {
      unsubShops();
      unsubBills();
    };
  }, [enabled]);

  return {
    loading: shops === null || bills === null,
    error,
    shops: shops ?? [],
    bills: bills ?? [],
    lastUpdated,
  };
}
