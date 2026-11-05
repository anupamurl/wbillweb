import Icon from './Icon';
import { delay } from '@/lib/motion';

/** The single closing call to action on the landing page: sign up or log in. */
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
          wbill is free to get started. Sign up with your phone number or Google account and make your first bill in minutes.
        </p>
        <div className="wb-reveal mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center" style={delay(120)}>
          <a
            href="/login"
            className="wb-cta wb-btn wb-btn-lg group w-full bg-primary text-white sm:w-auto"
          >
            Login / Sign Up
            <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </div>
        <p className="mt-4 text-xs text-white/60">No spam. No card. Free to get started.</p>
      </div>
    </section>
  );
}
