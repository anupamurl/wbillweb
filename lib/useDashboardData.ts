'use client';

import { useEffect, useState } from 'react';
import { watchBills, watchShop } from './data';
import type { Bill, Shop } from './models';
import type { SessionUser } from './session';
import { resolveWorkspace, watchMyEmployeeRecord, type Workspace } from './team';

export type Role = 'owner' | 'employee' | 'removed';

export type DashboardData = {
  loading: boolean;
  error: string | null;
  role: Role | null;
  /** The shop this login works in: their own (owner) or their employer's. */
  shopId: string | null;
  /** Employees only: their record in the owner's team. */
  employeeId: string | null;
  /** Employees only: the name the owner gave them (stamped on their bills). */
  employeeName: string;
  /** Shop name for a removed employee's notice. */
  removedFrom: string;
  shop: Shop | null;
  /** True once an owner's shop snapshot has resolved and there is no shop yet. */
  needsShopSetup: boolean;
  /** Owners: every bill. Employees: only the bills they made. */
  bills: Bill[];
  /** Works out the role again (after a removed employee leaves the shop). */
  reresolve: () => void;
};

/**
 * Live Firestore data for the signed-in user. Works out first whether they
 * are an owner or an employee (see lib/team.ts), then watches the right
 * shop. Firestore rules key every read off the caller's verified token, so
 * this can only ever see what that login is allowed to.
 */
export function useDashboardData(user: SessionUser): DashboardData {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopLoaded, setShopLoaded] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoaded, setBillsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [employeeName, setEmployeeName] = useState('');

  const uid = user.uid;
  const identity = `${user.phoneNumber ?? ''}|${user.email ?? ''}`;

  useEffect(() => {
    let cancelled = false;
    setWorkspace(null);
    setError(null);
    resolveWorkspace(user)
      .then((w) => !cancelled && setWorkspace(w))
      .catch((e: Error) => !cancelled && setError(e.message || 'Could not load your account.'));
    return () => {
      cancelled = true;
    };
    // Re-resolve when the login or its phone/email changes, or after "leave shop".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, identity, attempt]);

  const shopId = workspace && workspace.role !== 'removed' ? workspace.shopId : null;
  const employeeId = workspace?.role === 'employee' ? workspace.employeeId : null;

  useEffect(() => {
    setShop(null);
    setShopLoaded(false);
    setBills([]);
    setBillsLoaded(false);
    if (!shopId) return;

    const onError = (e: Error) => setError(e.message || 'Could not load your data. Check your connection and try again.');
    const unsubs = [
      watchShop(
        shopId,
        (s) => {
          setShop(s);
          setShopLoaded(true);
        },
        onError,
      ),
      watchBills(
        shopId,
        (b) => {
          setBills(b);
          setBillsLoaded(true);
        },
        onError,
        employeeId ? uid : undefined,
      ),
    ];
    // The owner removing this employee ends their access right away.
    if (employeeId) {
      unsubs.push(
        watchMyEmployeeRecord(shopId, employeeId, uid, (emp) => {
          if (emp) setEmployeeName(emp.name);
          else setWorkspace((w) => (w?.role === 'employee' ? { role: 'removed', shopName: w.shopName } : w));
        }),
      );
    }
    return () => unsubs.forEach((u) => u());
  }, [shopId, employeeId, uid]);

  const role = workspace?.role ?? null;
  const removed = role === 'removed';
  return {
    loading: !workspace || (!removed && (!shopLoaded || !billsLoaded)),
    error,
    role,
    shopId,
    employeeId,
    employeeName,
    removedFrom: workspace?.role === 'removed' ? workspace.shopName : '',
    shop,
    needsShopSetup: role === 'owner' && shopLoaded && shop === null,
    bills,
    reresolve: () => setAttempt((n) => n + 1),
  };
}
