import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthCard from '@/components/auth/AuthCard';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Get started',
  description: 'Create a free WBill account with your phone number or Google account and make your first digital bill.',
  alternates: { canonical: `${brand.url}/signup/` },
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthCard mode="signup" />
    </Suspense>
  );
}
