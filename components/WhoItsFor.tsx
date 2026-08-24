import Link from 'next/link';

const linkedOccupations = [
  { label: 'Electricians', href: '/invoice-format/electrician' },
  { label: 'Plumbers', href: '/invoice-format/plumber' },
  { label: 'AC & appliance service', href: '/invoice-format/ac-service' },
  { label: 'Freelancers & consultants', href: '/invoice-format/freelancer' },
];

const plainOccupations = [
  'Car & bike workshops',
  'Designers & photographers',
  'Contractors',
  'Interior designers',
  'Small retailers',
  'Coaching businesses',
  'Digital agencies',
];

export default function WhoItsFor() {
  return (
    <section id="who-its-for" className="border-t border-border bg-surface-variant/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Built for the businesses that run on WhatsApp
        </h2>
        <p className="mt-3 max-w-2xl text-text-secondary">
          If you talk to your customers on WhatsApp, wbill fits how you already work.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {linkedOccupations.map((occupation) => (
            <Link
              key={occupation.href}
              href={occupation.href}
              className="rounded-full border border-primary/30 bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              {occupation.label}
            </Link>
          ))}
          {plainOccupations.map((label) => (
            <span key={label} className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
