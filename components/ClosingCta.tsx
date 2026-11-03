import WaitlistForm from './WaitlistForm';
import { delay } from '@/lib/motion';

/** The single place every "Join early access" link on the page lands. */
export default function ClosingCta() {
  return (
    <section id="start" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-night px-6 py-16 text-center sm:px-12 sm:py-24">
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_20rem_at_20%_0%,color-mix(in_oklab,var(--wbill-primary)_45%,transparent),transparent_70%),radial-gradient(36rem_20rem_at_85%_100%,color-mix(in_oklab,var(--wb-violet)_40%,transparent),transparent_70%)]"
          aria-hidden="true"
        />
        <h2 className="wb-reveal wb-display mx-auto max-w-3xl text-4xl text-white sm:text-6xl">
          Give your next customer a bill they can keep.
        </h2>
        <p
          className="wb-reveal mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
          style={delay(60)}
        >
          WBill is free during early access. Leave your email and we will send you one message on
          the day the app is live.
        </p>
        <div className="wb-reveal mt-10 [&_input]:border-white/15 [&_input]:bg-white [&_input]:text-[#0A1633]" style={delay(120)}>
          <WaitlistForm source="landing-closing" align="center" />
          <p className="mt-4 text-xs text-white/60">No spam. No card. One email at launch.</p>
        </div>
      </div>
    </section>
  );
}
