'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { isSelfDeleting, recordLogin } from './data';
import { useDashboardData, type DashboardData } from './useDashboardData';
import type { SessionUser } from './session';

type DashboardContextValue = DashboardData & { user: SessionUser };

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const data = useDashboardData(user.uid);
  // Count today as a login once the owner's shop exists.
  const hasShop = Boolean(data.shop);
  useEffect(() => {
    if (hasShop) recordLogin(user.uid);
  }, [hasShop, user.uid]);

  // The shop vanished mid-session and the owner didn't delete it: the admin
  // deleted this account, so sign out of this browser and say why.
  const hadShop = useRef(false);
  useEffect(() => {
    if (hasShop) hadShop.current = true;
    else if (hadShop.current && !data.loading && !isSelfDeleting()) {
      hadShop.current = false;
      void import('./sessionFirebase').then((m) => m.signOutDeleted());
    }
  }, [hasShop, data.loading]);
  return <DashboardContext.Provider value={{ ...data, user }}>{children}</DashboardContext.Provider>;
}

/** Only usable inside the dashboard, where the layout guarantees a signed-in user. */
export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within the dashboard.');
  return ctx;
}
