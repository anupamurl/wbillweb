import type { Metadata } from 'next';
import Link from 'next/link';
import Faq from '@/components/Faq';
import FaqJsonLd from '@/components/FaqJsonLd';
import Icon from '@/components/Icon';
import { supportFaq } from '@/content/supportFaq';
import { brand } from '@/lib/brand';
import { delay } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Get help with wbill — email support@wbill.app and we reply within one business day. Answers to the questions we get asked most.',
  alternates: { canonical: `${brand.url}/support/` },
};

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="wb-in text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        We’re here
      </p>
      <h1
        className="wb-in mt-3 text-4xl font-bold tracking-[-0.03em] text-text-primary sm:text-5xl"
        style={delay(60)}
      >
        Support
      </h1>
      <p
        className="wb-in mt-5 max-w-xl text-lg leading-relaxed text-text-secondary"
        style={delay(120)}
      >
        Something not working, a question about your bills, or a request to export or delete your
        data? Write to us and a person will reply.
      </p>

      <div
        className="wb-in mt-10 flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7 sm:flex-row sm:items-center sm:justify-between"
        style={delay(180)}
      >
        <div>
          <p className="text-base font-semibold text-text-primary">Email support</p>
          <p className="mt-1 text-sm text-text-secondary">
            We reply within one business day, Monday to Friday.
          </p>
        </div>
        <a
          href={`mailto:${brand.email}`}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25"
        >
          {brand.email}
          <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
          Frequently asked questions
        </h2>
        <div className="mt-5">
          <Faq items={supportFaq} />
        </div>
      </div>
      <FaqJsonLd items={supportFaq} />

      <div className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-text-secondary">
        <Link href="/privacy" className="font-medium text-primary hover:underline">
          Privacy policy
        </Link>
        <Link href="/terms" className="font-medium text-primary hover:underline">
          Terms of service
        </Link>
        <Link href="/invoice-format" className="font-medium text-primary hover:underline">
          Bill format guides
        </Link>
      </div>
    </main>
  );
}
