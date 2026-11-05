'use client';

import { createContext, useContext } from 'react';
import { useDashboardData, type DashboardData } from './useDashboardData';
import type { SessionUser } from './session';

type DashboardContextValue = DashboardData & { user: SessionUser };

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const data = useDashboardData(user.uid);
  return <DashboardContext.Provider value={{ ...data, user }}>{children}</DashboardContext.Provider>;
}

/** Only usable inside the dashboard, where the layout guarantees a signed-in user. */
export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within the dashboard.');
  return ctx;
}
