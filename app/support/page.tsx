import type { Metadata } from 'next';
import Link from 'next/link';
import Faq from '@/components/Faq';
import FaqJsonLd from '@/components/FaqJsonLd';
import { supportFaq } from '@/content/supportFaq';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with wbill.',
  alternates: { canonical: `${brand.url}/support/` },
};

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">Support</h1>
      <p className="mt-4 text-text-secondary">
        Something not working, or have a question? Email us and we&rsquo;ll reply within one business
        day.
      </p>
      <a
        href={`mailto:${brand.email}`}
        className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        {brand.email}
      </a>

      <div className="mt-14">
        <h2 className="text-xl font-semibold text-text-primary">Frequently asked questions</h2>
        <div className="mt-4">
          <Faq items={supportFaq} />
        </div>
      </div>
      <FaqJsonLd items={supportFaq} />

      <p className="mt-14 text-sm text-text-secondary">
        See also our <Link href="/privacy" className="text-primary underline">privacy policy</Link>.
      </p>
    </main>
  );
}
