'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/** Single-task routes that keep the site header but drop the long marketing footer. */
const FOCUSED_ROUTES = ['/login', '/signup'];

export function isFocusedRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return FOCUSED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Wraps the site footer. Sign-in pages are a single task, so they keep the
 * header (and the site's identity) but skip the long footer.
 * The pathname is known at build time for static export, so nothing flashes.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isFocusedRoute(pathname)) return null;
  return <>{children}</>;
}
