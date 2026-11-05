import Link from 'next/link';
import Icon from '@/components/Icon';
import { delay } from '@/lib/motion';

/** The close: one line, one action, and the brand's own material — a bill. */
export default function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="wb-container pb-24 pt-8 sm:pb-32">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-night px-6 py-20 text-center text-white sm:px-12 sm:py-28">
        {/* Receipt rules drifting up behind the type */}
        <div className="absolute inset-0 -z-10 opacity-[0.07] [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_28px)] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000,transparent)]" aria-hidden="true" />
        <div className="absolute left-1/2 top-0 -z-10 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" aria-hidden="true" />

        <p className="wb-reveal font-mono text-xs uppercase tracking-[0.14em] text-white/50">WB-0001 · Your first bill</p>
        <h2 id="final-title" className="wb-reveal wb-hero-title mx-auto mt-6 max-w-4xl" style={delay(60)}>
          Make every purchase count.
        </h2>
        <p className="wb-reveal mx-auto mt-7 max-w-md text-lg leading-relaxed text-white/65" style={delay(120)}>
          Start creating digital purchase records with WBill.
        </p>
        <div className="wb-reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row" style={delay(180)}>
          <Link href="/signup/" className="wb-btn wb-btn-lg wb-btn-primary group w-full sm:w-auto">
            Get Started
            <Icon name="arrow" className="wb-arrow h-4 w-4" />
          </Link>
          <Link href="/pricing/" className="wb-btn wb-btn-lg w-full text-white/80 hover:text-white sm:w-auto">
            See pricing
          </Link>
        </div>
        <p className="wb-reveal mt-6 text-xs text-white/40" style={delay(220)}>
          Free to start · Phone number or Google sign-in
        </p>
      </div>
    </section>
  );
}
