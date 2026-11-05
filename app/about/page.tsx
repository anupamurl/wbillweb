import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { Eyebrow, StatusTag } from '@/components/landing/primitives';
import { PaperReceipt, InvoiceSheet } from '@/components/landing/mocks';
import { brand } from '@/lib/brand';
import { site } from '@/lib/site';
import { delay } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'About',
  description: 'WBill exists to replace paper bills with permanent digital purchase records — for every business and every customer.',
  alternates: { canonical: `${brand.url}/about/` },
  openGraph: { title: `About | ${site.name}`, url: `${brand.url}/about/` },
};

const principles = [
  {
    title: 'Universal by design',
    body: 'A bill is the same idea everywhere. WBill is built for any business that issues one, not for a single industry or a single kind of shop.',
  },
  {
    title: 'Honest about what’s built',
    body: 'We label every feature as available now, in the mobile app, or planned. If something isn’t ready, we say so.',
  },
  {
    title: 'Your records are yours',
    body: 'Business and customer data belongs to the business. We store it to run the service — never to sell it or advertise with it.',
  },
  {
    title: 'Simple first',
    body: 'Making a bill should take seconds, not training. Every screen earns its place, and nothing gets in the way of the bill.',
  },
];

const roadmap = [
  { label: 'Digital bills with automatic numbering', status: 'live' as const },
  { label: 'Customer records and purchase history', status: 'live' as const },
  { label: 'Business insights on the web dashboard', status: 'live' as const },
  { label: 'PDF bills and WhatsApp sharing', status: 'app' as const },
  { label: 'Tax and discount lines', status: 'planned' as const },
  { label: 'Order tracking and warranty records', status: 'planned' as const },
  { label: 'Purchase history for customers', status: 'planned' as const },
];

export default function AboutPage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="wb-container pb-24 pt-20 sm:pt-28">
          <Eyebrow className="wb-in">About WBill</Eyebrow>
          <h1 className="wb-in wb-hero-title mt-6 max-w-5xl text-ink" style={delay(60)}>
            Replacing paper bills with records that last.
          </h1>
          <p className="wb-in wb-lead mt-8 max-w-2xl" style={delay(120)}>
            Every day, countless purchases end with a slip of paper that fades, tears or disappears. WBill exists so
            that every purchase leaves a permanent, digital record — for the business that makes the sale and the
            customer who makes it.
          </p>
        </div>
      </section>

      <section className="border-y border-line bg-canvas-deep">
        <div className="wb-container wb-section grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow className="wb-reveal">Why it matters</Eyebrow>
            <h2 className="wb-reveal wb-h2 mt-5 text-ink" style={delay(60)}>
              A bill is the only proof of a purchase.
            </h2>
            <div className="wb-reveal mt-6 space-y-4 text-[1.05rem] leading-relaxed text-ink-soft" style={delay(120)}>
              <p>
                It answers simple questions — what was bought, when, from whom and for how much. On paper, those
                answers are fragile. Businesses lose track of who bought what. Customers can’t find a bill when they
                need it.
              </p>
              <p>
                Digital records change that. Created in seconds, shared instantly and kept in order automatically,
                they make purchases easier to manage for everyone involved.
              </p>
            </div>
          </div>
          <div className="relative mx-auto h-[26rem] w-full max-w-md" aria-hidden="true">
            <div className="absolute left-0 top-6 w-[12.5rem] -rotate-6 sm:w-[14rem]">
              <PaperReceipt faded />
            </div>
            <div className="absolute bottom-0 right-0 w-[17rem] rotate-[1.5deg] sm:w-[19rem]">
              <InvoiceSheet className="wb-shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="wb-section">
        <div className="wb-container">
          <Eyebrow>How we build</Eyebrow>
          <h2 id="principles-title" className="wb-h2 mt-5 max-w-3xl text-ink">
            Principles we hold ourselves to.
          </h2>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
            {principles.map((p, index) => (
              <li key={p.title} className="wb-reveal bg-canvas p-8 sm:p-10" style={delay((index % 2) * 80)}>
                <p className="font-mono text-xs text-ink-faint">0{index + 1}</p>
                <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-ink">{p.title}</p>
                <p className="mt-3 leading-relaxed text-ink-soft">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="roadmap-title" className="wb-section border-t border-line">
        <div className="wb-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Eyebrow>Where we are</Eyebrow>
            <h2 id="roadmap-title" className="wb-h2 mt-5 text-ink">
              Today, and what’s next.
            </h2>
            <p className="wb-lead mt-6">
              WBill is early, and growing carefully. Here is exactly what is available, and what we are working
              towards.
            </p>
          </div>
          <ul className="border-t border-line">
            {roadmap.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-4 border-b border-line py-5">
                <span className={`text-[1.02rem] ${item.status === 'planned' ? 'text-ink-soft' : 'text-ink'}`}>{item.label}</span>
                <StatusTag status={item.status} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wb-container pb-24 sm:pb-32">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] border border-line bg-surface p-8 sm:p-12 md:flex-row md:items-center">
          <div>
            <h2 className="wb-h3 text-ink">Talk to us</h2>
            <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
              Questions, feedback or ideas for what WBill should do next — we read every message.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={`mailto:${site.email}`} className="wb-btn wb-btn-lg wb-btn-secondary">
              {site.email}
            </a>
            <Link href="/signup/" className="wb-btn wb-btn-lg wb-btn-primary group">
              Get Started
              <Icon name="arrow" className="wb-arrow h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
