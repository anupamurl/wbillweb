import type { Metadata } from 'next';
import Link from 'next/link';
import Faq from '@/components/Faq';
import FaqJsonLd from '@/components/FaqJsonLd';
import Icon from '@/components/Icon';
import { Eyebrow } from '@/components/landing/primitives';
import { supportFaq } from '@/content/supportFaq';
import { brand } from '@/lib/brand';
import { delay } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Get help with WBill. Email support@wbill.app and we reply within one business day, or find answers to the questions we get asked most.',
  alternates: { canonical: `${brand.url}/support/` },
};

const topics = [
  { title: 'Signing in', body: 'OTP codes, Google sign-in and linking both to one account.' },
  { title: 'Bills and records', body: 'Creating bills, finding past bills and customer history.' },
  { title: 'Your data', body: 'Exporting, correcting or deleting your business data.' },
];

export default function SupportPage() {
  return (
    <main>
      <section className="wb-container pb-16 pt-20 sm:pt-28">
        <Eyebrow className="wb-in">Support</Eyebrow>
        <h1 className="wb-in wb-hero-title mt-6 max-w-4xl text-ink" style={delay(60)}>
          How can we help?
        </h1>
        <p className="wb-in wb-lead mt-6 max-w-xl" style={delay(120)}>
          Something not working, a question about your bills, or a request about your data? Write to us and a person
          will reply.
        </p>

        <div className="wb-in mt-14 grid gap-4 lg:grid-cols-[1.2fr_1fr]" style={delay(180)}>
          <div className="flex flex-col justify-between gap-10 rounded-[1.75rem] bg-ink p-8 text-canvas sm:p-10">
            <div>
              <p className="text-sm text-canvas/60">Email support</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{brand.email}</p>
              <p className="mt-3 text-sm text-canvas/60">We reply within one business day, Monday to Friday.</p>
            </div>
            <a href={`mailto:${brand.email}`} className="wb-btn wb-btn-lg group self-start bg-canvas text-ink hover:bg-canvas/90">
              Write to us
              <Icon name="arrow" className="wb-arrow h-4 w-4" />
            </a>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-[1.75rem] border border-line bg-line">
            {topics.map((topic) => (
              <li key={topic.title} className="bg-surface p-6">
                <p className="font-semibold text-ink">{topic.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{topic.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="support-faq" className="wb-section border-t border-line">
        <div className="wb-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 id="support-faq" className="wb-h2 mt-5 text-ink">
              Common questions
            </h2>
            <ul className="mt-8 space-y-3 text-sm">
              <li>
                <Link href="/privacy/" className="group inline-flex items-center gap-1.5 text-ink">
                  <span className="wb-link">Privacy policy</span>
                  <Icon name="arrow" className="wb-arrow h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/terms/" className="group inline-flex items-center gap-1.5 text-ink">
                  <span className="wb-link">Terms of service</span>
                  <Icon name="arrow" className="wb-arrow h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/invoice-format/" className="group inline-flex items-center gap-1.5 text-ink">
                  <span className="wb-link">Bill format guides</span>
                  <Icon name="arrow" className="wb-arrow h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
          <Faq items={supportFaq} />
        </div>
        <FaqJsonLd items={supportFaq} />
      </section>
    </main>
  );
}
