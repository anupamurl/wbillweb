import WaitlistForm from './WaitlistForm';
import BillMockup from './BillMockup';

export default function Hero() {
  return (
    <section id="waitlist" className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Your bill, ready to send in seconds.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-text-secondary">
            Create a professional bill on your phone and send it straight to your customer on
            WhatsApp. No laptop, no accounting software, no learning curve.
          </p>
          <div className="mt-8">
            <WaitlistForm />
            <p className="mt-3 text-xs text-text-secondary">
              Free while in early access. No spam — one email when we launch.
            </p>
          </div>
          <div className="mt-8 flex gap-2">
            <span
              aria-disabled="true"
              title="Coming soon"
              className="rounded-md border border-border px-3 py-1.5 text-xs text-text-disabled"
            >
              App Store — coming soon
            </span>
            <span
              aria-disabled="true"
              title="Coming soon"
              className="rounded-md border border-border px-3 py-1.5 text-xs text-text-disabled"
            >
              Google Play — coming soon
            </span>
          </div>
        </div>
        <BillMockup />
      </div>
    </section>
  );
}
