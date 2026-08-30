import Icon, { type IconName } from './Icon';
import SectionHeading from './SectionHeading';
import { delay } from '@/lib/motion';

const steps: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'receipt',
    title: 'Create the bill',
    description:
      'Pick a saved customer and saved items. Tax per line, discounts, and every total are calculated for you.',
  },
  {
    icon: 'document',
    title: 'Generate the PDF',
    description:
      'A clean, branded bill carrying your business name, GSTIN and a sequential invoice number that can never collide.',
  },
  {
    icon: 'chat',
    title: 'Send on WhatsApp',
    description:
      'Share it from inside the app. Your customer opens a PDF in the chat they already use — no app to install.',
  },
  {
    icon: 'clock',
    title: 'Track the payment',
    description:
      'Issued, paid, pending or overdue — status follows the due date on its own, so you always know who owes you.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-surface-variant/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading
          eyebrow="The whole product"
          title={
            <>
              Four taps from job done to{' '}
              <span className="wb-gradient-text">bill delivered</span>
            </>
          }
          lead="wbill does one loop, and does it faster than anything else you could reach for. That is the entire pitch."
        />

        <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Connector rail behind the step markers. */}
          <span
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <li
              key={step.title}
              className="wb-reveal relative lg:pr-4"
              style={delay(index * 90)}
            >
              <div className="relative flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-primary shadow-sm">
                  <Icon name={step.icon} className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold tabular-nums text-text-disabled">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="mt-5 text-lg font-semibold tracking-[-0.01em] text-text-primary">
                {step.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
