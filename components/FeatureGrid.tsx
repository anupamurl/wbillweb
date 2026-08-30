import Icon, { type IconName } from './Icon';
import SectionHeading from './SectionHeading';
import { delay } from '@/lib/motion';

const features: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'percent',
    title: 'GST and discounts, handled',
    description:
      'A tax rate on every item, discounts where you need them, and totals computed on our server — so the number on the bill is the number you meant.',
  },
  {
    icon: 'document',
    title: 'Branded PDF bills',
    description:
      'Your business name, address and GSTIN on a clean bill your customer will take seriously. Generated and stored the moment you issue it.',
  },
  {
    icon: 'chat',
    title: 'Delivered on WhatsApp',
    description:
      'Share the finished bill without leaving the app. No email address to ask for, and nothing for your customer to install.',
  },
  {
    icon: 'clock',
    title: 'Paid, pending, overdue',
    description:
      'Every bill carries a status, and pending turns to overdue on its own once the due date passes. Follow-ups stop being guesswork.',
  },
  {
    icon: 'users',
    title: 'Customers and items, saved',
    description:
      'Add a customer or a service once — with its default tax rate — then pick it on every bill after that. Repeat jobs take seconds.',
  },
  {
    icon: 'chart',
    title: 'One dashboard',
    description:
      'Total sales, outstanding, overdue and invoice count, plus your recent bills — the whole business on one screen.',
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading
          eyebrow="What you get"
          title="Everything a bill needs. Nothing it doesn’t."
          lead="Six things, each one shipped and working today. We would rather do a short list properly than a long list badly."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="wb-card wb-reveal group rounded-2xl border border-border bg-surface p-6"
              style={delay((index % 3) * 80)}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon name={feature.icon} className="h-5 w-5" />
              </span>
              <p className="mt-5 text-base font-semibold tracking-[-0.01em] text-text-primary">
                {feature.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <p className="wb-reveal mt-8 text-sm text-text-secondary">
          GST-ready means your GSTIN on the business profile, a tax rate per item, and tax shown on
          the bill. For tax returns and compliance advice, talk to your tax professional.
        </p>
      </div>
    </section>
  );
}
