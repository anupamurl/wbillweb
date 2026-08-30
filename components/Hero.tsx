import WaitlistForm from './WaitlistForm';
import BillMockup from './BillMockup';
import Icon, { type IconName } from './Icon';
import { delay, drift } from '@/lib/motion';

const assurances: Array<{ icon: IconName; title: string; detail: string }> = [
  { icon: 'key', title: 'No password to remember', detail: 'Sign in with your phone number and an OTP.' },
  { icon: 'bolt', title: 'No onboarding course', detail: 'Add your business, send your first bill.' },
  { icon: 'shield', title: 'Your data stays yours', detail: 'Deletion on request, never sold on.' },
];

export default function Hero() {
  return (
    <section id="waitlist" className="relative isolate overflow-hidden border-b border-border">
      {/* Decorative colour wash. */}
      <div className="wb-aurora" aria-hidden="true">
        <div
          className="wb-blob left-[-12%] top-[-22%] h-[34rem] w-[34rem] bg-primary/25"
          style={drift(0, 24)}
        />
        <div
          className="wb-blob right-[-16%] top-[-10%] h-[30rem] w-[30rem] bg-info/20"
          style={drift(-6000, 28)}
        />
        <div
          className="wb-blob bottom-[-30%] left-[38%] h-[26rem] w-[26rem] bg-success/15"
          style={drift(-12000, 32)}
        />
      </div>
      <div className="wb-grid" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p
              className="wb-in inline-flex items-center gap-2 rounded-full border border-primary/25 bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-primary backdrop-blur"
              style={delay(0)}
            >
              <span className="wb-halo relative inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Early access is open — free while we build
            </p>

            <h1
              className="wb-in mt-6 text-[2.6rem] font-bold leading-[1.06] tracking-[-0.03em] text-text-primary sm:text-6xl"
              style={delay(90)}
            >
              Your bill, ready to send in{' '}
              <span className="wb-gradient-text">seconds.</span>
            </h1>

            <p
              className="wb-in mt-6 max-w-xl text-lg leading-relaxed text-text-secondary"
              style={delay(170)}
            >
              Build a professional, GST-ready bill on your phone and send it straight to your
              customer on WhatsApp — standing right there at the job. No laptop, no accounting
              software, no learning curve.
            </p>

            <div className="wb-in mt-9" style={delay(250)}>
              <WaitlistForm />
              <p className="mt-3 text-xs text-text-secondary">
                Free while in early access. No spam — one email when we launch.
              </p>
            </div>

            <div className="wb-in mt-9 flex flex-wrap gap-2" style={delay(330)}>
              {['App Store', 'Google Play'].map((store) => (
                <span
                  key={store}
                  aria-disabled="true"
                  title="Coming soon"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3.5 py-2 text-xs font-medium text-text-disabled backdrop-blur"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-text-disabled" />
                  {store} — coming soon
                </span>
              ))}
            </div>
          </div>

          <BillMockup />
        </div>

        {/* Trust row — every line here is something the app actually does today. */}
        <ul className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {assurances.map((item, index) => (
            <li
              key={item.title}
              className="wb-in flex items-start gap-3 bg-surface/80 p-5 backdrop-blur"
              style={delay(420 + index * 80)}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name={item.icon} className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-text-primary">{item.title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-text-secondary">
                  {item.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
