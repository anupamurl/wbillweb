'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { recordLogin } from './data';
import { useDashboardData, type DashboardData } from './useDashboardData';
import type { SessionUser } from './session';
import { touchEmployeeLogin, watchEmployees, type Employee } from './team';

type DashboardContextValue = DashboardData & {
  user: SessionUser;
  isOwner: boolean;
  /** Owners only: the team, newest first. Empty for employees. */
  employees: Employee[];
  /** Name stamped on bills this login creates. */
  creatorName: string;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const data = useDashboardData(user);
  const isOwner = data.role === 'owner';
  const hasShop = Boolean(data.shop);

  // Owners: count today as a login once their shop exists (admin stats).
  // Employees: update "last seen" on their team record instead.
  useEffect(() => {
    if (isOwner && hasShop) recordLogin(user.uid);
  }, [isOwner, hasShop, user.uid]);
  useEffect(() => {
    if (data.role === 'employee' && data.shopId && data.employeeId) touchEmployeeLogin(data.shopId, data.employeeId);
  }, [data.role, data.shopId, data.employeeId]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  useEffect(() => {
    setEmployees([]);
    if (!isOwner || !hasShop || !data.shopId) return;
    return watchEmployees(data.shopId, setEmployees, () => {});
  }, [isOwner, hasShop, data.shopId]);

  // An owner's shop vanished mid-session: the admin erased this account, so sign out of this browser and say why.
  const hadShop = useRef(false);
  useEffect(() => {
    if (!isOwner) return;
    if (hasShop) hadShop.current = true;
    else if (hadShop.current && !data.loading) {
      hadShop.current = false;
      void import('./sessionFirebase').then((m) => m.signOutDeleted());
    }
  }, [isOwner, hasShop, data.loading]);

  const creatorName = isOwner ? 'Owner' : data.employeeName || user.displayName || user.phoneNumber || user.email || 'Employee';

  return (
    <DashboardContext.Provider value={{ ...data, user, isOwner, employees, creatorName }}>{children}</DashboardContext.Provider>
  );
}

/** Only usable inside the dashboard, where the layout guarantees a signed-in user. */
export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within the dashboard.');
  return ctx;
}
