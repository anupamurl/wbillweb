import Link from 'next/link';
import Icon from './Icon';
import SectionHeading from './SectionHeading';
import { delay } from '@/lib/motion';

const guides = [
  { label: 'Electricians', blurb: 'Callout, parts and labour on one bill', href: '/invoice-format/electrician' },
  { label: 'Plumbers', blurb: 'Emergency jobs billed before you leave', href: '/invoice-format/plumber' },
  { label: 'AC & appliance service', blurb: 'Service visits, gas top-ups, AMC work', href: '/invoice-format/ac-service' },
  { label: 'Freelancers & consultants', blurb: 'Project and retainer invoices, GST-ready', href: '/invoice-format/freelancer' },
];

const trades = [
  'Car & bike workshops',
  'Designers & photographers',
  'Contractors',
  'Interior designers',
  'Small retailers',
  'Coaching businesses',
  'Digital agencies',
  'Pest control',
  'Carpenters',
  'Caterers',
  'Tailors',
  'Mobile repair shops',
];

export default function WhoItsFor() {
  return (
    <section id="who-its-for" className="border-b border-border bg-surface-variant/40">
      <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <SectionHeading
          eyebrow="Who it’s for"
          title="Built for the businesses that already run on WhatsApp"
          lead="If that is where you talk to your customers, wbill fits the way you already work. Four trades have a free bill-format guide — start there."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {guides.map((guide, index) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="wb-card wb-reveal group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5"
              style={delay(index * 70)}
            >
              <div>
                <p className="text-base font-semibold tracking-[-0.01em] text-text-primary">
                  {guide.label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{guide.blurb}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Bill format guide
                <Icon
                  name="arrow"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Everyone else, as a slow ticker. Decorative: the trades above and the
          guide hub already carry every real link. */}
      <div className="wb-marquee mt-12 overflow-hidden py-4" aria-hidden="true">
        <div className="wb-marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center gap-3 pr-3">
              {trades.map((trade) => (
                <li
                  key={trade}
                  className="whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary"
                >
                  {trade}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <p className="sr-only">
        wbill also suits {trades.join(', ')} and other small service businesses.
      </p>
      <div className="pb-20" />
    </section>
  );
}
