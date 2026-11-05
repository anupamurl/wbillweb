import type { Metadata } from 'next';
import Link from 'next/link';
import { invoiceFormatGuides } from '@/content/invoiceFormatGuides';
import type { InvoiceFormatGuide } from '@/content/types';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import Icon from '@/components/Icon';
import { brand } from '@/lib/brand';
import { delay } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'Free Bill Formats for Shops and Services',
  description:
    'Free bill formats for Indian shops and service businesses: kirana, hardware, mobile shop, electrician, plumber and more, with or without GST.',
  alternates: { canonical: `${brand.url}/invoice-format/` },
};

const groups: Array<{ id: InvoiceFormatGuide['group']; title: string; lead: string }> = [
  { id: 'shop', title: 'Shop bill formats', lead: 'For kirana, hardware, clothing, mobile and other shops.' },
  { id: 'service', title: 'Service bill formats', lead: 'For work done at a customer’s home or site — material plus labour.' },
  { id: 'general', title: 'For any business', lead: 'GST rules that apply whatever you sell.' },
];

function GuideCard({ guide, index }: { guide: InvoiceFormatGuide; index: number }) {
  return (
    <Link
      href={`/invoice-format/${guide.slug}`}
      className="wb-card wb-reveal group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6"
      style={delay((index % 2) * 70)}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{guide.audience}</p>
        <p className="mt-2.5 text-lg font-semibold tracking-[-0.01em] text-text-primary">{guide.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{guide.description}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        Read the guide
        <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export default function InvoiceFormatHub() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Bill formats', path: '/invoice-format/' },
        ]}
      />
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <p className="wb-in text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Free reference
        </p>
        <h1
          className="wb-in mt-3 text-4xl font-bold tracking-[-0.03em] text-text-primary sm:text-5xl"
          style={delay(60)}
        >
          Free bill formats for shops and services
        </h1>
        <p
          className="wb-in mt-5 max-w-2xl text-lg leading-relaxed text-text-secondary"
          style={delay(120)}
        >
          Getting a bill right is mostly about knowing what has to be on it — with or without GST.
          Each guide below gives you the required fields, a worked example with real numbers, and
          the mistakes that trip people up most. No signup, no download.
        </p>

        {groups.map((group) => {
          const guides = invoiceFormatGuides.filter((guide) => guide.group === group.id);
          if (guides.length === 0) return null;
          return (
            <section key={group.id} aria-labelledby={`group-${group.id}`} className="mt-14">
              <h2 id={`group-${group.id}`} className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
                {group.title}
              </h2>
              <p className="mt-1.5 text-sm text-text-secondary">{group.lead}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {guides.map((guide, index) => (
                  <GuideCard key={guide.slug} guide={guide} index={index} />
                ))}
              </div>
            </section>
          );
        })}

        <div className="wb-reveal mt-14 rounded-[1.75rem] bg-ink p-8 text-canvas sm:p-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">Or stop formatting bills by hand</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-canvas/65">
            With WBill you add the customer and items, and the bill is numbered, dated, totalled and kept in your
            records automatically.
          </p>
          <Link href="/signup/" className="wb-btn wb-btn-md wb-btn-primary group mt-6">
            Get started free
            <Icon name="arrow" className="wb-arrow h-4 w-4" />
          </Link>
        </div>
      </main>
    </>
  );
}
