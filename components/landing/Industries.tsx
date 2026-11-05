import Link from 'next/link';
import Icon from '@/components/Icon';
import { businesses, businessHref, type Business } from '@/content/businesses';
import { delay } from '@/lib/motion';
import { SectionIntro } from './primitives';

const groups: Array<{ id: Business['group']; title: string; hinglish: string }> = [
  { id: 'shop', title: 'Shops', hinglish: 'Dukaan' },
  { id: 'service', title: 'Services and trades', hinglish: 'Kaam / service' },
];

function Tile({ business, index }: { business: Business; index: number }) {
  return (
    <li className="wb-reveal" style={delay((index % 4) * 50)}>
      <Link
        href={businessHref(business)}
        className="wb-card group flex h-full items-start gap-3.5 rounded-2xl border border-border bg-surface p-4 sm:p-5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name={business.icon} className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-ink">{business.label}</span>
          <span className="mt-0.5 block text-sm text-ink-soft">{business.examples}</span>
        </span>
        <Icon
          name="arrow"
          className="ml-auto mt-1 h-4 w-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </Link>
    </li>
  );
}

/**
 * "Who it's for": one tile per business type. Tiles link to that business's
 * own page, or to its free bill-format guide where no page exists yet.
 */
export default function Industries() {
  return (
    <section id="industries" className="scroll-mt-20 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <SectionIntro
          kicker="Who it's for"
          title="One app for every shop and every trade."
          lead="If you give your customer a bill, wbill is for you — at a shop counter or after a job at their home. Choose your business to see a sample bill."
        />

        {groups.map((group) => (
          <div key={group.id} className="mt-12">
            <h3 className="flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">
              {group.title}
              <span className="font-normal normal-case tracking-normal" lang="hi-Latn">
                · {group.hinglish}
              </span>
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {businesses
                .filter((business) => business.group === group.id)
                .map((business, index) => (
                  <Tile key={business.slug} business={business} index={index} />
                ))}
            </ul>
          </div>
        ))}

        <p className="mt-10 rounded-2xl border border-border bg-canvas p-5 text-sm leading-relaxed text-ink-soft">
          <span className="font-medium text-ink">Don&rsquo;t see your business? </span>
          Caterers, carpenters, tutors, transporters, small traders — if you write bills, wbill works
          the same way: items or work charges, a total, and a PDF on WhatsApp.{' '}
          <a href="/login" className="font-medium text-primary hover:underline">
            sign up
          </a>{' '}
          and tell us what you do.
        </p>
      </div>
    </section>
  );
}
