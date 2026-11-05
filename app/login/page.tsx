import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthCard from '@/components/auth/AuthCard';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to WBill with your phone number or Google account.',
  alternates: { canonical: `${brand.url}/login/` },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthCard mode="login" />
    </Suspense>
  );
}
