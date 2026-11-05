import type { Metadata } from 'next';
import Link from 'next/link';
import Faq, { type FaqItem } from '@/components/Faq';
import FaqJsonLd from '@/components/FaqJsonLd';
import Icon from '@/components/Icon';
import { Eyebrow } from '@/components/landing/primitives';
import { ComparisonTable, PlanCards, PricingNote } from '@/components/pricing/PricingPlans';
import { brand } from '@/lib/brand';
import { site } from '@/lib/site';
import { delay } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'WBill is free to get started. Compare the Free, Starter, Business and Pro plans and see what each one includes.',
  alternates: { canonical: `${brand.url}/pricing/` },
  openGraph: { title: `Pricing | ${site.name}`, url: `${brand.url}/pricing/` },
};

const pricingFaq: FaqItem[] = [
  {
    question: 'Is the Free plan really free?',
    answer: 'Yes. The Free plan costs nothing and needs no card. It includes digital bills, automatic bill numbers and customer records.',
  },
  {
    question: 'Will I be charged for a paid plan?',
    answer: 'Not yet. Paid billing isn’t live, so no plan is charged today. We’ll tell you clearly, in advance, before anything is ever charged.',
  },
  {
    question: 'What does “In the mobile app” mean?',
    answer: 'These features — PDF bills and WhatsApp sharing — are built into the WBill mobile app, which is coming to the App Store and Google Play. The web dashboard covers billing, customer records and insights today.',
  },
  {
    question: 'What does “Coming soon” mean?',
    answer: 'These features are planned but not built yet. They are listed so you can see where WBill is heading; they aren’t part of any plan until they are released.',
  },
  {
    question: 'Do my customers pay anything?',
    answer: 'No. Receiving bills from you is always free for your customers, and they don’t need a WBill account.',
  },
];

export default function PricingPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-line">
        <div className="wb-dots" aria-hidden="true" />
        <div className="wb-container relative pb-20 pt-20 text-center sm:pt-28">
          <Eyebrow className="wb-in justify-center">Pricing</Eyebrow>
          <h1 className="wb-in wb-hero-title mx-auto mt-6 max-w-4xl text-ink" style={delay(60)}>
            Simple plans. Start free.
          </h1>
          <p className="wb-in wb-lead mx-auto mt-6 max-w-xl" style={delay(120)}>
            Everything you need to move off paper is free. Paid plans add insight and, as they arrive, records
            beyond the bill.
          </p>
          <div className="mt-16 text-left">
            <PlanCards headingLevel="h2" />
          </div>
          <PricingNote />
        </div>
      </section>

      <section aria-labelledby="compare-title" className="wb-section">
        <div className="wb-container">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Compare</Eyebrow>
              <h2 id="compare-title" className="wb-h3 mt-4 text-ink">
                Every feature, every plan
              </h2>
            </div>
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-soft">
              <div className="flex items-center gap-2">
                <dt><Icon name="check" className="h-4 w-4 text-primary" /></dt>
                <dd>Available now</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt><span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-primary">App</span></dt>
                <dd>In the mobile app (coming soon)</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt><span className="rounded-full bg-canvas-deep px-1.5 py-0.5 text-[0.65rem] font-medium text-ink-soft">Soon</span></dt>
                <dd>Planned, not built yet</dd>
              </div>
            </dl>
          </div>
          <ComparisonTable />
        </div>
      </section>

      <section aria-labelledby="pricing-faq-title" className="wb-section border-t border-line">
        <div className="wb-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 id="pricing-faq-title" className="wb-h2 mt-5 text-ink">
              About plans and billing
            </h2>
            <p className="wb-lead mt-6">
              Still unsure which plan fits?{' '}
              <Link href="/support/" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                Ask us
              </Link>
              .
            </p>
          </div>
          <Faq items={pricingFaq} />
        </div>
        <FaqJsonLd items={pricingFaq} />
      </section>
    </main>
  );
}
