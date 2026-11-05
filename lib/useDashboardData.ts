'use client';

import { useEffect, useState } from 'react';
import { watchBills, watchShop } from './data';
import type { Bill, Shop } from './models';

export type DashboardData = {
  loading: boolean;
  error: string | null;
  shop: Shop | null;
  /** True once the shop snapshot has resolved and there is no shop yet. */
  needsShopSetup: boolean;
  bills: Bill[];
};

/**
 * Live Firestore data for the signed-in user, scoped by their uid exactly
 * like the mobile app's providers.dart. No userId is ever sent to the
 * server as the authority — Firestore rules key every read off the
 * caller's verified token (request.auth.uid), so this hook can only ever
 * see the signed-in user's own shop and bills.
 */
export function useDashboardData(uid: string | null): DashboardData {
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopLoaded, setShopLoaded] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoaded, setBillsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShop(null);
    setShopLoaded(false);
    setBills([]);
    setBillsLoaded(false);
    setError(null);
    if (!uid) return;

    const onError = (e: Error) => setError(e.message || 'Could not load your data. Check your connection and try again.');
    const unsubShop = watchShop(
      uid,
      (s) => {
        setShop(s);
        setShopLoaded(true);
      },
      onError,
    );
    const unsubBills = watchBills(
      uid,
      (b) => {
        setBills(b);
        setBillsLoaded(true);
      },
      onError,
    );
    return () => {
      unsubShop();
      unsubBills();
    };
  }, [uid]);

  return {
    loading: !shopLoaded || !billsLoaded,
    error,
    shop,
    needsShopSetup: shopLoaded && shop === null,
    bills,
  };
}
