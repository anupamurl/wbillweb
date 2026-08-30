import WaitlistForm from './WaitlistForm';
import { delay, drift } from '@/lib/motion';

/**
 * Section 9 of the landing page. Nobody scrolls back up to the hero form.
 */
export default function ClosingCta() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="wb-aurora" aria-hidden="true">
        <div
          className="wb-blob left-[8%] top-[-40%] h-[26rem] w-[26rem] bg-primary/20"
          style={drift(0, 26)}
        />
        <div
          className="wb-blob right-[6%] bottom-[-45%] h-[24rem] w-[24rem] bg-success/15"
          style={drift(-9000, 30)}
        />
      </div>
      <div className="wb-grid" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h2 className="wb-reveal text-3xl font-bold tracking-[-0.025em] text-text-primary sm:text-4xl">
          Stop writing bills by hand.
        </h2>
        <p
          className="wb-reveal mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg"
          style={delay(60)}
        >
          wbill isn’t on the App Store or Play Store yet. Leave your email and we’ll send you one
          message on the day it is — nothing before, nothing after.
        </p>
        <div className="wb-reveal mt-9" style={delay(120)}>
          <WaitlistForm source="landing-closing" align="center" />
          <p className="mt-3 text-xs text-text-secondary">
            Free while in early access. We’ll announce pricing before anything changes.
          </p>
        </div>
      </div>
    </section>
  );
}
