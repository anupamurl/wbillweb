import Icon, { type IconName } from './Icon';
import SectionHeading from './SectionHeading';
import { delay } from '@/lib/motion';

const points: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'phone',
    title: 'No laptop required',
    description:
      'Create, generate and send a bill entirely from your phone — standing at the job site, before you’ve packed the tools away.',
  },
  {
    icon: 'key',
    title: 'Sign in with your phone number',
    description:
      'A one-time code, not a password to remember or a signup form to fill out. The number you already give customers is the account.',
  },
  {
    icon: 'bolt',
    title: 'Your first bill in minutes',
    description:
      'There is no onboarding course to sit through. Add your business details once and you are billing on the same visit.',
  },
];

const leftOut = [
  'Ledgers, journals and balance sheets',
  'Inventory and stock management',
  'A dashboard that needs a desk',
  'An app your customer has to install',
];

export default function BuiltForPhone() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading
          eyebrow="Built mobile-first"
          title={
            <>
              Made for the phone in your hand, not a desk you’re{' '}
              <span className="wb-gradient-text">not sitting at</span>
            </>
          }
          lead="wbill isn’t accounting software with a mobile app bolted on. It was built for the moment you’re standing in front of a customer and need to hand them a bill."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ul className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            {points.map((point, index) => (
              <li
                key={point.title}
                className="wb-card wb-reveal flex gap-4 rounded-2xl border border-border bg-surface p-6 lg:items-start"
                style={delay(index * 80)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={point.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-semibold tracking-[-0.01em] text-text-primary">
                    {point.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* The other half of the positioning: what we deliberately don't build. */}
          <div
            className="wb-reveal rounded-2xl border border-border bg-surface-variant/60 p-7"
            style={delay(120)}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-text-disabled/15 text-text-secondary">
              <Icon name="layers" className="h-5 w-5" />
            </span>
            <p className="mt-5 text-base font-semibold tracking-[-0.01em] text-text-primary">
              What wbill leaves out, on purpose
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
              Every feature we don’t build is a screen you never have to learn. This is the list we
              are proud of.
            </p>
            <ul className="mt-6 space-y-3">
              {leftOut.map((entry) => (
                <li key={entry} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-text-disabled/15 text-text-disabled">
                    <Icon name="cross" className="h-3 w-3" />
                  </span>
                  {entry}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
