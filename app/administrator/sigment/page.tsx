'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Old/misspelt address for the Segments page. */
export default function SigmentRedirect() {
  const router = useRouter();
  useEffect(() => router.replace('/administrator/segments/'), [router]);
  return null;
}
